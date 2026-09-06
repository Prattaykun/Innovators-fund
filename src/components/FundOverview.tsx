'use client';

import React from 'react';
import {
  Wallet,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { FundMetrics } from '@/lib/types';

interface FundOverviewProps {
  metrics: FundMetrics;
  onOpenRequestModal: () => void;
  onViewRequests: () => void;
  onViewAudits: () => void;
}

export default function FundOverview({
  metrics,
  onOpenRequestModal,
  onViewRequests,
  onViewAudits,
}: FundOverviewProps) {
  const percentRemaining = metrics.totalInitial > 0
    ? Math.max(0, Math.min(100, Math.round((metrics.availableBalance / metrics.totalInitial) * 100)))
    : 0;

  const percentDisbursed = 100 - percentRemaining;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Pool Progress */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 text-white shadow-xl dark:border-zinc-800 sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Innovators Fund Pool • ₹1,50,000 RS Initial Capital</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {formatINR(metrics.availableBalance)}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Available fund balance remaining out of {formatINR(metrics.totalInitial)}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenRequestModal}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-500/40"
            >
              <Sparkles className="h-4 w-4" />
              <span>Raise Fund Request</span>
            </button>
            <button
              onClick={onViewAudits}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <span>View Audit Trail</span>
              <ArrowUpRight className="h-4 w-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="relative z-10 mt-8 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
            <span>Pool Utilization: {percentDisbursed}% Disbursed</span>
            <span className="font-semibold text-emerald-400">
              {percentRemaining}% Available ({formatINR(metrics.availableBalance)})
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500">
            <span>₹0 (Depleted)</span>
            <span>₹75,000 (50%)</span>
            <span>₹1,50,000 (Initial)</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Initial Pool */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total Initial Pool
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {formatINR(metrics.totalInitial)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <span>Fixed initial fund allocation</span>
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total Disbursed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {formatINR(metrics.totalApproved)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{metrics.approvedCount} approved requests</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div
          onClick={onViewRequests}
          className="cursor-pointer rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Pending Requests
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {formatINR(metrics.pendingAmount)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <span>{metrics.pendingCount} awaiting admin approval</span>
          </div>
        </div>

        {/* Approvals Authority */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Admin Approvers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Snehansh
            </span>
            <span className="text-zinc-400">&amp;</span>
            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Prattay
            </span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Full audit logging with Resend emails
          </div>
        </div>
      </div>
    </div>
  );
}
