import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, role, email, is_active, direct_token, created_at')
      .order('role', { ascending: true }) // admins first
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ members: members || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch members' }, { status: 500 });
  }
}