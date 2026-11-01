import React from 'react';
import { WalletData } from '../types';
import { ArrowUpRight, History, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

interface WalletCardProps {
  wallet: WalletData;
  onWithdrawClick: () => void;
  onHistoryClick: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onWithdrawClick,
  onHistoryClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white p-4 sm:p-5 shadow-lg shadow-emerald-900/15">
      <div className="relative z-10 space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-emerald-100/90 text-xs font-bold tracking-wider uppercase">
            Available Balance
          </span>
          <div className="flex items-center space-x-1 text-emerald-200/90 text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            <span>BD ৳</span>
          </div>
        </div>

        {/* Big Balance Amount */}
        <div className="flex items-baseline space-x-1.5 py-0.5">
          <span className="text-2xl font-light text-emerald-200">৳</span>
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {wallet.availableBalance.toFixed(2)}
          </span>
          <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider ml-1">
            BDT
          </span>
        </div>

        {/* Secondary metrics (Pending & Total Earned) */}
        <div className="grid grid-cols-2 gap-2 pt-2.5 pb-1 border-t border-emerald-500/30">
          <div>
            <div className="text-[11px] text-emerald-200/80 font-medium">Pending Balance</div>
            <div className="text-sm font-bold text-white flex items-center space-x-0.5 mt-0.5">
              <span>৳</span>
              <span>{wallet.pendingBalance.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-emerald-200/80 font-medium">Total Earned</div>
            <div className="text-sm font-bold text-emerald-200 flex items-center space-x-0.5 mt-0.5">
              <span>৳</span>
              <span>{wallet.totalEarned.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onWithdrawClick();
            }}
            className="flex-1 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-[0.98] font-bold text-xs sm:text-sm py-2.5 px-3 rounded-2xl shadow-sm flex items-center justify-center space-x-1.5 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Withdraw Cash</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onHistoryClick();
            }}
            className="bg-emerald-800/80 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs py-2.5 px-3 rounded-2xl border border-emerald-500/40 flex items-center justify-center space-x-1 transition-all shrink-0"
          >
            <History className="w-3.5 h-3.5 text-emerald-200" />
            <span>History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
