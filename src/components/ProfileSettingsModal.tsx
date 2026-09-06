'use client';

import React, { useState } from 'react';
import {
  X,
  Settings,
  Lock,
  Mail,
  Key,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { MemberRole } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
    role: MemberRole;
    email: string | null;
    directToken?: string;
  };
  onProfileUpdated: (updatedUser: any) => void;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: ProfileSettingsModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState(currentUser.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const copyMyDirectLink = () => {
    if (!currentUser.directToken) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/login?token=${currentUser.directToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: password.trim() || undefined,
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile and notification preferences saved successfully!');
      setPassword('');
      setConfirmPassword('');
      onProfileUpdated(data.user);
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Profile &amp; Email Settings
            </h3>
            <p className="text-xs text-muted-foreground">
              Logged in as <span className="font-semibold text-foreground">{currentUser.name}</span>{' '}
              <Badge variant={currentUser.role === 'admin' ? 'admin' : 'secondary'} className="ml-1 text-[10px] py-0 px-1.5">
                {currentUser.role === 'admin' ? 'Admin' : 'Member'}
              </Badge>
            </p>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Notification Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Notification Email (Resend Alerts)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Real-time audit updates and pool notifications will be dispatched to this email.
            </p>
          </div>

          {/* Change Password Section */}
          <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Change Password (Optional)</span>
            </div>

            <div>
              <Input
                type="password"
                placeholder="New password (leave blank to keep current)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-xs bg-background"
              />
            </div>

            {password.length > 0 && (
              <div>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>
            )}
          </div>

          {/* Direct Link Banner */}
          {currentUser.directToken && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  Personal Direct Link
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyMyDirectLink}
                  className="h-7 px-2 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                >
                  {copiedLink ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </Button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground font-mono truncate">
                /login?token={currentUser.directToken}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
