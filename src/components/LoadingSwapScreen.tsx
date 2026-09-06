'use client';

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Wallet, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function LoadingSwapScreen({ message = "Loading Innovators Fund treasury..." }: { message?: string }) {
  // Mode swaps between 'loader' (rotating spinner with logo & badges) and 'skeleton' (realistic UI placeholder)
  const [mode, setMode] = useState<'loader' | 'skeleton'>('loader');

  useEffect(() => {
    const interval = setInterval(() => {
      setMode((prev) => (prev === 'loader' ? 'skeleton' : 'loader'));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-[460px] py-4 transition-all duration-700 ease-in-out">
      {/* Dynamic Mode Switch Indicator Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {message}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border">
          <span className={mode === 'loader' ? 'text-emerald-600 font-semibold dark:text-emerald-400' : 'text-muted-foreground'}>
            Status
          </span>
          <span>•</span>
          <span className={mode === 'skeleton' ? 'text-emerald-600 font-semibold dark:text-emerald-400' : 'text-muted-foreground'}>
            Layout Preview
          </span>
        </div>
      </div>

      {/* Cross-fade Wrapper */}
      <div className="relative w-full">
        {/* VIEW 1: Rotating Animated Loader Screen */}
        <div
          className={`w-full flex flex-col items-center justify-center py-16 px-4 transition-all duration-700 ${
            mode === 'loader'
              ? 'opacity-100 scale-100 relative pointer-events-auto'
              : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'
          }`}
        >
          <div className="relative mb-6">
            {/* Spinning Outer Ring */}
            <div className="h-24 w-24 rounded-2xl border-2 border-emerald-500/20 border-t-emerald-600 animate-spin dark:border-t-emerald-400" />
            {/* Logo Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-xl border border-border bg-card p-1 shadow-md overflow-hidden animate-pulse">
                <img
                  src="/logo.jpg"
                  alt="Team Innovators"
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="text-center max-w-sm space-y-2">
            <h3 className="text-base font-bold tracking-tight text-foreground">
              Team Innovators Treasury
            </h3>
            <p className="text-xs text-muted-foreground">
              Synchronizing ₹1,50,000 RS capital pool, requests ledger, and administrative governance...
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground bg-card border border-border px-3.5 py-1.5 rounded-full shadow-xs">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span>Alternating with layout skeleton...</span>
          </div>
        </div>

        {/* VIEW 2: Skeleton UI Screen */}
        <div
          className={`w-full space-y-6 transition-all duration-700 ${
            mode === 'skeleton'
              ? 'opacity-100 scale-100 relative pointer-events-auto'
              : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'
          }`}
        >
          {/* Top Banner Skeleton */}
          <Card className="overflow-hidden border-border bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-64 rounded-lg" />
                  <Skeleton className="h-3.5 w-80 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-28 rounded-lg" />
                  <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
              </div>

              {/* Progress bar skeleton */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Metric cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 border-border bg-card">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
                <Skeleton className="mt-3 h-7 w-28 rounded-md" />
                <Skeleton className="mt-2 h-3 w-36 rounded-md" />
              </Card>
            ))}
          </div>

          {/* Two-column preview layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 space-y-4 border-border bg-card">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/60">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </Card>

            <Card className="p-5 space-y-4 border-border bg-card">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/60">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-48 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
