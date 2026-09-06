import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SESSION_COOKIE_NAME, SessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, token, username, password, memberId } = body;

    let member: any = null;

    if (type === 'token') {
      if (!token) {
        return NextResponse.json({ error: 'Direct access token is required' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('direct_token', token.trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Invalid or inactive access link' }, { status: 401 });
      }

      if (data.token_used) {
        return NextResponse.json(
          { error: 'This direct setup link has already been used and is expired. Please sign in with your password.' },
          { status: 401 }
        );
      }

      member = data;
    } else if (type === 'credentials') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .ilike('id', username.trim().toLowerCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Invalid credentials or user not found' }, { status: 401 });
      }
      if (data.password_hash !== password.trim()) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
      member = data;
    } else if (type === 'switch') {
      if (!memberId) {
        return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId.trim().toLowerCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Member not found or inactive' }, { status: 404 });
      }
      member = data;
    } else {
      return NextResponse.json({ error: 'Invalid login type' }, { status: 400 });
    }

    const sessionUser: SessionUser = {
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      directToken: member.direct_token,
    });

    response.cookies.set(SESSION_COOKIE_NAME, encodeURIComponent(JSON.stringify(sessionUser)), {
      path: '/',
      httpOnly: false, // Accessible to client state
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err?.message || 'Authentication error' }, { status: 500 });
  }
}