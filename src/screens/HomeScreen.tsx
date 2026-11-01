import React from 'react';
import {
  UserProfile,
  WalletData,
  Offer,
  DailyCheckInState,
  Transaction,
  ScreenType,
  OfferCategory,
  MicroJob,
} from '../types';
import { WalletCard } from '../components/WalletCard';
import { DailyCheckInCard } from '../components/DailyCheckInCard';
import { StartEarningSection } from '../components/StartEarningSection';
import {
  Sparkles,
  ChevronRight,
  Lock,
  Gift,
  Clock,
  Send,
  History,
  CheckCircle2,
  Flame,
  Crown,
  Zap,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';

interface HomeScreenProps {
  user: UserProfile;
  wallet: WalletData;
  offers: Offer[];
  checkInState: DailyCheckInState;
  transactions: Transaction[];
  onNavigate: (screen: ScreenType) => void;
  onSelectCategory: (category: OfferCategory) => void;
  onOpenOffer: (offer: Offer) => void;
  onOpenWithdraw: () => void;
  onOpenTxDetails: (tx: Transaction) => void;
  onClaimDailyCheckIn: () => void;
  onOpenActivation: () => void;
  onOpenPlans: () => void;
  onOpenLuckySpin: () => void;
  onOpenMicroJob?: (job: MicroJob) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  wallet,
  offers,
  checkInState,
  transactions,
  onNavigate,
  onSelectCategory,
  onOpenOffer,
  onOpenWithdraw,
  onOpenTxDetails,
  onClaimDailyCheckIn,
  onOpenActivation,
  onOpenPlans,
  onOpenLuckySpin,
  onOpenMicroJob,
}) => {
  const isActivated = user.accountTier === 'active' || user.accountTier === 'vip' || user.accountTier === 'master';
  const isPendingActivation = user.accountTier === 'pending_activation';
  const microJobs = DataService.getMicroJobs();

  return (
    <div className="space-y-3.5 pb-20">
      {/* Account Activation & VIP Plan Status Banner */}
      <div
        onClick={() => {
          triggerHaptic('medium');
          if (isActivated) {
            onOpenPlans();
          } else {
            onOpenActivation();
          }
        }}
        className={`rounded-3xl p-3.5 border transition-all cursor-pointer relative overflow-hidden shadow-xs active:scale-[0.99] ${
          isPendingActivation
            ? 'bg-amber-500 text-white border-amber-400'
            : isActivated
            ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white border-emerald-800'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                {isPendingActivation ? 'Under Review' : isActivated ? 'Active Member' : 'Account Status'}
              </span>
              <span className="text-amber-300 text-xs font-bold shrink-0">
                {isPendingActivation
                  ? 'TrxID Submitted'
                  : isActivated
                  ? user.accountTier === 'master'
                    ? 'Master Team Plan (+40%)'
                    : user.accountTier === 'vip'
                    ? 'VIP Pro Plan (+20%)'
                    : 'Starter Active'
                  : 'Activation ৳10'}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold tracking-tight truncate leading-tight">
              {isPendingActivation
                ? 'Verifying your bKash/Nagad TrxID'
                : isActivated
                ? 'Withdrawals Unlocked & Verified'
                : 'Activate Account for ৳10 & Get ৳5 Cashback!'}
            </h3>
            <p className="text-[11px] text-slate-300 truncate leading-tight">
              {isPendingActivation
                ? 'Admin review takes 15–30 mins. Unlocks withdrawals.'
                : isActivated
                ? 'Tap to view membership plans and daily limits.'
                : 'Enables bKash/Nagad cashouts and verified status.'}
            </p>
          </div>

          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
            {isPendingActivation ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : isActivated ? (
              <Crown className="w-4 h-4 fill-slate-950" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Wallet Balance Hero Card (Starts at ৳0.00) */}
      <WalletCard
        wallet={wallet}
        onWithdrawClick={() => {
          if (!isActivated) {
            onOpenActivation();
          } else {
            onOpenWithdraw();
          }
        }}
        onHistoryClick={() => onNavigate('wallet')}
      />

      {/* 🔥 TRENDING HYPE WORK (FB, Telegram, WhatsApp, Gmail) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
              হট ট্রেন্ডিং কাজ (Account Create)
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('tasks');
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5"
          >
            <span>সব দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {microJobs.slice(0, 4).map((job) => (
            <div
              key={job.id}
              onClick={() => {
                triggerHaptic('medium');
                if (onOpenMicroJob) {
                  onOpenMicroJob(job);
                } else {
                  onNavigate('tasks');
                }
              }}
              className="bg-slate-50/80 hover:bg-emerald-50/50 p-2.5 rounded-2xl border border-slate-200/70 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">
                  {job.type === 'fb_create' && '📘'}
                  {job.type === 'telegram_create' && '✈️'}
                  {job.type === 'whatsapp_create' && '💬'}
                  {job.type === 'gmail_create' && '📧'}
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  ৳{job.payoutBDT}
                </span>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-700 truncate leading-snug">
                  {job.titleBn}
                </h4>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  ~{job.estimatedMinutes} মি. কাজ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Earning Action Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Lucky Spin Button */}
        <div
          onClick={() => {
            triggerHaptic('medium');
            onOpenLuckySpin();
          }}
          className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs cursor-pointer active:scale-95 transition-all flex items-center space-x-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">Daily Wheel</div>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Win up to ৳10</p>
          </div>
        </div>

        {/* Telegram Sponsor Tasks */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onSelectCategory('social');
            onNavigate('tasks');
          }}
          className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs cursor-pointer active:scale-95 transition-all flex items-center space-x-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">Social Tasks</div>
            <p className="text-[10px] text-sky-600 font-semibold truncate">Join & Earn ৳1.50</p>
          </div>
        </div>
      </div>

      {/* Daily Check-in Card (Day 1 ready) */}
      <DailyCheckInCard
        checkInState={checkInState}
        onClaim={onClaimDailyCheckIn}
      />

      {/* Start Earning Section (Simplified options) */}
      <StartEarningSection
        onSelectCategory={onSelectCategory}
        onNavigate={onNavigate}
      />

      {/* Recent Activity (Clean empty state if 0) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
            Recent Activity
          </h2>
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('wallet');
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5"
          >
            <span>History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-5 h-5 text-slate-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">No activity yet</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              Claim your Day 1 Check-in or start a Facebook/Telegram task to earn your first Bangladeshi Taka!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-xs divide-y divide-slate-100">
            {transactions.slice(0, 3).map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenTxDetails(tx);
                  }}
                  className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-800 truncate">{tx.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{tx.createdAt}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-extrabold ${
                        isPositive ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isPositive ? '+' : ''}৳{Math.abs(tx.amount).toFixed(2)}
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
