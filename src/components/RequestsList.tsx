'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { FundRequest, MemberRole } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface RequestsListProps {
  requests: FundRequest[];
  currentUser: {
    id: string;
    name: string;
    role: MemberRole;
  } | null;
  highlightRequestId?: string | null;
  onRefresh: () => void;
  onOpenRequestModal: () => void;
}

export default function RequestsList({
  requests,
  currentUser,
  highlightRequestId,
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
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightRequestId || null);

  useEffect(() => {
    if (highlightRequestId) {
      setHighlightedId(highlightRequestId);
      // Ensure the tab displays it even if filtered
      const targetReq = requests.find((r) => r.id === highlightRequestId);
      if (targetReq && activeFilter !== 'all' && activeFilter !== targetReq.status) {
        setActiveFilter('all');
      }

      setTimeout(() => {
        const el = document.getElementById(`request-${highlightRequestId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      // Fade out highlight ring after 5 seconds
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightRequestId, requests]);

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
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => {
            const count = tab === 'all' ? requests.length : requests.filter((r) => r.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  activeFilter === tab
                    ? 'bg-background text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Requests Feed */}
      {filteredRequests.length === 0 ? (
        <Card className="border-dashed p-12 text-center shadow-none">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No fund requests found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {search ? 'Try adjusting your search filters' : 'Raise the first request to disburse funds'}
          </p>
          <div className="mt-4">
            <Button size="sm" onClick={onOpenRequestModal}>
              Raise Fund Request
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const requesterName = req.requester?.name || req.requested_by;
            const reviewerName = req.reviewer?.name || req.reviewed_by;
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            const isTarget = req.id === highlightedId;

            return (
              <Card
                key={req.id}
                id={`request-${req.id}`}
                className={`transition-all duration-300 shadow-xs ${
                  isTarget
                    ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20'
                    : 'hover:border-foreground/20'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    {/* Left content */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status badge */}
                        {isPending && (
                          <Badge variant="warning" className="gap-1 text-[11px] font-semibold">
                            <Clock className="h-3 w-3" />
                            <span>Pending</span>
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge variant="success" className="gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Approved</span>
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="destructive" className="gap-1 text-[11px] font-semibold">
                            <XCircle className="h-3 w-3" />
                            <span>Rejected</span>
                          </Badge>
                        )}

                        {/* Category tag */}
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {req.category}
                        </Badge>

                        {/* Timestamp */}
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(req.created_at)}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold text-foreground">
                        {req.title}
                      </h4>

                      {/* Reason */}
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {req.reason}
                      </p>

                      {/* Requester line */}
                      <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold uppercase text-foreground">
                          {requesterName.charAt(0)}
                        </div>
                        <span>
                          Requested by <strong className="text-foreground">{requesterName}</strong>
                        </span>
                      </div>

                      {/* Admin review remarks footer */}
                      {!isPending && reviewerName && (
                        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>
                              {isApproved ? 'Approved' : 'Rejected'} by {reviewerName} (Administrator)
                            </span>
                            {req.reviewed_at && (
                              <span className="text-[11px] text-muted-foreground">
                                • {formatDate(req.reviewed_at)}
                              </span>
                            )}
                          </div>
                          {req.admin_notes && (
                            <p className="mt-1 text-[11px] text-muted-foreground italic">
                              &ldquo;{req.admin_notes}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </div>
                        <div className="text-xl font-bold tabular-nums text-foreground">
                          {formatINR(Number(req.amount))}
                        </div>
                      </div>

                      {/* Admin Action Buttons */}
                      {isPending && isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReview(req, 'reject')}
                            disabled={actionLoadingId === req.id}
                            className="h-8 gap-1 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                            <span>Reject</span>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenReview(req, 'approve')}
                            disabled={actionLoadingId === req.id}
                            className="h-8 gap-1 text-xs font-semibold"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal for Admins */}
      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-popover p-6 shadow-xl text-popover-foreground">
            <button
              onClick={() => setReviewModalRequest(null)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground capitalize">
                {reviewAction} Request
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatINR(Number(reviewModalRequest.amount))} for {reviewModalRequest.requester?.name || reviewModalRequest.requested_by}
              </p>
            </div>

            {reviewError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                <div className="font-semibold text-foreground">
                  {reviewModalRequest.title}
                </div>
                <p className="mt-1 text-muted-foreground line-clamp-2">
                  {reviewModalRequest.reason}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">
                  Admin Remarks / Review Notes
                </label>
                <textarea
                  rows={3}
                  placeholder={`Reason for ${reviewAction === 'approve' ? 'approval' : 'rejection'} or disbursement instructions...`}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                This action is permanently logged into the audit ledger and dispatches an email update via Resend.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalRequest(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                  size="sm"
                  onClick={handleConfirmReview}
                  disabled={actionLoadingId !== null}
                >
                  {actionLoadingId ? 'Processing...' : `Confirm ${reviewAction === 'approve' ? 'Approval' : 'Rejection'}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
