'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserPlus,
  Search,
  Key,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Lock,
  ExternalLink,
  Power,
  Users,
} from 'lucide-react';
import { Member, MemberRole } from '@/lib/types';

interface AdminPortalViewProps {
  currentUserName: string;
  onRefreshAll: () => void;
}

export default function AdminPortalView({ currentUserName, onRefreshAll }: AdminPortalViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('innovate123');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccessData, setInviteSuccessData] = useState<{ directToken: string; name: string } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Reset Password Modal
  const [resetModalMember, setResetModalMember] = useState<Member | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const fetchMembers = async (p = 1, q = search) => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/members', window.location.origin);
      url.searchParams.set('page', String(p));
      url.searchParams.set('limit', '8');
      if (q.trim()) url.searchParams.set('search', q.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setPage(data.page || 1);
      }
    } catch (err) {
      console.error('Failed to load admin members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(1, search);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers(1, search);
  };

  const copyDirectLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/login?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleToggleActive = async (member: Member) => {
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          isActive: !member.is_active,
        }),
      });
      if (res.ok) {
        fetchMembers(page, search);
        onRefreshAll();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update member');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating member');
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccessData(null);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName.trim(),
          role: inviteRole,
          email: inviteEmail.trim() || undefined,
          initialPassword: invitePassword.trim() || 'innovate123',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create member');
      }

      setInviteSuccessData({
        directToken: data.invitationToken,
        name: data.member.name,
      });

      // Clear fields
      setInviteName('');
      setInviteEmail('');
      fetchMembers(1, search);
      onRefreshAll();
    } catch (err: any) {
      setInviteError(err?.message || 'Failed to invite member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalMember || !newPasswordVal.trim()) return;

    setResetLoading(true);
    setResetMsg(null);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: resetModalMember.id,
          resetPassword: newPasswordVal.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setResetMsg(`Password updated for ${resetModalMember.name}`);
      setTimeout(() => {
        setResetModalMember(null);
        setNewPasswordVal('');
        setResetMsg(null);
      }, 1500);
    } catch (err: any) {
      setResetMsg(err?.message || 'Reset failed');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-950 via-zinc-900 to-zinc-950 p-6 text-white shadow-xl dark:border-purple-900/50 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Authority: Snehansh &amp; Prattay</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Member Management &amp; Access Portal
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Manage team members, generate new direct invitation links, toggle permissions, and configure access for the Innovators Fund.
            </p>
          </div>

          <button
            onClick={() => {
              setInviteSuccessData(null);
              setInviteError(null);
              setInviteModalOpen(true);
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite New Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchMembers(page, search)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Paginated Members Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              Team Members ({totalCount})
            </h3>
            <p className="text-xs text-zinc-500">
              Showing page {page} of {totalPages}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Notification Email</th>
                <th className="px-6 py-3.5">Access Status</th>
                <th className="px-6 py-3.5">Direct Link Token</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {members.map((member) => {
                const isAdmin = member.role === 'admin';
                const isCopied = copiedToken === member.direct_token;

                return (
                  <tr
                    key={member.id}
                    className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40"
                  >
                    {/* Name & ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold uppercase text-white ${
                            isAdmin ? 'bg-purple-600' : 'bg-zinc-700'
                          }`}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="font-mono text-[10px] text-zinc-400">
                            @{member.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isAdmin
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {isAdmin ? '👑 Administrator' : 'Member'}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      {member.email ? (
                        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                          <Mail className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-mono text-[11px]">{member.email}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">
                          Not configured
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                          member.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300'
                        }`}
                        title="Click to toggle access"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            member.is_active ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span>{member.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Direct Link Token */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => copyDirectLink(member.direct_token)}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                        <span className="truncate max-w-[120px]">
                          {member.direct_token}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setResetModalMember(member);
                            setNewPasswordVal('');
                            setResetMsg(null);
                          }}
                          className="rounded-lg border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          title="Reset Password"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`rounded-lg p-1.5 transition ${
                            member.is_active
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          title={member.is_active ? 'Disable account' : 'Enable account'}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-3 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <button
              onClick={() => fetchMembers(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-xs font-medium text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchMembers(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <span>Invite New Innovator</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Create a member account with a dedicated direct login link.
            </p>

            {inviteError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccessData ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/40">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Member Created: {inviteSuccessData.name}</span>
                  </div>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Share this direct login link with the member:
                  </p>
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-white p-2.5 border border-emerald-200 dark:bg-zinc-900 dark:border-emerald-900/50">
                    <span className="font-mono text-[11px] truncate text-zinc-800 dark:text-zinc-200">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/login?token={inviteSuccessData.directToken}
                    </span>
                    <button
                      onClick={() => copyDirectLink(inviteSuccessData.directToken)}
                      className="ml-2 shrink-0 rounded bg-emerald-600 px-2.5 py-1 text-white font-semibold text-[11px]"
                    >
                      {copiedToken === inviteSuccessData.directToken ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setInviteModalOpen(false);
                      setInviteSuccessData(null);
                    }}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateMember} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Alex Ray"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                      className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-sm text-zinc-900 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Initial Password
                    </label>
                    <input
                      type="text"
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Notification Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-500 disabled:opacity-50"
                  >
                    {inviteLoading ? 'Creating...' : 'Create & Generate Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-purple-600" />
              <span>Reset Password: {resetModalMember.name}</span>
            </h3>

            {resetMsg && (
              <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  New Password (min 4 chars)
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  placeholder="Enter new password"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalMember(null)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || newPasswordVal.length < 4}
                  className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-500 disabled:opacity-50"
                >
                  {resetLoading ? 'Saving...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
