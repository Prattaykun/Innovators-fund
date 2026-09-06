'use client';

import React, { useState } from 'react';
import {
  Shield,
  User,
  Wallet,
  FileText,
  History,
  Link as LinkIcon,
  Settings,
  LogOut,
  Users,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Mail,
  Check,
  Copy,
} from 'lucide-react';
import { MemberRole } from '@/lib/types';

interface NavbarProps {
  currentUser: {
    id: string;
    name: string;
    role: MemberRole;
    email: string | null;
    directToken?: string;
  } | null;
  activeTab: 'dashboard' | 'requests' | 'audits' | 'links' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'requests' | 'audits' | 'links' | 'admin') => void;
  availableBalance: number;
  onOpenRequestModal: () => void;
  onOpenProfileModal: () => void;
  onLogout: () => void;
  onSwitchUser: (memberId: string) => void;
  allMembers: Array<{ id: string; name: string; role: MemberRole }>;
}

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  availableBalance,
  onOpenRequestModal,
  onOpenProfileModal,
  onLogout,
  onSwitchUser,
  allMembers,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(availableBalance);

  const isAdmin = currentUser?.role === 'admin';

  const copyMyDirectLink = () => {
    if (!currentUser?.directToken) return;
    const url = `${window.location.origin}/login?token=${currentUser.directToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex cursor-pointer items-center gap-2.5 transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-zinc-900 dark:text-white">
                <span>Innovators Fund</span>
                <span className="hidden rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 sm:inline-block">
                  ₹1.5L Pool
                </span>
              </div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Audited & Approved
              </p>
            </div>
          </div>

          {/* Balance Pill */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300 md:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>Balance: {formattedBalance}</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              activeTab === 'requests'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
            }`}
          >
            Fund Requests
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              activeTab === 'audits'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              activeTab === 'links'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
            }`}
          >
            Member Links
          </button>

          {/* Admin Tab - Only for Snehansh and Prattay */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                activeTab === 'admin'
                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200'
                  : 'text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/40'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Portal</span>
            </button>
          )}
        </nav>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Request Button */}
          <button
            onClick={onOpenRequestModal}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Request Funds</span>
            <span className="sm:hidden">Request</span>
          </button>

          {/* Current User Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1.5 text-left text-xs font-medium shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md font-bold uppercase text-white ${
                    isAdmin ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden text-left lg:block">
                  <div className="font-semibold text-zinc-900 dark:text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {isAdmin ? 'Admin' : 'Member'}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                    {/* User Header */}
                    <div className="border-b border-zinc-100 p-2 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {currentUser.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          {currentUser.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {currentUser.email || 'No email set (click settings)'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      {currentUser.directToken && (
                        <button
                          onClick={copyMyDirectLink}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          {copiedLink ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-zinc-400" />
                          )}
                          <span>{copiedLink ? 'Direct Link Copied!' : 'Copy My Direct Link'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfileModal();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <Settings className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Profile & Email Settings</span>
                      </button>
                    </div>

                    {/* Fast Switch Identity */}
                    <div className="border-t border-zinc-100 pt-2 dark:border-zinc-800">
                      <div className="px-2 pb-1 text-[10px] font-semibold uppercase text-zinc-400">
                        Fast Switch Member
                      </div>
                      <div className="max-h-40 space-y-0.5 overflow-y-auto">
                        {allMembers.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onSwitchUser(m.id);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                              m.id === currentUser.id
                                ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-white'
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span>{m.name}</span>
                            <span className="text-[10px] opacity-70">
                              {m.role === 'admin' ? '👑 Admin' : 'Member'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-zinc-100 pt-1 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('links')}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              Log In
            </button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/40">
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Available Pool Balance:
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {formattedBalance}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`rounded-lg p-2 text-left text-xs font-medium ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-100 text-zinc-900 font-bold dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('requests');
                setMobileMenuOpen(false);
              }}
              className={`rounded-lg p-2 text-left text-xs font-medium ${
                activeTab === 'requests'
                  ? 'bg-zinc-100 text-zinc-900 font-bold dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Fund Requests
            </button>
            <button
              onClick={() => {
                setActiveTab('audits');
                setMobileMenuOpen(false);
              }}
              className={`rounded-lg p-2 text-left text-xs font-medium ${
                activeTab === 'audits'
                  ? 'bg-zinc-100 text-zinc-900 font-bold dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Audit Trail
            </button>
            <button
              onClick={() => {
                setActiveTab('links');
                setMobileMenuOpen(false);
              }}
              className={`rounded-lg p-2 text-left text-xs font-medium ${
                activeTab === 'links'
                  ? 'bg-zinc-100 text-zinc-900 font-bold dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Member Links
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`col-span-2 rounded-lg p-2 text-left text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300`}
              >
                👑 Admin Portal (Snehansh & Prattay)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
