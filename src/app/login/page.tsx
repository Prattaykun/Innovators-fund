'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wallet,
  Shield,
  Key,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Users,
  Mail,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  // Direct Token Verification State
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenMember, setTokenMember] = useState<{
    id: string;
    name: string;
    role: string;
    email: string | null;
  } | null>(null);

  // Setup Form State (When token is valid)
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);

  // Manual Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check token on mount if provided in URL
  useEffect(() => {
    if (tokenParam) {
      setVerifyingToken(true);
      setError(null);
      fetch(`/api/auth/verify-token?token=${encodeURIComponent(tokenParam)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && data.member) {
            setTokenMember(data.member);
            if (data.member.email) {
              setSetupEmail(data.member.email);
            }
          } else {
            setError(data.message || 'This setup link is invalid or has expired.');
            if (data.username) {
              setUsername(data.username);
            }
          }
        })
        .catch((err) => {
          setError(err?.message || 'Failed to verify token');
        })
        .finally(() => {
          setVerifyingToken(false);
        });
    }
  }, [tokenParam]);

  // Handle Initial Password Setup & Token Expiration
  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenParam || !tokenMember) return;
    setError(null);

    if (setupPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    if (setupPassword !== setupConfirm) {
      setError('Passwords do not match');
      return;
    }

    setSetupLoading(true);
    try {
      const res = await fetch('/api/auth/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenParam,
          newPassword: setupPassword.trim(),
          email: setupEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save password');
      }

      setSetupSuccess(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      setTimeout(() => {
        router.push('/');
      }, 1400);
    } catch (err: any) {
      setError(err?.message || 'Error activating account');
      setSetupLoading(false);
    }
  };

  // Standard Credentials Login
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credentials',
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fast Switch Login
  const handleDirectSwitch = async (memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'switch',
          memberId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifyingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm p-8 text-center border-border shadow-sm">
          {/* Indeterminate loading line stretching and compressing */}
          <div className="mx-auto mb-6 h-1.5 w-48 sm:w-56 overflow-hidden rounded-full bg-emerald-500/20 relative">
            <div className="animate-indeterminate-1 absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <div className="animate-indeterminate-2 absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            Verifying Direct Setup Link...
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Validating security token and preparing your activation...
          </p>
        </Card>
      </div>
    );
  }

  // FLOW A: Token is Valid & Unused -> Prompt to set password and email
  if (tokenMember && !setupSuccess) {
    const isAdmin = tokenMember.role === 'admin';

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Brand */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card p-1 shadow-sm">
              <img
                src="/logo.jpg"
                alt="Team Innovators"
                className="h-full w-full object-contain rounded-xl"
              />
            </div>
            <div className="mt-4 flex items-center justify-center">
              <Badge variant="outline" className="gap-1.5 py-0.5 px-2.5">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span>Direct Link Activation</span>
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Welcome, {tokenMember.name}!
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Please set your personal password to activate your account.
            </p>
          </div>

          {/* Setup Card */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <div className="font-semibold flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>One-Time Setup Link Notice</span>
                </div>
                <p className="mt-1 text-[11px] opacity-90">
                  Once you save your new password, this direct link will <strong>expire permanently</strong> for security. You will then sign in using your username and password.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCompleteSetup} className="space-y-4">
                {/* Member ID and Locked Role Info */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 border border-border">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Username / Member ID
                    </div>
                    <div className="font-mono text-xs font-bold text-foreground">
                      @{tokenMember.id}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1 justify-end">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Assigned Role</span>
                    </div>
                    <Badge variant={isAdmin ? 'admin' : 'secondary'} className="mt-0.5">
                      {isAdmin ? 'Admin' : 'Member'}
                    </Badge>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>Your account role was assigned by the admin and cannot be changed during setup.</span>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Create Your Password * (min 4 characters)
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      placeholder="Enter your personal password"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      className="pr-10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Confirm Password *
                  </label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={setupConfirm}
                    onChange={(e) => setSetupConfirm(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Notification Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Notification Email (Resend Alerts)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={setupEmail}
                      onChange={(e) => setSetupEmail(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Receives real-time email notifications of fund requests and pool balance updates.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={setupLoading || setupPassword.length < 4}
                  className="w-full"
                >
                  {setupLoading ? (
                    <span>Saving &amp; Expiring Link...</span>
                  ) : (
                    <>
                      <Check className="mr-1.5 h-4 w-4" />
                      <span>Save Password &amp; Enter Dashboard</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // FLOW A2: Setup Success Animation
  if (setupSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="text-center max-w-sm p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Password Set Successfully!
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your direct link has expired. Redirecting you to the Innovators Fund dashboard...
          </p>
        </Card>
      </div>
    );
  }

  // FLOW B: Standard Login or Expired Token Fallback
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card p-1 shadow-sm">
            <img
              src="/logo.jpg"
              alt="Team Innovators"
              className="h-full w-full object-contain rounded-xl"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Innovators Fund
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            ₹1,50,000 RS Initial Capital Pool • Managed &amp; Audited
          </p>
        </div>

        {/* Card */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Notice</span>
                </div>
                <p className="mt-1 text-[11px]">{error}</p>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Username / Member ID
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. prattay, snehansh, somoy, sraman, barta"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                <span>{loading ? 'Signing in...' : 'Sign In with Password'}</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-3 text-[11px] font-semibold uppercase text-muted-foreground">
                Or Quick Access Switch
              </span>
            </div>

            {/* Quick Member Login Buttons */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium text-muted-foreground pb-1">
                Select team member:
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDirectSwitch('prattay')}
                  className="justify-between border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5 font-medium text-xs"
                >
                  <span className="font-semibold text-foreground">Prattay</span>
                  <Badge variant="admin" className="text-[9px] py-0 px-1.5">Admin</Badge>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDirectSwitch('snehansh')}
                  className="justify-between border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5 font-medium text-xs"
                >
                  <span className="font-semibold text-foreground">Snehansh</span>
                  <Badge variant="admin" className="text-[9px] py-0 px-1.5">Admin</Badge>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDirectSwitch('somoy')}
                  className="justify-between font-medium text-xs"
                >
                  <span className="text-foreground">Somoy</span>
                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5">Member</Badge>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDirectSwitch('sraman')}
                  className="justify-between font-medium text-xs"
                >
                  <span className="text-foreground">Sraman</span>
                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5">Member</Badge>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDirectSwitch('barta')}
                  className="col-span-1 sm:col-span-2 justify-between font-medium text-xs"
                >
                  <span className="text-foreground">Barta</span>
                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5">Member</Badge>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm font-semibold text-zinc-500">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
