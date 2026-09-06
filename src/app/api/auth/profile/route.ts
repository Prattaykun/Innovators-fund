import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPassword, email } = await req.json();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    let passwordChanged = false;
    let emailChanged = false;

    if (newPassword && typeof newPassword === 'string' && newPassword.trim().length >= 4) {
      updates.password_hash = newPassword.trim();
      passwordChanged = true;
    }

    if (typeof email === 'string') {
      const cleanEmail = email.trim().toLowerCase();
      updates.email = cleanEmail || null;
      emailChanged = true;
    }

    const { data: member, error: updateError } = await supabase
      .from('members')
      .update(updates)
      .eq('id', session.id)
      .select('id, name, role, email, direct_token')
      .single();

    if (updateError || !member) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Get current fund balance for audit record
    const { data: settings } = await supabase.from('fund_settings').select('*').eq('id', 1).single();
    const totalInitial = Number(settings?.total_initial_amount || 150000);
    const { data: approvedRequests } = await supabase
      .from('fund_requests')
      .select('amount')
      .eq('status', 'approved');
    const totalApproved = (approvedRequests || []).reduce((acc: number, r: any) => acc + Number(r.amount), 0);
    const currentBalance = totalInitial - totalApproved;

    // Log audit entries
    if (passwordChanged) {
      await supabase.from('audit_logs').insert({
        action_type: 'PASSWORD_CHANGED',
        actor_id: session.id,
        actor_name: session.name,
        balance_before: currentBalance,
        balance_after: currentBalance,
        details: { note: `${session.name} updated their account password` },
      });
    }

    if (emailChanged) {
      await supabase.from('audit_logs').insert({
        action_type: 'EMAIL_UPDATED',
        actor_id: session.id,
        actor_name: session.name,
        balance_before: currentBalance,
        balance_after: currentBalance,
        details: {
          note: `${session.name} updated notification email to ${member.email || 'None'}`,
          email: member.email,
        },
      });
    }

    const updatedSession = {
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
    };

    const response = NextResponse.json({
      success: true,
      user: updatedSession,
      directToken: member.direct_token,
      message: 'Profile updated successfully',
    });

    response.cookies.set(SESSION_COOKIE_NAME, encodeURIComponent(JSON.stringify(updatedSession)), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}