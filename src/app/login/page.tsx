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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shadow-md">
            <Sparkles className="h-7 w-7 animate-spin" />
          </div>
          <h2 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
            Verifying Direct Setup Link...
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Validating security token and preparing your activation...
          </p>
        </div>
      </div>
    );
  }

  // FLOW A: Token is Valid & Unused -> Prompt to set password and email
  if (tokenMember && !setupSuccess) {
    const isAdmin = tokenMember.role === 'admin';

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Brand */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
              <Key className="h-7 w-7" />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct Link Activation</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Welcome, {tokenMember.name}!
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Please set your personal password to activate your account.
            </p>
          </div>

          {/* Setup Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <div className="font-semibold flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>One-Time Setup Link Notice</span>
              </div>
              <p className="mt-1 text-[11px] opacity-90">
                Once you save your new password, this direct link will <strong>expire permanently</strong> for security. You will then sign in using your username and password.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCompleteSetup} className="space-y-4">
              {/* Member ID info */}
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 border border-zinc-200 dark:bg-zinc-800/60 dark:border-zinc-700">
                <div>
                  <div className="text-[10px] font-semibold uppercase text-zinc-400">
                    Username / ID
                  </div>
                  <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    @{tokenMember.id}
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

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Create Your Password * (min 4 characters)
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Enter your personal password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white pr-10 pl-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              {/* Notification Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Notification Email (Resend Alerts)
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  * Receives real-time email notifications of new fund requests and pool balance updates.
                </p>
              </div>

              <button
                type="submit"
                disabled={setupLoading || setupPassword.length < 4}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {setupLoading ? (
                  <span>Saving &amp; Expiring Link...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Password &amp; Enter Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // FLOW A2: Setup Success Animation
  if (setupSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <div className="text-center max-w-sm rounded-2xl border border-emerald-200 bg-white p-8 shadow-xl dark:border-emerald-900/50 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            Password Set Successfully!
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Your direct link has expired. Redirecting you to the Innovators Fund dashboard...
          </p>
        </div>
      </div>
    );
  }

  // FLOW B: Standard Login or Expired Token Fallback
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Innovators Fund
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            ₹1,50,000 RS Initial Capital Pool • Managed &amp; Audited
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {error && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Notice</span>
              </div>
              <p className="mt-1 text-[11px]">{error}</p>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Username / Member ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. prattay, snehansh, somoy, sraman, barta"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <span>{loading ? 'Signing in...' : 'Sign In with Password'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold uppercase text-zinc-400 dark:bg-zinc-900">
              Or 1-Click Fast Switch
            </span>
          </div>

          {/* Quick Member Login Buttons */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-zinc-500 pb-1">
              Select team member to sign in:
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleDirectSwitch('prattay')}
                className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/50 p-2 text-left text-xs font-semibold text-purple-900 transition hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300"
              >
                <span>👑 Prattay</span>
                <span className="text-[10px] opacity-70">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDirectSwitch('snehansh')}
                className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/50 p-2 text-left text-xs font-semibold text-purple-900 transition hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300"
              >
                <span>👑 Snehansh</span>
                <span className="text-[10px] opacity-70">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDirectSwitch('somoy')}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-left text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
              >
                <span>🚀 Somoy</span>
                <span className="text-[10px] opacity-70">Member</span>
              </button>
              <button
                type="button"
                onClick={() => handleDirectSwitch('sraman')}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-left text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
              >
                <span>🚀 Sraman</span>
                <span className="text-[10px] opacity-70">Member</span>
              </button>
              <button
                type="button"
                onClick={() => handleDirectSwitch('barta')}
                className="col-span-1 sm:col-span-2 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-left text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
              >
                <span>🚀 Barta</span>
                <span className="text-[10px] opacity-70">Member</span>
              </button>
            </div>
          </div>
        </div>
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
