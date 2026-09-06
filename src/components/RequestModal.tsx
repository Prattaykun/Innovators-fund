'use client';

import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';

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

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Raise Fund Request
            </h2>
            <p className="text-xs text-zinc-500">
              Submitted by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentUserName}</span> for admin review
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Request Title / Purpose *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Cloud GPU Server for AI Prototype"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Amount and Category Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Amount (₹ INR) *
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-zinc-400">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  max={availableBalance}
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full rounded-xl border bg-white pl-8 pr-3.5 py-2.5 text-sm font-semibold outline-none transition dark:bg-zinc-800 ${
                    isOverBudget
                      ? 'border-red-500 text-red-600 focus:ring-red-500/20'
                      : 'border-zinc-300 text-zinc-900 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-zinc-700 dark:text-white'
                  }`}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
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
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/60">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Current Available Pool:</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {formatINR(availableBalance)}
              </span>
            </div>
            {numAmount > 0 && (
              <div className="mt-1.5 flex items-center justify-between border-t border-zinc-200 pt-1.5 dark:border-zinc-700">
                <span className="text-zinc-500">Projected Balance After Approval:</span>
                <span
                  className={`font-bold ${
                    isOverBudget ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isOverBudget ? 'Exceeds Available Pool!' : formatINR(projectedBalance)}
                </span>
              </div>
            )}
          </div>

          {/* Reason / Justification */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Detailed Reason &amp; Impact *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain why this fund is required, what deliverables it produces, and how it will be spent..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <p className="text-[11px] text-zinc-500">
            * Once submitted, an audit log will be created and an email alert will be sent via Resend to admins Snehansh and Prattay for review.
          </p>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isOverBudget || numAmount <= 0}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting &amp; Notifying...</span>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
