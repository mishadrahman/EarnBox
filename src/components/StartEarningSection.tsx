import React from 'react';
import { ScreenType, OfferCategory } from '../types';
import { Send, ClipboardCheck, Smartphone, Users, ChevronRight, Zap } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

interface StartEarningSectionProps {
  onSelectCategory: (category: OfferCategory) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const StartEarningSection: React.FC<StartEarningSectionProps> = ({
  onSelectCategory,
  onNavigate,
}) => {
  const earningCards = [
    {
      id: 'social',
      title: 'Telegram & Social Tasks',
      desc: 'Join official channels & subscribe for fast rewards',
      reward: '৳1.50 – ৳2.00',
      icon: Send,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
      action: () => {
        triggerHaptic('light');
        onSelectCategory('social');
        onNavigate('tasks');
      },
    },
    {
      id: 'survey',
      title: 'Quick Surveys',
      desc: 'Answer simple 3-minute polls about mobile recharge',
      reward: '৳10.00 / survey',
      icon: ClipboardCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      action: () => {
        triggerHaptic('light');
        onSelectCategory('survey');
        onNavigate('tasks');
      },
    },
    {
      id: 'app',
      title: 'App Tasks',
      desc: 'Open apps and claim verified welcome vouchers',
      reward: '৳8.00 / app',
      icon: Smartphone,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      action: () => {
        triggerHaptic('light');
        onSelectCategory('app');
        onNavigate('tasks');
      },
    },
    {
      id: 'referral',
      title: 'Refer Friends',
      desc: 'Share your link and earn ৳15 bonus per active referral',
      reward: '৳15 / friend',
      icon: Users,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      action: () => {
        triggerHaptic('light');
        onNavigate('referral');
      },
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500" />
          <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
            Earning Options
          </h2>
        </div>
        <button
          onClick={() => {
            triggerHaptic('light');
            onSelectCategory('all');
            onNavigate('tasks');
          }}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5"
        >
          <span>All Tasks</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {earningCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.action}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hover:border-slate-200 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                    <h3 className="font-bold text-xs text-slate-800 truncate">{card.title}</h3>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shrink-0">
                      {card.reward}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{card.desc}</p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
