'use client';

import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  Shield,
  User,
  Key,
  Mail,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Member, MemberRole } from '@/lib/types';

interface DirectLinksViewProps {
  members: Member[];
  currentUserId?: string;
  onSwitchUser: (memberId: string) => void;
  onOpenProfileModal: () => void;
}

export default function DirectLinksView({
  members,
  currentUserId,
  onSwitchUser,
  onOpenProfileModal,
}: DirectLinksViewProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/login?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Sparkles className="h-3 w-3" />
              <span>Direct Link Authentication</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Member Access &amp; Direct Login Links
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Each member has a dedicated direct access link that logs them in instantly without typing passwords.
              Members can also configure their notification email at password change time to receive new fund request alerts.
            </p>
          </div>

          <button
            onClick={onOpenProfileModal}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            <Mail className="h-4 w-4 text-emerald-400" />
            <span>Set My Notification Email</span>
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const isCurrentUser = member.id === currentUserId;
          const isAdmin = member.role === 'admin';
          const isCopied = copiedToken === member.direct_token;
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const directUrl = `${origin}/login?token=${member.direct_token}`;

          return (
            <div
              key={member.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                isCurrentUser
                  ? 'border-emerald-500/40 bg-emerald-50/20 dark:border-emerald-500/40 dark:bg-emerald-950/10'
                  : 'border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold uppercase text-white shadow-sm ${
                        isAdmin ? 'bg-purple-600' : 'bg-zinc-700'
                      }`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                        <span>{member.name}</span>
                        {isCurrentUser && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">@{member.id}</span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {isAdmin ? '👑 Admin' : 'Member'}
                  </span>
                </div>

                {/* Email Info */}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-800/60">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="font-medium">Resend Alerts:</span>
                  </div>
                  <div className="mt-1 truncate font-semibold text-zinc-800 dark:text-zinc-200">
                    {member.email ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                        {member.email}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 italic font-normal text-[11px]">
                        No email configured yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Token Link Preview */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400">
                    Direct Login URL
                  </label>
                  <div className="mt-1 flex items-center rounded-xl border border-zinc-200 bg-zinc-50/80 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="truncate font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      /login?token={member.direct_token}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => copyLink(member.direct_token)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    isCopied
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </button>

                <button
                  onClick={() => onSwitchUser(member.id)}
                  className="flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                  title="Instant switch"
                >
                  <span>Switch</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
