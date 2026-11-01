/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ScreenType,
  OfferCategory,
  UserProfile,
  WalletData,
  Offer,
  SocialTask,
  WithdrawalRequest,
  ActivationRequest,
  Transaction,
  DailyCheckInState,
  AdminStats,
  AdminPaymentConfig,
  MicroJob,
} from './types';
import { DataService } from './services/dataService';
import { initTelegramApp, isInsideTelegram, triggerHaptic } from './services/telegram';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfferDetailsModal } from './components/OfferDetailsModal';
import { WithdrawModal } from './components/WithdrawModal';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { AIAdvisorDrawer } from './components/AIAdvisorDrawer';
import { AccountActivationModal } from './components/AccountActivationModal';
import { LuckySpinModal } from './components/LuckySpinModal';
import { MicroJobModal } from './components/MicroJobModal';
import { PlansModal } from './components/PlansModal';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { TasksScreen } from './screens/TasksScreen';
import { ReferralScreen } from './screens/ReferralScreen';
import { WalletScreen } from './screens/WalletScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminScreen } from './screens/AdminScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory>('all');

  // App Data States
  const [user, setUser] = useState<UserProfile>(DataService.getUserProfile());
  const [wallet, setWallet] = useState<WalletData>(DataService.getWallet());
  const [offers, setOffers] = useState<Offer[]>(DataService.getOffers());
  const [socialTasks, setSocialTasks] = useState<SocialTask[]>(DataService.getSocialTasks());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(DataService.getWithdrawals());
  const [activations, setActivations] = useState<ActivationRequest[]>(DataService.getActivationRequests());
  const [transactions, setTransactions] = useState<Transaction[]>(DataService.getTransactions());
  const [checkInState, setCheckInState] = useState<DailyCheckInState>(DataService.getDailyCheckIn());
  const [referralData, setReferralData] = useState(DataService.getReferrals());
  const [adminStats, setAdminStats] = useState<AdminStats>(DataService.getAdminStats());
  const [adminConfig, setAdminConfig] = useState<AdminPaymentConfig>(DataService.getAdminPaymentConfig());

  // Modal States
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [selectedPlanForActivation, setSelectedPlanForActivation] = useState<'basic_10' | 'vip_50' | 'master_100'>('basic_10');
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [selectedMicroJob, setSelectedMicroJob] = useState<MicroJob | null>(null);
  const [isMicroJobModalOpen, setIsMicroJobModalOpen] = useState(false);
  const [isLuckySpinOpen, setIsLuckySpinOpen] = useState(false);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  // Initialize Telegram Mini App and Firestore Cloud sync
  useEffect(() => {
    initTelegramApp();
    DataService.initializeFirestore().catch((err) => {
      console.warn('Firestore initialization notice:', err);
    });
  }, []);

  // Sync state when DataService updates
  const refreshAllData = () => {
    setUser(DataService.getUserProfile());
    setWallet(DataService.getWallet());
    setOffers(DataService.getOffers());
    setSocialTasks(DataService.getSocialTasks());
    setWithdrawals(DataService.getWithdrawals());
    setActivations(DataService.getActivationRequests());
    setTransactions(DataService.getTransactions());
    setCheckInState(DataService.getDailyCheckIn());
    setReferralData(DataService.getReferrals());
    setAdminStats(DataService.getAdminStats());
    setAdminConfig(DataService.getAdminPaymentConfig());
  };

  useEffect(() => {
    const handleDataChanged = () => {
      refreshAllData();
    };
    window.addEventListener('earnbox_data_changed', handleDataChanged);
    return () => window.removeEventListener('earnbox_data_changed', handleDataChanged);
  }, []);

  const handleClaimDailyCheckIn = () => {
    const res = DataService.claimDailyCheckIn();
    if (res.success) {
      refreshAllData();
    }
  };

  // Route detection for standalone /admin
  const checkIsAdminPath = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash === '#/admin'
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminPath);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminPath());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToAdmin = () => {
    triggerHaptic('medium');
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
  };

  const navigateToUser = () => {
    triggerHaptic('light');
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    setActiveScreen('home');
  };

  // If visiting /admin, render dedicated standalone Admin Management Portal
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6">
          <AdminScreen
            stats={adminStats}
            withdrawals={withdrawals}
            activations={activations}
            offers={offers}
            socialTasks={socialTasks}
            adminConfig={adminConfig}
            onExitAdmin={navigateToUser}
            onRefreshData={refreshAllData}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Simulation / Browser Environment Banner */}
      {!isInsideTelegram() && (
        <div className="bg-emerald-950 text-emerald-200 text-[10px] px-3 py-1 font-semibold flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Telegram WebApp Mode (Preview Simulator)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-emerald-400 font-mono">BD ৳ BDT • Firestore</span>
            <button
              onClick={navigateToAdmin}
              className="text-amber-400 hover:text-amber-300 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 transition-colors"
            >
              Portal: /admin
            </button>
          </div>
        </div>
      )}

      {/* App Header */}
      <Header
        user={user}
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setActiveScreen(screen);
        }}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenActivation={() => setIsActivationOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3">
          <>
            {activeScreen === 'home' && (
              <HomeScreen
                user={user}
                wallet={wallet}
                offers={offers}
                checkInState={checkInState}
                transactions={transactions}
                onNavigate={setActiveScreen}
                onSelectCategory={setSelectedCategory}
                onOpenOffer={(offer) => setActiveOffer(offer)}
                onOpenWithdraw={() => {
                  if (user.accountTier === 'inactive' || user.accountTier === 'pending_activation') {
                    setIsActivationOpen(true);
                  } else {
                    setIsWithdrawOpen(true);
                  }
                }}
                onOpenTxDetails={(tx) => setActiveTx(tx)}
                onClaimDailyCheckIn={handleClaimDailyCheckIn}
                onOpenActivation={() => {
                  setSelectedPlanForActivation('basic_10');
                  setIsActivationOpen(true);
                }}
                onOpenPlans={() => setIsPlansOpen(true)}
                onOpenLuckySpin={() => setIsLuckySpinOpen(true)}
                onOpenMicroJob={(job) => {
                  setSelectedMicroJob(job);
                  setIsMicroJobModalOpen(true);
                }}
              />
            )}

            {activeScreen === 'tasks' && (
              <TasksScreen
                user={user}
                offers={offers}
                socialTasks={socialTasks}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenOffer={(offer) => setActiveOffer(offer)}
                onOpenActivation={() => {
                  setSelectedPlanForActivation('basic_10');
                  setIsActivationOpen(true);
                }}
                onOpenPlans={() => setIsPlansOpen(true)}
                onSocialTaskCompleted={refreshAllData}
                onOpenMicroJob={(job) => {
                  setSelectedMicroJob(job);
                  setIsMicroJobModalOpen(true);
                }}
              />
            )}

            {activeScreen === 'referral' && (
              <ReferralScreen referralData={referralData} />
            )}

            {activeScreen === 'wallet' && (
              <WalletScreen
                wallet={wallet}
                withdrawals={withdrawals}
                transactions={transactions}
                onOpenWithdraw={() => {
                  if (user.accountTier === 'inactive' || user.accountTier === 'pending_activation') {
                    setIsActivationOpen(true);
                  } else {
                    setIsWithdrawOpen(true);
                  }
                }}
                onOpenTxDetails={(tx) => setActiveTx(tx)}
              />
            )}

            {activeScreen === 'profile' && (
              <ProfileScreen
                user={user}
                onNavigate={setActiveScreen}
                onOpenWithdraw={() => {
                  if (user.accountTier === 'inactive' || user.accountTier === 'pending_activation') {
                    setIsActivationOpen(true);
                  } else {
                    setIsWithdrawOpen(true);
                  }
                }}
                onOpenAdvisor={() => setIsAdvisorOpen(true)}
                onOpenActivation={() => setIsActivationOpen(true)}
              />
            )}
          </>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setActiveScreen(screen);
        }}
        pendingCount={withdrawals.filter((w) => w.status === 'pending').length}
      />

      {/* Modals & Drawers */}
      <OfferDetailsModal
        offer={activeOffer}
        onClose={() => setActiveOffer(null)}
        onPostbackCredited={refreshAllData}
      />

      {isWithdrawOpen && (
        <WithdrawModal
          wallet={wallet}
          onClose={() => setIsWithdrawOpen(false)}
          onWithdrawSuccess={refreshAllData}
        />
      )}

      <AccountActivationModal
        user={user}
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
        onSuccess={refreshAllData}
        adminConfig={adminConfig}
        initialPlan={selectedPlanForActivation}
      />

      {/* Micro-Job Submission Modal (FB/TG/WA/Gmail) */}
      <MicroJobModal
        job={selectedMicroJob}
        user={user}
        isOpen={isMicroJobModalOpen}
        onClose={() => {
          setIsMicroJobModalOpen(false);
          setSelectedMicroJob(null);
        }}
        onSuccess={refreshAllData}
        onOpenPlans={() => setIsPlansOpen(true)}
      />

      {/* Membership Plans & VIP Tiers Modal */}
      <PlansModal
        user={user}
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
        onSelectPlan={(planId) => {
          setSelectedPlanForActivation(planId);
          setIsActivationOpen(true);
        }}
      />

      <LuckySpinModal
        isOpen={isLuckySpinOpen}
        onClose={() => setIsLuckySpinOpen(false)}
        onRewardWon={refreshAllData}
      />

      <TransactionDetailsModal
        transaction={activeTx}
        onClose={() => setActiveTx(null)}
      />

      <AIAdvisorDrawer
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        wallet={wallet}
      />
    </div>
  );
}
