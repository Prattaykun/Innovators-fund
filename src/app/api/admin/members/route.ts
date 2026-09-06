import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('members')
      .select('id, name, role, email, is_active, direct_token, token_used, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: true });

    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,id.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return NextResponse.json({
      members: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { name, role, email, initialPassword } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    const cleanName = name.trim();
    const id = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!id) {
      return NextResponse.json({ error: 'Invalid name characters' }, { status: 400 });
    }

    // Check if ID already exists
    const { data: existing } = await supabase.from('members').select('id').eq('id', id).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: `Member with username "${id}" already exists` }, { status: 400 });
    }

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const directToken = `token-${id}-${randomSuffix}`;
    const passwordHash = initialPassword?.trim() || 'innovate123';
    const memberRole = role === 'admin' ? 'admin' : 'member';

    const { data: newMember, error: insertError } = await supabase
      .from('members')
      .insert({
        id,
        name: cleanName,
        role: memberRole,
        password_hash: passwordHash,
        direct_token: directToken,
        token_used: false,
        password_changed: false,
        email: email?.trim() ? email.trim().toLowerCase() : null,
        is_active: true,
      })
      .select('id, name, role, email, is_active, direct_token, created_at')
      .single();

    if (insertError || !newMember) {
      throw insertError || new Error('Could not create member');
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action_type: 'MEMBER_INVITED',
      actor_id: session.id,
      actor_name: session.name,
      balance_before: 0,
      balance_after: 0,
      details: {
        newMemberId: newMember.id,
        newMemberName: newMember.name,
        role: newMember.role,
        note: `New member ${newMember.name} (${newMember.role}) invited by ${session.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      member: newMember,
      invitationToken: directToken,
      message: `Member ${newMember.name} created successfully`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { memberId, isActive, role, resetPassword, regenerateToken } = await req.json();

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Prevent deactivating own account
    if (memberId === session.id && isActive === false) {
      return NextResponse.json({ error: 'You cannot deactivate your own admin account' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof isActive === 'boolean') {
      updates.is_active = isActive;
    }

    if (role && ['admin', 'member'].includes(role)) {
      updates.role = role;
    }

    if (resetPassword && typeof resetPassword === 'string' && resetPassword.trim().length >= 4) {
      updates.password_hash = resetPassword.trim();
    }

    if (regenerateToken) {
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      updates.direct_token = `token-${memberId}-${randomSuffix}`;
      updates.token_used = false;
      updates.password_changed = false;
    }

    const { data: updatedMember, error: updateError } = await supabase
      .from('members')
      .update(updates)
      .eq('id', memberId)
      .select('id, name, role, email, is_active, direct_token, token_used')
      .single();

    if (updateError || !updatedMember) {
      throw updateError || new Error('Failed to update member');
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action_type: 'MEMBER_STATUS_CHANGED',
      actor_id: session.id,
      actor_name: session.name,
      balance_before: 0,
      balance_after: 0,
      details: {
        targetMemberId: memberId,
        targetMemberName: updatedMember.name,
        updates,
        note: `Admin ${session.name} updated member ${updatedMember.name}'s access/settings`,
      },
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: 'Member updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}