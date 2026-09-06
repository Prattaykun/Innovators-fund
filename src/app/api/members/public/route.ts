import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    const isAdmin = session?.role === 'admin';

    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, role, email, is_active, direct_token, token_used, created_at')
      .order('role', { ascending: true }) // admins first
      .order('name', { ascending: true });

    if (error) throw error;

    // Redact direct_token unless viewer is admin or viewing their own record
    const sanitizedMembers = (members || []).map((m: any) => {
      const isSelf = session && session.id === m.id;
      const canViewToken = isAdmin || isSelf;

      return {
        ...m,
        direct_token: canViewToken ? m.direct_token : null,
      };
    });

    return NextResponse.json({ members: sanitizedMembers });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch members' }, { status: 500 });
  }
}