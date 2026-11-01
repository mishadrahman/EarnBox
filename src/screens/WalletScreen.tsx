import React, { useState } from 'react';
import { WalletData, WithdrawalRequest, Transaction } from '../types';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ShieldCheck,
  History,
  Inbox,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

interface WalletScreenProps {
  wallet: WalletData;
  withdrawals: WithdrawalRequest[];
  transactions: Transaction[];
  onOpenWithdraw: () => void;
  onOpenTxDetails: (tx: Transaction) => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  wallet,
  withdrawals,
  transactions,
  onOpenWithdraw,
  onOpenTxDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'earnings' | 'withdrawals'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'earnings'
        ? tx.type === 'earning' || tx.type === 'bonus' || tx.type === 'referral' || tx.type === 'activation_cashback' || tx.type === 'lucky_spin'
        : tx.type === 'withdrawal';

    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getWithdrawalStatusBadge = (status: WithdrawalRequest['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Paid</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5 pb-20">
      {/* Wallet Summary Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Available Balance
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-emerald-600">৳</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {wallet.availableBalance.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-1">BDT</span>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenWithdraw();
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all shrink-0"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-slate-100 text-center">
          <div className="bg-slate-50/70 rounded-2xl p-2 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Pending</span>
            <span className="text-xs font-bold text-amber-600">৳{wallet.pendingBalance.toFixed(2)}</span>
          </div>
          <div className="bg-slate-50/70 rounded-2xl p-2 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Earned</span>
            <span className="text-xs font-bold text-emerald-700">৳{wallet.totalEarned.toFixed(2)}</span>
          </div>
          <div className="bg-slate-50/70 rounded-2xl p-2 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Withdrawn</span>
            <span className="text-xs font-bold text-slate-700">৳{wallet.totalWithdrawn.toFixed(2)}</span>
          </div>
        </div>

        {/* Cashout Notice */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-emerald-50/50 rounded-xl p-2 border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Minimum cashout is ৳50 via personal bKash, Nagad or Rocket.</span>
        </div>
      </div>

      {/* Recent Cashout Requests (or Clean Empty State) */}
      <div className="space-y-2">
        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
          Recent Cashout Requests
        </h3>

        {withdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs text-center space-y-1">
            <p className="text-xs text-slate-500 font-medium">No withdrawal requests yet.</p>
            <p className="text-[10px] text-slate-400">
              When you earn ৳50 or more, submit your cashout request here!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-xs divide-y divide-slate-100">
            {withdrawals.slice(0, 3).map((wd) => (
              <div key={wd.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{wd.paymentMethod}</span>
                    <span className="font-mono text-xs text-slate-500 truncate">{wd.accountNumber}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {wd.createdAt} • ID: {wd.id}
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900">
                    ৳{wd.amount.toFixed(2)}
                  </div>
                  {getWithdrawalStatusBadge(wd.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <History className="w-4 h-4 text-slate-700" />
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
              Transaction History
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            {filteredTransactions.length} records
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-center">
          {(['all', 'earnings', 'withdrawals'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveTab(tab);
                }}
                className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  isActive ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-xs space-y-1.5">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No transactions recorded</p>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
              Your task earnings, bonuses, and withdrawals will be displayed here in chronological order.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-xs divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenTxDetails(tx);
                  }}
                  className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer gap-2"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'withdrawal'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {tx.type === 'withdrawal' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{tx.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{tx.createdAt}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-extrabold ${
                        isPositive ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isPositive ? '+' : ''}৳{Math.abs(tx.amount).toFixed(2)}
                    </div>
                    <span className="text-[9px] font-bold uppercase text-emerald-600">
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
