'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Shield,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Check,
  Copy,
  Plus,
} from 'lucide-react';
import { MemberRole } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
}

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  availableBalance,
  onOpenRequestModal,
  onOpenProfileModal,
  onLogout,
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
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-white shadow-2xs dark:bg-zinc-900">
              <img
                src="/logo.jpg"
                alt="Team Innovators Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-foreground">
                  Team Innovators
                </span>
                <Badge variant="outline" className="hidden text-[10px] font-semibold text-muted-foreground sm:inline-flex">
                  ₹1.5L Pool
                </Badge>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Fund Governance &amp; Audit
              </p>
            </div>
          </div>

          {/* Balance Pill */}
          <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Available:</span>
            <span className="font-semibold tabular-nums text-foreground">{formattedBalance}</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button
            variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
            className="text-xs font-medium"
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('requests')}
            className="text-xs font-medium"
          >
            Requests
          </Button>
          <Button
            variant={activeTab === 'audits' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('audits')}
            className="text-xs font-medium"
          >
            Audit Trail
          </Button>
          <Button
            variant={activeTab === 'links' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('links')}
            className="text-xs font-medium"
          >
            Members
          </Button>

          {/* Admin Portal Tab - Snehansh & Prattay Only */}
          {isAdmin && (
            <Button
              variant={activeTab === 'admin' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('admin')}
              className={`gap-1.5 text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800'
                  : 'border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900 dark:border-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-950/30'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Admin Portal</span>
              <span className="rounded-full bg-purple-200/80 px-1.5 py-0.2 text-[9px] font-bold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Snehansh &amp; Prattay
              </span>
            </Button>
          )}
        </nav>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Request Button */}
          <Button
            size="sm"
            onClick={onOpenRequestModal}
            className="h-8 gap-1.5 px-3 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Request Funds</span>
            <span className="sm:hidden">Request</span>
          </Button>

          {/* Current User Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-border bg-background p-1.5 text-left text-xs font-medium shadow-2xs transition-colors hover:bg-accent"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md font-bold uppercase text-white bg-zinc-800 dark:bg-zinc-700"
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden text-left lg:block">
                  <div className="font-semibold text-foreground leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg animate-in fade-in">
                    {/* User Header */}
                    <div className="border-b border-border/80 p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {currentUser.name}
                        </span>
                        <Badge
                          variant={isAdmin ? 'admin' : 'secondary'}
                          className="text-[10px] uppercase font-semibold"
                        >
                          {currentUser.role}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {currentUser.email || 'No notification email set'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      {currentUser.directToken && (
                        <button
                          onClick={copyMyDirectLink}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          {copiedLink ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span>{copiedLink ? 'Link Copied' : 'Copy Direct Link'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfileModal();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Settings &amp; Email</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setActiveTab('admin');
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                        >
                          <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Admin Portal (Snehansh &amp; Prattay)</span>
                        </button>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border/80 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
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
            <Button
              size="sm"
              variant="default"
              onClick={() => setActiveTab('links')}
              className="text-xs"
            >
              Sign In
            </Button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-3 md:hidden">
          <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/60 p-2.5">
            <span className="text-xs font-medium text-muted-foreground">
              Available Balance:
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {formattedBalance}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="justify-start text-xs font-medium"
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'requests' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveTab('requests');
                setMobileMenuOpen(false);
              }}
              className="justify-start text-xs font-medium"
            >
              Requests
            </Button>
            <Button
              variant={activeTab === 'audits' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveTab('audits');
                setMobileMenuOpen(false);
              }}
              className="justify-start text-xs font-medium"
            >
              Audit Trail
            </Button>
            <Button
              variant={activeTab === 'links' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveTab('links');
                setMobileMenuOpen(false);
              }}
              className="justify-start text-xs font-medium"
            >
              Members
            </Button>
            {isAdmin && (
              <Button
                variant={activeTab === 'admin' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 justify-start text-xs font-semibold"
              >
                <Shield className="h-3.5 w-3.5 text-blue-600 mr-1" />
                Admin Portal (Snehansh &amp; Prattay)
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
