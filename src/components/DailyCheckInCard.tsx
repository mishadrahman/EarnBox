import React from 'react';
import { DailyCheckInState } from '../types';
import { CheckCircle2, Gift, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../services/telegram';

interface DailyCheckInCardProps {
  checkInState: DailyCheckInState;
  onClaim: () => void;
}

export const DailyCheckInCard: React.FC<DailyCheckInCardProps> = ({
  checkInState,
  onClaim,
}) => {
  const days = [
    { day: 1, reward: 2 },
    { day: 2, reward: 3 },
    { day: 3, reward: 4 },
    { day: 4, reward: 5 },
    { day: 5, reward: 6 },
    { day: 6, reward: 8 },
    { day: 7, reward: 15, isMystery: true },
  ];

  const handleClaim = () => {
    triggerHaptic('success');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#16A34A', '#22C55E', '#EAB308', '#F59E0B'],
      });
    } catch (e) {}
    onClaim();
  };

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
              Daily Streak
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Streak: <span className="text-emerald-700 font-bold">{checkInState.streakCount} Days</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={!checkInState.canClaimToday}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center space-x-1 shrink-0 ${
            checkInState.canClaimToday
              ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-500/20'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>{checkInState.canClaimToday ? `Claim Day ${checkInState.currentDay}` : 'Claimed'}</span>
        </button>
      </div>

      {/* 7-Day Streak Pills */}
      <div className="grid grid-cols-7 gap-1 pt-0.5">
        {days.map((item) => {
          const isDone = item.day < checkInState.currentDay || (!checkInState.canClaimToday && item.day === checkInState.currentDay);
          const isCurrent = item.day === checkInState.currentDay && checkInState.canClaimToday;

          return (
            <div
              key={item.day}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl border transition-all text-center min-w-0 ${
                isDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isCurrent
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 text-amber-900 animate-pulse'
                  : 'bg-slate-50/70 border-slate-100 text-slate-400'
              }`}
            >
              <span className="text-[8px] font-bold text-slate-400 leading-tight">D{item.day}</span>
              <div className="my-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 mx-auto" />
                ) : (
                  <span className="text-[11px] font-extrabold leading-tight block">
                    {item.isMystery ? '🎁' : `৳${item.reward}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
