'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  UserCheck,
  Key,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AuditLog, AuditActionType } from '@/lib/types';

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
        return {
          icon: <Sparkles className="h-3.5 w-3.5 text-emerald-600" />,
          label: 'Pool Initialized',
          color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        };
      case 'REQUEST_CREATED':
        return {
          icon: <History className="h-3.5 w-3.5 text-blue-600" />,
          label: 'Request Raised',
          color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        };
      case 'REQUEST_APPROVED':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
          label: 'Request Approved',
          color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        };
      case 'REQUEST_REJECTED':
        return {
          icon: <XCircle className="h-3.5 w-3.5 text-red-600" />,
          label: 'Request Rejected',
          color: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
        };
      case 'PASSWORD_CHANGED':
        return {
          icon: <Key className="h-3.5 w-3.5 text-amber-600" />,
          label: 'Password Changed',
          color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        };
      case 'EMAIL_UPDATED':
        return {
          icon: <Mail className="h-3.5 w-3.5 text-indigo-600" />,
          label: 'Email Updated',
          color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        };
      case 'MEMBER_INVITED':
        return {
          icon: <UserCheck className="h-3.5 w-3.5 text-purple-600" />,
          label: 'Member Invited',
          color: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        };
      case 'MEMBER_STATUS_CHANGED':
        return {
          icon: <ShieldAlert className="h-3.5 w-3.5 text-zinc-600" />,
          label: 'Member Updated',
          color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        };
      default:
        return {
          icon: <History className="h-3.5 w-3.5 text-zinc-500" />,
          label: action,
          color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'REQUEST_APPROVED', label: 'Approvals' },
            { id: 'REQUEST_CREATED', label: 'Requests' },
            { id: 'REQUEST_REJECTED', label: 'Rejections' },
            { id: 'EMAIL_UPDATED', label: 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActionFilter(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                actionFilter === item.id
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </form>
          <button
            onClick={() => fetchAudits(page, actionFilter, search)}
            className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title="Refresh audits"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audits Table / Timeline */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              Permanent Audit Logs ({totalCount})
            </h3>
            <p className="text-xs text-zinc-500">
              Immutable ledger of fund requests, approvals by Snehansh &amp; Prattay, and balance shifts
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
        </div>

        {audits.length === 0 ? (
          <div className="p-12 text-center">
            <History className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-2 text-xs text-zinc-500">No audit events match your query</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {audits.map((item) => {
              const badge = getActionBadge(item.action_type);
              const detailsObj = typeof item.details === 'string' ? JSON.parse(item.details || '{}') : item.details || {};
              const noteText = detailsObj.note || detailsObj.reason || detailsObj.title || 'System action logged';
              const hasBalanceShift = item.balance_before !== item.balance_after;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left: Action & Details */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      {badge.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {item.actor_name}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          • {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        {noteText}
                      </p>
                    </div>
                  </div>

                  {/* Right: Balance shift badge */}
                  <div className="flex items-center gap-3 shrink-0 sm:text-right">
                    {hasBalanceShift ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/30">
                        <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                          Balance Impact
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                          <span>{formatINR(Number(item.balance_before))}</span>
                          <ArrowRight className="h-3 w-3 text-zinc-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {formatINR(Number(item.balance_after))}
                          </span>
                        </div>
                        {item.amount && (
                          <div className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                            -{formatINR(Number(item.amount))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                        Pool Balance: {formatINR(Number(item.balance_after))}
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
          <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-3 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <button
              onClick={() => fetchAudits(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-xs font-medium text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchAudits(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
