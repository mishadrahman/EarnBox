import React, { useState } from 'react';
import { X, Sparkles, Trophy, Gift, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';
import confetti from 'canvas-confetti';

interface LuckySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardWon: () => void;
}

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  isOpen,
  onClose,
  onRewardWon,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<{ label: string; amount: number } | null>(null);

  if (!isOpen) return null;

  const prizes = [
    { label: '৳1.00 BDT', amount: 1.0, color: 'bg-emerald-500' },
    { label: '৳2.00 BDT', amount: 2.0, color: 'bg-blue-500' },
    { label: '৳0.50 BDT', amount: 0.5, color: 'bg-amber-500' },
    { label: '৳5.00 BDT', amount: 5.0, color: 'bg-purple-500' },
    { label: '৳10.00 VIP', amount: 10.0, color: 'bg-rose-500' },
    { label: '৳1.50 BDT', amount: 1.5, color: 'bg-teal-500' },
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    triggerHaptic('medium');
    setIsSpinning(true);
    setWonPrize(null);

    // Pick a rewarding prize
    const selected = prizes[Math.floor(Math.random() * prizes.length)];

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selected);
      triggerHaptic('success');
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      // Credit wallet via DataService
      DataService.creditLuckySpinReward(selected.amount);
      onRewardWon();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl text-center space-y-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Daily Lucky Wheel
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wheel Display */}
        <div className="relative py-4 flex items-center justify-center">
          <div
            className={`w-48 h-48 rounded-full border-8 border-amber-400 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 shadow-xl flex items-center justify-center text-white font-extrabold transition-transform duration-[2500ms] ease-out ${
              isSpinning ? 'rotate-[1440deg]' : 'rotate-0'
            }`}
          >
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex flex-col items-center justify-center">
              <Gift className="w-8 h-8 text-amber-300 animate-bounce" />
              <span className="text-[10px] tracking-tight uppercase font-bold text-amber-200">
                Win Cash
              </span>
            </div>
          </div>

          {/* Pointer */}
          <div className="absolute top-2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-500 drop-shadow-md z-10" />
        </div>

        {/* Prize Alert */}
        {wonPrize ? (
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 animate-fade-in space-y-1">
            <div className="text-xs font-bold text-emerald-800">Congratulations!</div>
            <div className="text-lg font-extrabold text-emerald-700">
              +{wonPrize.label}
            </div>
            <p className="text-[10px] text-slate-500">
              Credited directly to your available balance!
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Spin once every 24 hours to win free Bangladeshi Taka added to your wallet!
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || wonPrize !== null}
          className={`w-full py-3 rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center space-x-1.5 ${
            isSpinning || wonPrize !== null
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-600/20'
          }`}
        >
          <span>{isSpinning ? 'Spinning Wheel...' : wonPrize ? 'Claimed Today!' : 'Spin & Win Now'}</span>
          {!isSpinning && !wonPrize && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
