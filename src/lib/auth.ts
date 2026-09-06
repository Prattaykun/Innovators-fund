import { cookies } from 'next/headers';
import { supabase } from './supabase';
import { Member } from './types';

export const SESSION_COOKIE_NAME = 'innovators_session';

export interface SessionUser {
  id: string;
  name: string;
  role: 'admin' | 'member';
  email: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!raw) return null;
    const user = JSON.parse(decodeURIComponent(raw)) as SessionUser;
    return user;
  } catch {
    return null;
  }
}

export async function authenticateByToken(token: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('direct_token', token.trim())
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Member;
}

export async function authenticateByCredentials(
  username: string,
  passwordPlain: string
): Promise<Member | null> {
  const cleanId = username.trim().toLowerCase();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .ilike('id', cleanId)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  if (data.password_hash !== passwordPlain.trim()) {
    return null;
  }
  return data as Member;
}