import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, name, role, email, direct_token, is_active, created_at')
      .eq('id', session.id)
      .single();

    if (!member || !member.is_active) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: member.id,
        name: member.name,
        role: member.role,
        email: member.email,
        directToken: member.direct_token,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ user: null, error: err?.message }, { status: 500 });
  }
}