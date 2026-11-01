import React, { useState } from 'react';
import { UserProfile, ScreenType } from '../types';
import {
  User,
  CreditCard,
  History,
  HelpCircle,
  FileText,
  Shield,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Lock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

interface ProfileScreenProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onOpenWithdraw: () => void;
  onOpenAdvisor: () => void;
  onOpenActivation: () => void;
  onToggleAdmin?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onNavigate,
  onOpenWithdraw,
  onOpenAdvisor,
  onOpenActivation,
  onToggleAdmin,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const isActivated = user.accountTier === 'active' || user.accountTier === 'vip';
  const isPending = user.accountTier === 'pending_activation';

  const handleCopyId = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(user.telegramId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const menuSections = [
    {
      title: 'Finance & Account',
      items: [
        {
          id: 'activation',
          label: 'Account Activation Status',
          desc: isActivated
            ? `Active ৳10 Member (${user.activationDate || 'Verified'})`
            : isPending
            ? 'Verification in progress (Pending Admin Review)'
            : 'Inactive • Tap to activate for ৳10 & get ৳5 cashback',
          icon: isActivated ? CheckCircle2 : Lock,
          action: () => onOpenActivation(),
        },
        {
          id: 'payments',
          label: 'Saved Payment Methods',
          desc: `${user.savedPaymentMethod || 'bKash'} (${user.savedPaymentNumber || '017XXXXXXXX'})`,
          icon: CreditCard,
          action: () => onOpenWithdraw(),
        },
        {
          id: 'history',
          label: 'Transaction History',
          desc: 'Ledger and withdrawal records',
          icon: History,
          action: () => onNavigate('wallet'),
        },
      ],
    },
    {
      title: 'Tools & Assistance',
      items: [
        {
          id: 'advisor',
          label: 'EarnBox AI Strategist',
          desc: 'High Thinking reasoning assistant',
          icon: ShieldCheck,
          action: () => onOpenAdvisor(),
        },
        {
          id: 'support',
          label: 'Help & Support Desk',
          desc: '24/7 Telegram community assistance',
          icon: HelpCircle,
          action: () =>
            setModalContent({
              title: 'EarnBox Support & Help Center',
              body: 'Have questions about tasks, ৳10 account activation, or bKash/Nagad payouts? Contact our official support bot @EarnBoxSupportBot on Telegram or email support@earnbox.com. Response times are usually within 2 hours.',
            }),
        },
      ],
    },
    {
      title: 'Legal & Policies',
      items: [
        {
          id: 'terms',
          label: 'Terms & Conditions',
          desc: 'Rules on offerwalls and cashouts',
          icon: FileText,
          action: () =>
            setModalContent({
              title: 'EarnBox Terms & Conditions',
              body: '1. One account per Telegram user and device.\n2. VPNs, proxies, and automated bots are strictly prohibited.\n3. Account activation fee (৳10) is a one-time charge to verify Bangladeshi users and prevent bot fraud.\n4. Minimum withdrawal is ৳50 BDT via bKash, Nagad, or Rocket.',
            }),
        },
        {
          id: 'privacy',
          label: 'Privacy Policy',
          desc: 'Zero-trust data security',
          icon: Shield,
          action: () =>
            setModalContent({
              title: 'EarnBox Privacy Policy',
              body: 'We prioritize your privacy. We store only your Telegram identifier, username, and requested cashout mobile numbers. We never sell your personal information to third parties.',
            }),
        },
      ],
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full mx-auto ring-4 ring-emerald-500/20 overflow-hidden bg-slate-100 mb-3 shadow-md">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt={user.firstName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>

        <h2 className="text-base font-extrabold text-slate-900">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-xs text-slate-500 font-medium">@{user.username}</p>

        {/* Telegram ID with Copy */}
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-[11px] font-mono text-slate-600 flex items-center space-x-1">
            <span>TG ID: {user.telegramId}</span>
            <button
              onClick={handleCopyId}
              className="p-0.5 text-slate-400 hover:text-emerald-600"
              title="Copy TG ID"
            >
              {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <span
            onClick={onOpenActivation}
            className={`text-[10px] font-bold px-2 py-1 rounded-xl border flex items-center space-x-1 cursor-pointer ${
              isActivated
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {isActivated ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>৳10 Active</span>
              </>
            ) : (
              <>
                <Lock className="w-2.5 h-2.5 text-amber-700" />
                <span>Activate Account</span>
              </>
            )}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          Member since: <span className="font-semibold text-slate-600">{user.memberSince}</span>
        </div>
      </div>

      {/* Activation Action Card if inactive */}
      {!isActivated && (
        <div
          onClick={onOpenActivation}
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-4 shadow-md cursor-pointer flex items-center justify-between active:scale-[0.99] transition-all"
        >
          <div className="space-y-1 max-w-[80%]">
            <span className="text-[10px] font-extrabold uppercase bg-black/20 px-2 py-0.5 rounded-full">
              Upgrade Account
            </span>
            <h4 className="text-xs font-extrabold leading-snug">
              Activate for ৳10 & Get ৳5 Cashback
            </h4>
            <p className="text-[10px] text-amber-100">
              Enables withdrawals and priority customer service.
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Menu Sections */}
      <div className="space-y-3">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              {sec.title}
            </h4>

            <div className="bg-white rounded-3xl p-1.5 border border-slate-100 shadow-xs divide-y divide-slate-100">
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      triggerHaptic('light');
                      item.action();
                    }}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{item.label}</h5>
                        <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legal & Policy Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="font-extrabold text-base text-slate-900">{modalContent.title}</h3>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto no-scrollbar">
              {modalContent.body}
            </p>
            <button
              onClick={() => setModalContent(null)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-2xl text-xs hover:bg-emerald-700 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
