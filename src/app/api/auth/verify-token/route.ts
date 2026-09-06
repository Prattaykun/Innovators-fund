import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token || !token.trim()) {
      return NextResponse.json({ valid: false, message: 'No token provided' }, { status: 400 });
    }

    const cleanToken = token.trim();

    const { data: member, error } = await supabase
      .from('members')
      .select('id, name, role, email, is_active, token_used, direct_token')
      .eq('direct_token', cleanToken)
      .single();

    if (error || !member) {
      return NextResponse.json({
        valid: false,
        reason: 'INVALID',
        message: 'This direct access link is invalid or does not exist.',
      });
    }

    if (!member.is_active) {
      return NextResponse.json({
        valid: false,
        reason: 'INACTIVE',
        message: 'This member account is currently deactivated. Please contact an administrator.',
      });
    }

    if (member.token_used) {
      return NextResponse.json({
        valid: false,
        reason: 'EXPIRED',
        message: 'This direct setup link has already been used and is expired. Please sign in with your password.',
        username: member.id,
      });
    }

    return NextResponse.json({
      valid: true,
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
        email: member.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
