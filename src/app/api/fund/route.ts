import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FundMetrics } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: settings } = await supabase
      .from('fund_settings')
      .select('*')
      .eq('id', 1)
      .single();

    const totalInitial = Number(settings?.total_initial_amount || 150000);

    const { data: requests, error } = await supabase
      .from('fund_requests')
      .select('amount, status');

    if (error) {
      throw error;
    }

    let totalApproved = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    (requests || []).forEach((r: any) => {
      const amt = Number(r.amount);
      if (r.status === 'approved') {
        totalApproved += amt;
        approvedCount++;
      } else if (r.status === 'pending') {
        pendingAmount += amt;
        pendingCount++;
      } else if (r.status === 'rejected') {
        rejectedCount++;
      }
    });

    const availableBalance = Math.max(0, totalInitial - totalApproved);

    const metrics: FundMetrics = {
      totalInitial,
      totalApproved,
      availableBalance,
      pendingAmount,
      pendingCount,
      approvedCount,
      rejectedCount,
    };

    return NextResponse.json({ metrics, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error fetching fund metrics' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { getSessionUser } = await import('@/lib/auth');
    const user = await getSessionUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Deposit amount must be a positive number.' }, { status: 400 });
    }

    // Fetch current settings
    const { data: currentSettings, error: fetchErr } = await supabase
      .from('fund_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      throw fetchErr;
    }

    const currentTotal = Number(currentSettings?.total_initial_amount || 150000);
    const newTotal = currentTotal + amount;

    // Update settings table
    const { error: updateErr } = await supabase
      .from('fund_settings')
      .upsert({
        id: 1,
        total_initial_amount: newTotal,
        currency: 'INR',
        updated_at: new Date().toISOString(),
      });

    if (updateErr) {
      throw updateErr;
    }

    // Calculate updated metrics for balance
    const { data: approvedRequests } = await supabase
      .from('fund_requests')
      .select('amount')
      .eq('status', 'approved');

    const totalApproved = (approvedRequests || []).reduce((acc: number, r: any) => acc + Number(r.amount), 0);
    const balanceBefore = Math.max(0, currentTotal - totalApproved);
    const balanceAfter = Math.max(0, newTotal - totalApproved);

    // Insert into audit trail
    await supabase.from('audit_logs').insert({
      action_type: 'FUND_DEPOSITED',
      actor_id: user.id,
      actor_name: user.name,
      amount: amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      details: {
        previousPoolTotal: currentTotal,
        newPoolTotal: newTotal,
        depositAmount: amount,
        notes: notes || 'Capital addition by Administrator',
        timestamp: new Date().toISOString(),
      },
    });

    // Send Resend notifications to members
    try {
      const { sendPoolDepositEmail } = await import('@/lib/resend');
      const { data: membersWithEmail } = await supabase
        .from('members')
        .select('email')
        .not('email', 'is', null)
        .eq('is_active', true);

      const toEmails = (membersWithEmail || [])
        .map((m: any) => m.email)
        .filter((e: string) => Boolean(e) && e.includes('@'));

      if (toEmails.length > 0) {
        await sendPoolDepositEmail({
          toEmails,
          adminName: user.name,
          depositAmount: amount,
          newTotalInitial: newTotal,
          newAvailableBalance: balanceAfter,
          notes: notes || undefined,
        });
      }
    } catch (emailErr) {
      console.error('Email dispatch error on deposit:', emailErr);
    }

    return NextResponse.json({
      success: true,
      depositAmount: amount,
      previousTotal: currentTotal,
      newTotalInitial: newTotal,
      availableBalance: balanceAfter,
    });
  } catch (err: any) {
    console.error('Error adding funds to pool:', err);
    return NextResponse.json({ error: err?.message || 'Failed to deposit funds' }, { status: 500 });
  }
}