import React from 'react';
import { ScreenType } from '../types';
import { Home, CheckSquare, Users, Wallet, User } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

interface BottomNavProps {
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  pendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onNavigate,
  pendingCount = 0,
}) => {
  const navItems = [
    { id: 'home' as ScreenType, label: 'Home', icon: Home },
    { id: 'tasks' as ScreenType, label: 'Tasks', icon: CheckSquare },
    { id: 'referral' as ScreenType, label: 'Referral', icon: Users },
    { id: 'wallet' as ScreenType, label: 'Wallet', icon: Wallet, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'profile' as ScreenType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-lg shadow-slate-900/5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic('selection');
                onNavigate(item.id);
              }}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center relative rounded-xl transition-all duration-200 ${
                isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight font-medium ${
                  isActive ? 'font-bold text-emerald-700' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="w-1 h-1 rounded-full bg-emerald-600 absolute bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
