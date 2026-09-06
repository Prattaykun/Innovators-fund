import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { sendNewRequestEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    let query = supabase
      .from('fund_requests')
      .select(`
        *,
        requester:members!fund_requests_requested_by_fkey(id, name, email, role),
        reviewer:members!fund_requests_reviewed_by_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ requests: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Please log in to raise a fund request' }, { status: 401 });
    }

    const { title, amount, reason, category } = await req.json();

    const numericAmount = Number(amount);
    if (!title || !numericAmount || numericAmount <= 0 || !reason) {
      return NextResponse.json(
        { error: 'Please provide a valid title, positive amount, and reason' },
        { status: 400 }
      );
    }

    // Check available balance
    const { data: settings } = await supabase.from('fund_settings').select('*').eq('id', 1).single();
    const totalInitial = Number(settings?.total_initial_amount || 150000);

    const { data: approvedRequests } = await supabase
      .from('fund_requests')
      .select('amount')
      .eq('status', 'approved');

    const totalApproved = (approvedRequests || []).reduce((acc: number, r: any) => acc + Number(r.amount), 0);
    const availableBalance = totalInitial - totalApproved;

    if (numericAmount > availableBalance) {
      return NextResponse.json(
        {
          error: `Requested amount (₹${numericAmount.toLocaleString('en-IN')}) exceeds current available pool balance (₹${availableBalance.toLocaleString('en-IN')})`,
        },
        { status: 400 }
      );
    }

    // Insert request
    const { data: newRequest, error: insertError } = await supabase
      .from('fund_requests')
      .insert({
        requested_by: session.id,
        title: title.trim(),
        amount: numericAmount,
        reason: reason.trim(),
        category: category?.trim() || 'General',
        status: 'pending',
      })
      .select('*')
      .single();

    if (insertError || !newRequest) {
      throw insertError || new Error('Could not create request');
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      action_type: 'REQUEST_CREATED',
      actor_id: session.id,
      actor_name: session.name,
      request_id: newRequest.id,
      amount: numericAmount,
      balance_before: availableBalance,
      balance_after: availableBalance, // Not deducted yet until approved
      details: {
        title: newRequest.title,
        reason: newRequest.reason,
        category: newRequest.category,
        note: `New fund request raised for ₹${numericAmount.toLocaleString('en-IN')}`,
      },
    });

    // Send email notification to all members/admins who have email configured
    const { data: allMembersWithEmail } = await supabase
      .from('members')
      .select('email, role, name')
      .not('email', 'is', null)
      .eq('is_active', true);

    const recipientEmails = (allMembersWithEmail || [])
      .map((m: any) => m.email?.trim())
      .filter((e: any): e is string => Boolean(e && e.includes('@')));

    if (recipientEmails.length > 0) {
      // Fire and record email sending in background
      sendNewRequestEmail({
        toEmails: Array.from(new Set(recipientEmails)),
        requesterName: session.name,
        amount: numericAmount,
        reason: newRequest.reason,
        category: newRequest.category,
        currentBalance: availableBalance,
        remainingAfter: Math.max(0, availableBalance - numericAmount),
        requestId: newRequest.id,
      }).catch((err) => console.error('Background email dispatch failed:', err));
    }

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: 'Fund request created and audit recorded',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}