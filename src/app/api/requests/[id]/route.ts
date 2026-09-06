import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { sendAuditStatusEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only snehansh and prattay (admins) can approve or reject
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators (Snehansh and Prattay) can approve or reject fund requests' },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;
    const body = await req.json();
    const { action, adminNotes } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be approve or reject' }, { status: 400 });
    }

    // Fetch existing request
    const { data: request, error: fetchError } = await supabase
      .from('fund_requests')
      .select('*, requester:members!fund_requests_requested_by_fkey(id, name, email)')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'pending') {
      return NextResponse.json(
        { error: `This request has already been ${request.status}` },
        { status: 400 }
      );
    }

    // Fetch current pool balance
    const { data: settings } = await supabase.from('fund_settings').select('*').eq('id', 1).single();
    const totalInitial = Number(settings?.total_initial_amount || 150000);
    const { data: approvedList } = await supabase
      .from('fund_requests')
      .select('amount')
      .eq('status', 'approved');

    const totalApproved = (approvedList || []).reduce((acc: number, r: any) => acc + Number(r.amount), 0);
    const availableBalance = totalInitial - totalApproved;

    const requestAmount = Number(request.amount);
    let newBalance = availableBalance;

    if (action === 'approve') {
      if (requestAmount > availableBalance) {
        return NextResponse.json(
          {
            error: `Cannot approve: Requested amount (₹${requestAmount.toLocaleString('en-IN')}) exceeds remaining pool (₹${availableBalance.toLocaleString('en-IN')})`,
          },
          { status: 400 }
        );
      }
      newBalance = availableBalance - requestAmount;
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: updatedRequest, error: updateError } = await supabase
      .from('fund_requests')
      .update({
        status: newStatus,
        reviewed_by: session.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes ? adminNotes.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateError || !updatedRequest) {
      throw updateError || new Error('Failed to update request status');
    }

    // Record audit log
    await supabase.from('audit_logs').insert({
      action_type: action === 'approve' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
      actor_id: session.id,
      actor_name: session.name,
      request_id: requestId,
      amount: requestAmount,
      balance_before: availableBalance,
      balance_after: newBalance,
      details: {
        title: request.title,
        status: newStatus,
        adminNotes: adminNotes || null,
        requester: request.requester?.name || request.requested_by,
        note: `Request for ₹${requestAmount.toLocaleString('en-IN')} was ${newStatus} by ${session.name}`,
      },
    });

    // Send email notifications to requester and admins
    const { data: notifyMembers } = await supabase
      .from('members')
      .select('email, role, name')
      .not('email', 'is', null)
      .eq('is_active', true);

    const recipientEmails = (notifyMembers || [])
      .map((m: any) => m.email?.trim())
      .filter((e: any): e is string => Boolean(e && e.includes('@')));

    if (recipientEmails.length > 0) {
      sendAuditStatusEmail({
        toEmails: Array.from(new Set(recipientEmails)),
        requesterName: request.requester?.name || request.requested_by,
        reviewerName: session.name,
        amount: requestAmount,
        status: newStatus as 'approved' | 'rejected',
        adminNotes: adminNotes || null,
        newBalance: newBalance,
        requestId: request.id,
      }).catch((err) => console.error('Status email dispatch error:', err));
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Request successfully ${newStatus}`,
      balance: newBalance,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}