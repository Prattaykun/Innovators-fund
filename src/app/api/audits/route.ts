import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '20')));
    const actionType = searchParams.get('action');
    const search = searchParams.get('search');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (actionType && actionType !== 'ALL') {
      query = query.eq('action_type', actionType);
    }

    if (search && search.trim()) {
      query = query.or(`actor_name.ilike.%${search.trim()}%,details->>note.ilike.%${search.trim()}%`);
    }

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return NextResponse.json({
      audits: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch audits' }, { status: 500 });
  }
}