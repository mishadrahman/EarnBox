import React, { useState } from 'react';
import { Transaction } from '../types';
import { X, Copy, Check, ArrowDownLeft, ArrowUpRight, Gift, Users, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopy = (text: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-xs border border-emerald-200">Completed</span>;
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full text-xs border border-amber-200">Pending</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-full text-xs border border-red-200">Rejected</span>;
    }
  };

  const isPositive = transaction.amount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Transaction Receipt</h3>
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

        {/* Receipt Slip Body */}
        <div className="p-6 text-center space-y-4">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
              transaction.type === 'withdrawal'
                ? 'bg-rose-50 text-rose-600'
                : transaction.type === 'bonus'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {transaction.type === 'withdrawal' ? (
              <ArrowUpRight className="w-7 h-7" />
            ) : transaction.type === 'bonus' ? (
              <Gift className="w-7 h-7" />
            ) : (
              <ArrowDownLeft className="w-7 h-7" />
            )}
          </div>

          <div>
            <div
              className={`text-2xl font-extrabold ${
                isPositive ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {isPositive ? '+' : ''}৳{Math.abs(transaction.amount).toFixed(2)} BDT
            </div>
            <p className="text-xs text-slate-500 mt-1">{transaction.title}</p>
          </div>

          <div className="flex justify-center">{getStatusBadge(transaction.status)}</div>

          {/* Breakdown Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs text-left">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Transaction ID</span>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-slate-800">{transaction.id}</span>
                <button
                  onClick={() => handleCopy(transaction.id)}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Reference / Postback ID</span>
              <span className="font-mono text-slate-700">{transaction.referenceId}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Type</span>
              <span className="font-bold text-slate-800 capitalize">{transaction.type}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Date & Time</span>
              <span className="text-slate-700 font-medium">{transaction.createdAt}</span>
            </div>

            <div className="py-1">
              <span className="text-slate-500 block mb-0.5">Description</span>
              <span className="text-slate-700 leading-relaxed">{transaction.description}</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically Verified Ledger Record</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
