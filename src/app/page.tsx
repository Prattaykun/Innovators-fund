'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import FundOverview from '@/components/FundOverview';
import RequestsList from '@/components/RequestsList';
import AuditTrail from '@/components/AuditTrail';
import DirectLinksView from '@/components/DirectLinksView';
import AdminPortalView from '@/components/AdminPortalView';
import RequestModal from '@/components/RequestModal';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import LoadingSwapScreen from '@/components/LoadingSwapScreen';
import { FundMetrics, FundRequest, Member, MemberRole } from '@/lib/types';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: MemberRole;
    email: string | null;
    directToken?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'audits' | 'links' | 'admin'>('dashboard');
  const [metrics, setMetrics] = useState<FundMetrics>({
    totalInitial: 150000,
    totalApproved: 0,
    availableBalance: 150000,
    pendingAmount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetRequestId, setTargetRequestId] = useState<string | null>(null);

  // Modals
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        // Not authenticated -> redirect to login page
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  }, []);

  // Fetch fund data
  const fetchData = useCallback(async () => {
    try {
      const [fundRes, reqsRes, memsRes] = await Promise.all([
        fetch('/api/fund'),
        fetch('/api/requests'),
        fetch('/api/members/public'),
      ]);

      const fundData = await fundRes.json();
      if (fundData.metrics) {
        setMetrics(fundData.metrics);
      }

      const reqsData = await reqsRes.json();
      if (reqsData.requests) {
        setRequests(reqsData.requests);
      }

      const memsData = await memsRes.json();
      if (memsData.members) {
        setMembers(memsData.members);
      }
    } catch (err) {
      console.error('Failed to fetch fund data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchData();

    // Check URL parameters for tab and deep-linking to a specific request
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const reqParam = params.get('request');

      if (reqParam) {
        setTargetRequestId(reqParam);
        setActiveTab('requests');
      } else if (tabParam && ['dashboard', 'requests', 'audits', 'links', 'admin'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, [fetchUser, fetchData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableBalance={metrics.availableBalance}
        onOpenRequestModal={() => setRequestModalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSwapScreen message="Synchronizing Team Innovators treasury & ledger..." />
        ) : (
          <div className="space-y-6">
            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <FundOverview
                  metrics={metrics}
                  onOpenRequestModal={() => setRequestModalOpen(true)}
                  onViewRequests={() => setActiveTab('requests')}
                  onViewAudits={() => setActiveTab('audits')}
                />

                {/* Split grid: Recent Requests & Recent Audits Preview */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Requests preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                        Recent Fund Requests
                      </h3>
                      <button
                        onClick={() => setActiveTab('requests')}
                        className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        View All ({requests.length}) &rarr;
                      </button>
                    </div>
                    <RequestsList
                      requests={requests.slice(0, 3)}
                      currentUser={currentUser}
                      onRefresh={fetchData}
                      onOpenRequestModal={() => setRequestModalOpen(true)}
                    />
                  </div>

                  {/* Audit preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                        Live Audit Trail
                      </h3>
                      <button
                        onClick={() => setActiveTab('audits')}
                        className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        Full Audit Ledger &rarr;
                      </button>
                    </div>
                    <AuditTrail />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Requests */}
            {activeTab === 'requests' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                      Fund Disbursement Requests
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Submit requests for project expenses or review as Administrator (Snehansh &amp; Prattay)
                    </p>
                  </div>
                  <button
                    onClick={() => setRequestModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Raise Request</span>
                  </button>
                </div>

                <RequestsList
                  requests={requests}
                  currentUser={currentUser}
                  highlightRequestId={targetRequestId}
                  onRefresh={fetchData}
                  onOpenRequestModal={() => setRequestModalOpen(true)}
                />
              </div>
            )}

            {/* Tab: Audits */}
            {activeTab === 'audits' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Audit Trail &amp; Ledger
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Real-time chronological timeline recording initial pool creation, fund approvals, rejections, and profile updates with before/after balance tracking.
                  </p>
                </div>

                <AuditTrail />
              </div>
            )}

            {/* Tab: Member Links */}
            {activeTab === 'links' && (
              <div className="animate-in fade-in duration-300">
                <DirectLinksView
                  members={members}
                  currentUserId={currentUser?.id}
                  currentUserRole={currentUser?.role}
                  onOpenProfileModal={() => setProfileModalOpen(true)}
                />
              </div>
            )}

            {/* Tab: Admin Portal (Snehansh and Prattay Only) */}
            {activeTab === 'admin' && currentUser?.role === 'admin' && (
              <div className="animate-in fade-in duration-300">
                <AdminPortalView
                  currentUserName={currentUser.name}
                  onRefreshAll={fetchData}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Innovators Fund Management System &bull; ₹1,50,000 Initial Pool
          </span>
          <span>
            Admins: <strong>Snehansh</strong> &amp; <strong>Prattay</strong> &bull; Resend Email Alerts Enabled
          </span>
        </div>
      </footer>

      {/* Request Modal */}
      <RequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        availableBalance={metrics.availableBalance}
        currentUserName={currentUser?.name || 'Member'}
        onRequestCreated={fetchData}
      />

      {/* Profile & Email Settings Modal */}
      {currentUser && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          currentUser={currentUser}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
