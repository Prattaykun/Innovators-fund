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
  AlertCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Power,
  RotateCw,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { Member, MemberRole } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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

  // Add Funds to Pool Modal State
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNotes, setDepositNotes] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

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

  const handleRegenerateLink = async (memberId: string) => {
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          regenerateToken: true,
        }),
      });
      if (res.ok) {
        fetchMembers(page, search);
        onRefreshAll();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to regenerate link');
      }
    } catch (err: any) {
      alert(err?.message || 'Error regenerating link');
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

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    setDepositSuccessMsg(null);

    const amt = Number(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setDepositError('Please enter a valid amount to deposit.');
      return;
    }

    setDepositLoading(true);
    try {
      const res = await fetch('/api/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          notes: depositNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deposit funds');

      setDepositSuccessMsg(`Successfully added ₹${amt.toLocaleString('en-IN')} to the Innovators Fund pool!`);
      setDepositAmount('');
      setDepositNotes('');
      onRefreshAll();

      setTimeout(() => {
        setDepositModalOpen(false);
        setDepositSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setDepositError(err?.message || 'Failed to add funds');
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-xs">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="admin" className="gap-1 font-semibold text-xs">
                  <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Admin Authority</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Snehansh &amp; Prattay
                </Badge>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Team Governance &amp; Treasury Management
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Deposit additional capital to the ₹1.5L pool, configure member accesses, generate one-time setup links, and oversee financial governance for Team Innovators.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Button
                size="sm"
                onClick={() => {
                  setDepositError(null);
                  setDepositSuccessMsg(null);
                  setDepositModalOpen(true);
                }}
                className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Deposit Funds</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setInviteSuccessData(null);
                  setInviteError(null);
                  setInviteModalOpen(true);
                }}
                className="gap-2 text-xs font-semibold"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Member</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </form>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchMembers(page, search)}
          className="gap-1.5 text-xs self-start sm:self-auto h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Paginated Members Table */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/80 px-6 py-4 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold">
              Members Directory ({totalCount})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing page {page} of {totalPages}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Notification Email</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Activation Token</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => {
                  const isAdmin = member.role === 'admin';
                  const isCopied = copiedToken === member.direct_token;
                  const isTokenActive = Boolean(member.direct_token && !member.token_used);

                  return (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      {/* Name & ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-md font-semibold uppercase text-white bg-zinc-800 dark:bg-zinc-700"
                          >
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {member.name}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              @{member.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <Badge
                          variant={isAdmin ? 'admin' : 'secondary'}
                          className="text-[11px] font-medium capitalize"
                        >
                          {member.role}
                        </Badge>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        {member.email ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{member.email}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Not configured
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge
                          variant={member.is_active ? 'success' : 'destructive'}
                          onClick={() => handleToggleActive(member)}
                          className="cursor-pointer text-[10px] font-semibold"
                        >
                          {member.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>

                      {/* Direct Link Token */}
                      <td className="px-6 py-4">
                        {isTokenActive ? (
                          <button
                            onClick={() => copyDirectLink(member.direct_token!)}
                            className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-[11px] text-foreground transition-colors hover:bg-muted"
                          >
                            {isCopied ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="truncate max-w-[110px]">
                              {member.direct_token}
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                            <span>Expired</span>
                            <button
                              onClick={() => handleRegenerateLink(member.id)}
                              className="text-primary hover:underline font-medium text-[10px] flex items-center gap-0.5"
                              title="Generate new activation token"
                            >
                              <RotateCw className="h-2.5 w-2.5" />
                              <span>Re-issue</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setResetModalMember(member);
                              setNewPasswordVal('');
                              setResetMsg(null);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Reset password"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(member)}
                            className={`h-8 w-8 ${
                              member.is_active
                                ? 'text-destructive hover:bg-destructive/10'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={member.is_active ? 'Disable account' : 'Enable account'}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </Button>
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
            <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMembers(page - 1)}
                disabled={page <= 1}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMembers(page + 1)}
                disabled={page >= totalPages}
                className="h-8 gap-1 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-popover p-6 shadow-xl text-popover-foreground">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <span>Invite New Innovator</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create a team member account with a dedicated one-time setup link.
            </p>

            {inviteError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccessData ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Member Created: {inviteSuccessData.name}</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    Share this activation link with the member:
                  </p>
                  <div className="mt-2 flex items-center justify-between rounded-md bg-background p-2 border border-border">
                    <span className="font-mono text-[11px] truncate text-foreground">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/login?token={inviteSuccessData.directToken}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => copyDirectLink(inviteSuccessData.directToken)}
                      className="ml-2 h-7 px-2.5 text-xs"
                    >
                      {copiedToken === inviteSuccessData.directToken ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      setInviteModalOpen(false);
                      setInviteSuccessData(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateMember} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Full Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Alex Ray"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground">
                      Initial Password
                    </label>
                    <Input
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Notification Email (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="alex@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInviteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? 'Creating...' : 'Create & Generate Link'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-popover p-6 shadow-xl text-popover-foreground">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-600" />
              <span>Reset Password: {resetModalMember.name}</span>
            </h3>

            {resetMsg && (
              <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground">
                  New Password (min 4 characters)
                </label>
                <Input
                  required
                  minLength={4}
                  placeholder="Enter new password"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResetModalMember(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={resetLoading || newPasswordVal.length < 4}
                >
                  {resetLoading ? 'Saving...' : 'Set Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Capital Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-popover p-6 shadow-xl text-popover-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Add Funds to Capital Pool
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Admin Authority: {currentUserName}
                  </p>
                </div>
              </div>
              <Badge variant="admin" className="text-[10px]">
                Treasury
              </Badge>
            </div>

            {depositError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{depositError}</span>
              </div>
            )}

            {depositSuccessMsg ? (
              <div className="my-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="font-bold text-sm text-foreground">
                  Deposit Confirmed!
                </div>
                <p className="text-xs text-muted-foreground">
                  {depositSuccessMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Deposit Amount (INR ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      type="number"
                      required
                      min={1}
                      step="any"
                      placeholder="e.g. 50000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="pl-7 text-xs"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    This amount will directly increase the available balance and total pool capital.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Deposit Remarks / Source (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Sponsor contribution, grant award, capital top-up"
                    value={depositNotes}
                    onChange={(e) => setDepositNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                    <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Audit &amp; Email Dispatch</span>
                  </div>
                  <p className="text-[11px]">
                    A permanent audit ledger entry <code className="text-foreground font-mono">FUND_DEPOSITED</code> will be recorded, and an email update will automatically be dispatched to all team members via Resend.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={depositLoading || !depositAmount}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    {depositLoading ? 'Depositing...' : 'Confirm Deposit'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
