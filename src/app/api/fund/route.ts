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