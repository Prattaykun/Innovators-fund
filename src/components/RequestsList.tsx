'use client';

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Tag,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { FundRequest, MemberRole } from '@/lib/types';

interface RequestsListProps {
  requests: FundRequest[];
  currentUser: {
    id: string;
    name: string;
    role: MemberRole;
  } | null;
  onRefresh: () => void;
  onOpenRequestModal: () => void;
}

export default function RequestsList({
  requests,
  currentUser,
  onRefresh,
  onOpenRequestModal,
}: RequestsListProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Review Dialog State
  const [reviewModalRequest, setReviewModalRequest] = useState<FundRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

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

  const filteredRequests = requests.filter((r) => {
    if (activeFilter !== 'all' && r.status !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchReason = r.reason.toLowerCase().includes(q);
      const matchRequester = (r.requester?.name || r.requested_by).toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      return matchTitle || matchReason || matchRequester || matchCat;
    }
    return true;
  });

  const handleOpenReview = (request: FundRequest, action: 'approve' | 'reject') => {
    setReviewModalRequest(request);
    setReviewAction(action);
    setAdminNotes('');
    setReviewError(null);
  };

  const handleConfirmReview = async () => {
    if (!reviewModalRequest) return;
    setActionLoadingId(reviewModalRequest.id);
    setReviewError(null);

    try {
      const res = await fetch(`/api/requests/${reviewModalRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reviewAction,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request');
      }

      setReviewModalRequest(null);
      onRefresh();
    } catch (err: any) {
      setReviewError(err?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => {
            const count = tab === 'all' ? requests.length : requests.filter((r) => r.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  activeFilter === tab
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Requests Feed */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <Clock className="mx-auto h-8 w-8 text-zinc-400" />
          <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">
            No fund requests found
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {search ? 'Try adjusting your search filters' : 'Raise the first request to disburse funds'}
          </p>
          <button
            onClick={onOpenRequestModal}
            className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Raise Fund Request
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const requesterName = req.requester?.name || req.requested_by;
            const reviewerName = req.reviewer?.name || req.reviewed_by;
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  {/* Left content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Approved</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                          <XCircle className="h-3 w-3" />
                          <span>Rejected</span>
                        </span>
                      )}

                      {/* Category tag */}
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        <Tag className="h-2.5 w-2.5" />
                        <span>{req.category}</span>
                      </span>

                      {/* Timestamp */}
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(req.created_at)}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                      {req.title}
                    </h4>

                    {/* Reason */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {req.reason}
                    </p>

                    {/* Requester line */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold uppercase text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                        {requesterName.charAt(0)}
                      </div>
                      <span>
                        Requested by <strong className="text-zinc-800 dark:text-zinc-200">{requesterName}</strong>
                      </span>
                    </div>

                    {/* Admin review remarks footer */}
                    {!isPending && reviewerName && (
                      <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs dark:border-zinc-800/80 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                          <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          <span>
                            {isApproved ? 'Approved' : 'Rejected'} by {reviewerName} (Admin)
                          </span>
                          {req.reviewed_at && (
                            <span className="text-[11px] font-normal text-zinc-400">
                              • {formatDate(req.reviewed_at)}
                            </span>
                          )}
                        </div>
                        {req.admin_notes && (
                          <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400 italic">
                            &quot;{req.admin_notes}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Amount
                      </div>
                      <div className="text-xl font-extrabold text-zinc-900 dark:text-white">
                        {formatINR(Number(req.amount))}
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    {isPending && isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReview(req, 'reject')}
                          disabled={actionLoadingId === req.id}
                          className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleOpenReview(req, 'approve')}
                          disabled={actionLoadingId === req.id}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal for Admins */}
      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setReviewModalRequest(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${
                  reviewAction === 'approve' ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              >
                {reviewAction === 'approve' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white capitalize">
                  {reviewAction} Fund Request
                </h3>
                <p className="text-xs text-zinc-500">
                  {formatINR(Number(reviewModalRequest.amount))} for {reviewModalRequest.requester?.name || reviewModalRequest.requested_by}
                </p>
              </div>
            </div>

            {reviewError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/60">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {reviewModalRequest.title}
                </div>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {reviewModalRequest.reason}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Admin Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Reason for ${reviewAction === 'approve' ? 'approval' : 'rejection'}, disbursement instructions, etc.`}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <p className="text-[11px] text-zinc-500">
                * This decision will be stamped into the permanent audit log and sent via email notification to the requester and admins.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalRequest(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReview}
                  disabled={actionLoadingId !== null}
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 ${
                    reviewAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {actionLoadingId ? 'Processing...' : `Confirm ${reviewAction === 'approve' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
