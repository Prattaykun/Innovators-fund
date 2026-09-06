import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SESSION_COOKIE_NAME, SessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword, email } = await req.json();

    if (!token || !token.trim()) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters long' }, { status: 400 });
    }

    const cleanToken = token.trim();

    // Verify token and status
    const { data: member, error: findError } = await supabase
      .from('members')
      .select('*')
      .eq('direct_token', cleanToken)
      .single();

    if (findError || !member) {
      return NextResponse.json(
        { error: 'This direct setup link is invalid or has already expired.' },
        { status: 400 }
      );
    }

    if (member.token_used) {
      return NextResponse.json(
        { error: 'This direct setup link has already been used and is expired.' },
        { status: 400 }
      );
    }

    const cleanPassword = newPassword.trim();
    const cleanEmail = email && typeof email === 'string' && email.trim().includes('@')
      ? email.trim().toLowerCase()
      : member.email;

    // Expire the token by setting token_used = true and direct_token = null
    const { data: updatedMember, error: updateError } = await supabase
      .from('members')
      .update({
        password_hash: cleanPassword,
        email: cleanEmail,
        token_used: true,
        password_changed: true,
        direct_token: null, // Expire token so it can never be used again!
        updated_at: new Date().toISOString(),
      })
      .eq('id', member.id)
      .select('*')
      .single();

    if (updateError || !updatedMember) {
      throw updateError || new Error('Failed to update member password');
    }

    // Record audit log
    await supabase.from('audit_logs').insert({
      action_type: 'PASSWORD_CHANGED',
      actor_id: member.id,
      actor_name: member.name,
      balance_before: 0,
      balance_after: 0,
      details: {
        note: `${member.name} completed initial password setup and activated their account. Direct setup link has expired.`,
      },
    });

    if (cleanEmail && cleanEmail !== member.email) {
      await supabase.from('audit_logs').insert({
        action_type: 'EMAIL_UPDATED',
        actor_id: member.id,
        actor_name: member.name,
        balance_before: 0,
        balance_after: 0,
        details: {
          note: `${member.name} set notification email to ${cleanEmail}`,
          email: cleanEmail,
        },
      });
    }

    const sessionUser: SessionUser = {
      id: updatedMember.id,
      name: updatedMember.name,
      role: updatedMember.role,
      email: updatedMember.email,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      message: 'Password successfully set and account activated! Direct link has expired.',
    });

    response.cookies.set(SESSION_COOKIE_NAME, encodeURIComponent(JSON.stringify(sessionUser)), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('Complete setup error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
