import React from 'react';
import { UserProfile, ScreenType } from '../types';
import { Shield, User, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

interface HeaderProps {
  user: UserProfile;
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenAdvisor: () => void;
  onOpenActivation: () => void;
  isAdminMode?: boolean;
  onToggleAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onNavigate,
  onOpenAdvisor,
  onOpenActivation,
  isAdminMode,
  onToggleAdmin,
}) => {
  const isActivated = user.accountTier === 'active' || user.accountTier === 'vip';
  const isPending = user.accountTier === 'pending_activation';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3.5 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand & Subtitle */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onNavigate('home');
          }}
          className="flex items-center space-x-2 cursor-pointer min-w-0"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-500/20 shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                Earn<span className="text-emerald-600">Box</span>
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-200 uppercase shrink-0">
                BD
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate leading-tight">
              {user.firstName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Account Status Pill */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenActivation();
            }}
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border flex items-center space-x-1 transition-all active:scale-95 shrink-0 ${
              isActivated
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : isPending
                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            }`}
          >
            {isActivated ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Active</span>
              </>
            ) : isPending ? (
              <span>Verifying</span>
            ) : (
              <>
                <Lock className="w-2.5 h-2.5 text-amber-800" />
                <span>Activate ৳10</span>
              </>
            )}
          </button>

          {/* AI Advisor Button */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenAdvisor();
            }}
            className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-amber-500 border border-slate-200 rounded-xl active:scale-95 transition-all shrink-0"
            title="AI Advisor"
          >
            <Sparkles className="w-4 h-4 fill-amber-400" />
          </button>

          {/* User Avatar */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('profile');
            }}
            className="w-8 h-8 rounded-full ring-2 ring-emerald-500/30 overflow-hidden bg-slate-100 active:scale-95 transition-transform shrink-0"
          >
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <User className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
