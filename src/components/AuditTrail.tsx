'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  Key,
  Mail,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { AuditLog, AuditActionType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AuditTrailProps {
  initialAudits?: AuditLog[];
}

export default function AuditTrail({ initialAudits }: AuditTrailProps) {
  const [audits, setAudits] = useState<AuditLog[]>(initialAudits || []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAudits = async (p = 1, act = actionFilter, q = search) => {
    setLoading(true);
    try {
      const url = new URL('/api/audits', window.location.origin);
      url.searchParams.set('page', String(p));
      url.searchParams.set('limit', '10');
      if (act && act !== 'ALL') url.searchParams.set('action', act);
      if (q.trim()) url.searchParams.set('search', q.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setAudits(data.audits || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setPage(data.page || 1);
      }
    } catch (err) {
      console.error('Failed to load audits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits(1, actionFilter, search);
  }, [actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAudits(1, actionFilter, search);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'INITIAL_POOL_CREATED':
        return <Badge variant="outline" className="font-semibold">Pool Initialized</Badge>;
      case 'FUND_DEPOSITED':
        return <Badge variant="success" className="font-semibold">Funds Deposited</Badge>;
      case 'REQUEST_CREATED':
        return <Badge variant="secondary">Request Raised</Badge>;
      case 'REQUEST_APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'REQUEST_REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'PASSWORD_CHANGED':
        return <Badge variant="outline">Password Set</Badge>;
      case 'EMAIL_UPDATED':
        return <Badge variant="outline">Email Configured</Badge>;
      case 'MEMBER_INVITED':
        return <Badge variant="admin">Member Invited</Badge>;
      case 'MEMBER_STATUS_CHANGED':
        return <Badge variant="secondary">Access Updated</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {[
            { id: 'ALL', label: 'All Logs' },
            { id: 'FUND_DEPOSITED', label: 'Deposits' },
            { id: 'REQUEST_APPROVED', label: 'Approvals' },
            { id: 'REQUEST_CREATED', label: 'Requests' },
            { id: 'REQUEST_REJECTED', label: 'Rejections' },
            { id: 'EMAIL_UPDATED', label: 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActionFilter(item.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                actionFilter === item.id
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit trail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </form>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchAudits(page, actionFilter, search)}
            title="Refresh"
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Audits Card */}
      <Card className="shadow-xs">
        <CardHeader className="border-b border-border/80 px-6 py-4 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold">
              Permanent Audit Ledger ({totalCount})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Financial provenance &amp; disbursement events logged with balance tracking
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Page {page} of {totalPages}
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {audits.length === 0 ? (
            <div className="p-12 text-center">
              <History className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">No audit records found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {audits.map((item) => {
                const detailsObj = typeof item.details === 'string' ? JSON.parse(item.details || '{}') : item.details || {};
                const noteText = detailsObj.note || detailsObj.reason || detailsObj.title || 'System action';
                const hasBalanceShift = item.balance_before !== item.balance_after;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left: Action & Details */}
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getActionBadge(item.action_type)}
                        <span className="text-xs font-semibold text-foreground">
                          {item.actor_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          • {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {noteText}
                      </p>
                    </div>

                    {/* Right: Balance shift badge */}
                    <div className="shrink-0 sm:text-right">
                      {hasBalanceShift ? (
                        <div className="rounded-md border border-border bg-muted/30 p-2 text-xs">
                          <div className="text-[10px] uppercase font-medium text-muted-foreground">
                            Balance Shift
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold text-foreground tabular-nums">
                            <span>{formatINR(Number(item.balance_before))}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {formatINR(Number(item.balance_after))}
                            </span>
                          </div>
                          {item.amount && (
                            <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                              -{formatINR(Number(item.amount))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground tabular-nums">
                          Pool: {formatINR(Number(item.balance_after))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAudits(page - 1)}
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
                onClick={() => fetchAudits(page + 1)}
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
    </div>
  );
}
