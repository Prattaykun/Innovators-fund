'use client';

import React from 'react';
import {
  TrendingDown,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { FundMetrics } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      {/* Main Capital Pool Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 px-2.5 py-0.5 text-xs font-semibold">
                  <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Capital Allocation</span>
                </Badge>
                <Badge variant="secondary" className="text-xs font-medium">
                  ₹1,50,000 Total Pool
                </Badge>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Available Fund Balance
                </div>
                <div className="text-3xl font-extrabold tracking-tight sm:text-4xl tabular-nums text-foreground">
                  {formatINR(metrics.availableBalance)}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Remaining balance out of initial {formatINR(metrics.totalInitial)} capital pool.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button onClick={onOpenRequestModal} size="default" className="gap-1.5 font-semibold">
                <Plus className="h-4 w-4" />
                <span>Raise Fund Request</span>
              </Button>
              <Button onClick={onViewAudits} variant="outline" size="default" className="gap-1.5 text-xs font-semibold">
                <span>Audit Trail</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{percentDisbursed}% Disbursed</span>
              <span className="font-semibold text-foreground tabular-nums">
                {percentRemaining}% Available ({formatINR(metrics.availableBalance)})
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500"
                style={{ width: `${percentRemaining}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
              <span>₹0</span>
              <span>₹75,000 (50%)</span>
              <span>₹1,50,000 (100%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Initial Pool */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Initial Pool
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {formatINR(metrics.totalInitial)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Fixed seed reserve
            </p>
          </CardContent>
        </Card>

        {/* Total Disbursed */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Disbursed
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {formatINR(metrics.totalApproved)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{metrics.approvedCount} approved disbursements</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card
          onClick={onViewRequests}
          className="cursor-pointer transition-colors hover:border-foreground/30 shadow-xs"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">
              {formatINR(metrics.pendingAmount)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.pendingCount} awaiting admin approval
            </p>
          </CardContent>
        </Card>

        {/* Approvals Authority */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Admin Approvers
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Badge variant="admin" className="text-[11px] font-semibold">
                Snehansh
              </Badge>
              <span className="text-muted-foreground text-xs">&amp;</span>
              <Badge variant="admin" className="text-[11px] font-semibold">
                Prattay
              </Badge>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Multi-member audit logging &amp; email verification
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
