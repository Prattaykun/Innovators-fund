'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Shield,
  User,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Member, MemberRole } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DirectLinksViewProps {
  members: Member[];
  currentUserId?: string;
  currentUserRole?: MemberRole;
  onOpenProfileModal: () => void;
}

export default function DirectLinksView({
  members,
  currentUserId,
  currentUserRole,
  onOpenProfileModal,
}: DirectLinksViewProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyLink = (token: string | null | undefined) => {
    if (!token) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/login?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <Card className="shadow-xs">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 font-semibold text-xs">
                  <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Authentication</span>
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  One-Time Activation
                </Badge>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Team Members &amp; Access Links
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Direct activation links allow each team member to complete password setup and activate notifications. Once a member sets their password, their activation link automatically expires for security.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenProfileModal}
              className="gap-2 self-start sm:self-auto text-xs"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Configure Notification Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const isCurrentUser = member.id === currentUserId;
          const isAdmin = member.role === 'admin';
          const viewerIsAdmin = currentUserRole === 'admin';
          const canViewToken = (viewerIsAdmin || isCurrentUser) && Boolean(member.direct_token);
          const isCopied = copiedToken === member.direct_token;
          const isTokenActive = Boolean(member.direct_token && !member.token_used);

          return (
            <Card
              key={member.id}
              className={`flex flex-col justify-between shadow-xs transition-colors ${
                isCurrentUser ? 'border-primary/50 bg-accent/20' : ''
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg font-semibold uppercase text-white bg-zinc-800 dark:bg-zinc-700"
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1">
                            You
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        @{member.id}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={isAdmin ? 'admin' : 'secondary'}
                    className="text-[11px] font-medium capitalize"
                  >
                    {member.role}
                  </Badge>
                </div>

                {/* Email Info */}
                <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>Notification Alerts:</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-foreground">
                    {member.email ? (
                      member.email
                    ) : (
                      <span className="text-muted-foreground italic font-sans">
                        No email configured
                      </span>
                    )}
                  </div>
                </div>

                {/* Token Link Status */}
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {canViewToken ? 'Activation Link Status' : 'Account Status'}
                  </div>
                  <div className="mt-1 flex items-center justify-between rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs">
                    {canViewToken ? (
                      <>
                        {isTokenActive ? (
                          <span className="font-mono text-[11px] text-muted-foreground truncate">
                            token-...{member.direct_token?.slice(-8)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Activated (Link Expired)
                          </span>
                        )}

                        {isTokenActive && (
                          <button
                            onClick={() => copyLink(member.direct_token)}
                            className="ml-2 text-xs font-semibold text-foreground hover:underline"
                          >
                            {isCopied ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {member.token_used ? 'Active Member' : 'Setup Pending (Link Protected)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {canViewToken && isTokenActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(member.direct_token)}
                      className="w-full text-xs gap-1.5 h-8"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy Activation Link'}</span>
                    </Button>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center py-1.5 text-xs font-normal text-muted-foreground">
                      {member.token_used ? 'Account Activated (Password Set)' : 'Authorized Member'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
