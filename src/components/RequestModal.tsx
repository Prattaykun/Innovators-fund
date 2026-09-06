'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Plus, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  currentUserName: string;
  onRequestCreated: () => void;
}

const CATEGORIES = [
  'Development & Software',
  'Hosting & Cloud Infrastructure',
  'Hardware & Equipment',
  'Marketing & Growth',
  'Competitions & Events',
  'Research & Data',
  'Operations & Miscellaneous',
];

export default function RequestModal({
  isOpen,
  onClose,
  availableBalance,
  currentUserName,
  onRequestCreated,
}: RequestModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const isOverBudget = numAmount > availableBalance;
  const projectedBalance = Math.max(0, availableBalance - numAmount);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for your request');
      return;
    }

    if (numAmount <= 0) {
      setError('Please enter an amount greater than ₹0');
      return;
    }

    if (isOverBudget) {
      setError(`Amount cannot exceed the current available balance (${formatINR(availableBalance)})`);
      return;
    }

    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide a detailed reason/justification (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: numAmount,
          category,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit fund request');
      }

      // Trigger celebration
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Reset form
      setTitle('');
      setAmount('');
      setReason('');
      onClose();
      onRequestCreated();
    } catch (err: any) {
      setError(err?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-popover p-6 shadow-xl text-popover-foreground">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Disbursement Request
            </Badge>
          </div>
          <h2 className="mt-1.5 text-lg font-bold text-foreground">
            Raise Fund Request
          </h2>
          <p className="text-xs text-muted-foreground">
            Initiated by <span className="font-semibold text-foreground">{currentUserName}</span> for administrator review
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-foreground">
              Request Title / Expense Item *
            </label>
            <Input
              required
              placeholder="e.g. Cloud GPU Compute Server for Model Inference"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 text-xs"
            />
          </div>

          {/* Amount and Category Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-foreground">
                Amount (₹ INR) *
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-2 text-xs font-semibold text-muted-foreground">
                  ₹
                </span>
                <Input
                  type="number"
                  required
                  min="1"
                  max={availableBalance}
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`pl-7 text-xs font-semibold tabular-nums ${
                    isOverBudget ? 'border-destructive focus-visible:ring-destructive text-destructive' : ''
                  }`}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-foreground">
                Expense Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Balance Preview Card */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Available Pool:</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatINR(availableBalance)}
              </span>
            </div>
            {numAmount > 0 && (
              <div className="flex items-center justify-between border-t border-border pt-1.5">
                <span className="text-muted-foreground">Projected Remaining:</span>
                <span
                  className={`font-semibold tabular-nums ${
                    isOverBudget ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isOverBudget ? 'Exceeds Available Pool' : formatINR(projectedBalance)}
                </span>
              </div>
            )}
          </div>

          {/* Reason / Justification */}
          <div>
            <label className="block text-xs font-medium text-foreground">
              Detailed Reason &amp; Deliverables *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain why this disbursement is necessary, specific line items, and deliverables produced..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            Submitting records a permanent audit entry and sends instant email alerts via Resend to administrators Snehansh and Prattay.
          </p>

          {/* Submit Actions */}
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
              disabled={loading || isOverBudget || numAmount <= 0}
              className="gap-1.5"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
