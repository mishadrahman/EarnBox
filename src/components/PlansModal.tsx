import React from 'react';
import { MembershipPlan, UserProfile } from '../types';
import {
  X,
  Sparkles,
  Check,
  Shield,
  Zap,
  Crown,
  Lock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';

interface PlansModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: 'basic_10' | 'vip_50' | 'master_100') => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  user,
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  if (!isOpen) return null;

  const plans = DataService.getMembershipPlans();

  const isCurrentPlan = (planId: string) => {
    if (planId === 'free' && (user.accountTier === 'inactive' || user.accountTier === 'pending_activation')) return true;
    if (planId === 'basic_10' && user.accountTier === 'active') return true;
    if (planId === 'vip_50' && user.accountTier === 'vip') return true;
    if (planId === 'master_100' && user.accountTier === 'master') return true;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                মেম্বারশিপ প্ল্যান ও একাউন্ট অ্যাক্টিভেশন
              </h3>
              <p className="text-[11px] text-slate-500">
                কাজ করার লিমিট বাড়ান ও ইনস্ট্যান্ট বিকাশ/নগদ ক্যাশআউট পান
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                বর্তমান স্ট্যাটাস:{' '}
                <span className="font-extrabold uppercase">
                  {user.accountTier === 'inactive' && 'ফ্রি মেম্বার (ইনঅ্যাক্টিভ)'}
                  {user.accountTier === 'pending_activation' && 'অ্যাক্টিভেশন পেন্ডিং'}
                  {user.accountTier === 'active' && 'স্টার্টার অ্যাক্টিভ (৳১০)'}
                  {user.accountTier === 'vip' && 'ভিআইপি প্রো (৳৫০)'}
                  {user.accountTier === 'master' && 'মাস্টার টিম (৳১০০)'}
                </span>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="space-y-3">
            {plans.map((plan) => {
              const active = isCurrentPlan(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-4 border transition-all relative overflow-hidden ${
                    plan.isPopular
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/40 to-white'
                      : active
                      ? 'border-slate-300 bg-slate-50/70'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-xs">
                      সবচেয়ে জনপ্রিয়
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-sm text-slate-900">{plan.nameBn}</h4>
                        {active && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            বর্তমান প্ল্যান
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{plan.name}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">
                        {plan.priceBDT === 0 ? 'ফ্রি' : `৳${plan.priceBDT}`}
                      </div>
                      {plan.cashbackBDT > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md inline-block">
                          ৳{plan.cashbackBDT} ব্যাক!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    {active ? (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-500 font-bold py-2 rounded-xl text-xs cursor-default"
                      >
                        বর্তমান সক্রিয় প্ল্যান
                      </button>
                    ) : plan.id === 'free' ? (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-400 font-bold py-2 rounded-xl text-xs cursor-default"
                      >
                        ডিফল্ট ফ্রি
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          triggerHaptic('medium');
                          onClose();
                          onSelectPlan(plan.id as 'basic_10' | 'vip_50' | 'master_100');
                        }}
                        className={`w-full font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs active:scale-98 ${
                          plan.isPopular
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>{plan.priceBDT === 10 ? '৳১০ দিয়ে সক্রিয় করুন' : `${plan.nameBn} নিন`}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-center text-slate-400">
            বিকাশ, নগদ বা রকেট সেন্ড মানি করে ট্রানজেকশন আইডি দিলে ৫-১৫ মিনিটে প্ল্যান একটিভ হয়।
          </p>
        </div>
      </div>
    </div>
  );
};
