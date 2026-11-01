import React, { useState } from 'react';
import { PaymentMethod, WalletData } from '../types';
import { X, Check, AlertCircle, ArrowRight, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';

interface WithdrawModalProps {
  wallet: WalletData;
  onClose: () => void;
  onWithdrawSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  wallet,
  onClose,
  onWithdrawSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bKash');
  const [accountNumber, setAccountNumber] = useState('01712345678');
  const [amount, setAmount] = useState<string>('50');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{ id: string } | null>(null);

  const methods: { id: PaymentMethod; name: string; bnName: string; color: string; badge: string }[] = [
    {
      id: 'bKash',
      name: 'bKash',
      bnName: 'বিকাশ',
      color: 'border-pink-500 text-pink-600 bg-pink-50/50',
      badge: 'Most Popular',
    },
    {
      id: 'Nagad',
      name: 'Nagad',
      bnName: 'নগদ',
      color: 'border-amber-500 text-amber-600 bg-amber-50/50',
      badge: 'Fast Review',
    },
    {
      id: 'Rocket',
      name: 'Rocket',
      bnName: 'রকেট',
      color: 'border-purple-500 text-purple-600 bg-purple-50/50',
      badge: 'DBBL Mobile',
    },
  ];

  const quickAmounts = [50, 100, 200, 500];

  const validate = (): boolean => {
    setErrorMsg(null);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return false;
    }

    if (parsedAmount < 50) {
      setErrorMsg('Minimum withdrawal amount is ৳50 BDT.');
      return false;
    }

    if (parsedAmount > wallet.availableBalance) {
      setErrorMsg(`Insufficient balance. You currently have ৳${wallet.availableBalance.toFixed(2)} BDT.`);
      return false;
    }

    // BD Phone validation: starts with 01 and 11 digits
    const cleanedNumber = accountNumber.replace(/\D/g, '');
    if (!cleanedNumber.startsWith('01') || cleanedNumber.length !== 11) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX).');
      return false;
    }

    return true;
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    if (validate()) {
      setIsConfirming(true);
    }
  };

  const handleFinalSubmit = () => {
    triggerHaptic('medium');
    setIsSubmitting(true);

    const parsedAmount = parseFloat(amount);
    const result = DataService.createWithdrawal(parsedAmount, selectedMethod, accountNumber);

    if (result.success && result.withdrawal) {
      triggerHaptic('success');
      setSuccessResult({ id: result.withdrawal.id });
      onWithdrawSuccess();
    } else {
      triggerHaptic('error');
      setErrorMsg(result.message);
      setIsConfirming(false);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Withdraw Funds</h3>
            <p className="text-[11px] text-slate-500">
              Available: <span className="text-emerald-700 font-bold">৳{wallet.availableBalance.toFixed(2)} BDT</span>
            </p>
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
          {successResult ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">
                Withdrawal Request Submitted!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Your request of <span className="font-bold text-slate-900">৳{amount} BDT</span> to {selectedMethod} ({accountNumber}) is placed in status <span className="font-bold text-amber-600">Pending</span>.
              </p>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs text-slate-500">
                Reference ID: <span className="font-mono font-bold text-slate-800">{successResult.id}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Admin review typically takes 15–60 minutes. Check the Wallet tab to track status.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-sm transition-all"
              >
                Back to Wallet
              </button>
            </div>
          ) : !isConfirming ? (
            <form onSubmit={handleProceedToConfirm} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-2 block uppercase tracking-wider">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {methods.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          triggerHaptic('selection');
                          setSelectedMethod(m.id);
                        }}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all text-center relative ${
                          isSelected
                            ? `${m.color} ring-2 ring-emerald-500/30 font-bold`
                            : 'border-slate-100 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-sm">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.bnName}</div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Number Input */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 block uppercase tracking-wider">
                  {selectedMethod} Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must be an active personal {selectedMethod} account in Bangladesh.
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Amount (৳ BDT)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setAmount(String(Math.floor(wallet.availableBalance)));
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Max (৳{wallet.availableBalance.toFixed(0)})
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={50}
                    step={1}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="flex items-center space-x-2 mt-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setAmount(String(q));
                      }}
                      className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold border transition-all ${
                        amount === String(q)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ৳{q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-2xl border border-red-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

                {/* Notice */}
                {wallet.availableBalance < 50 ? (
                  <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-amber-800 text-[11px] space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Minimum Cashout is ৳50.00 BDT</span>
                    </div>
                    <p>
                      Your balance is currently <span className="font-bold text-amber-950">৳{wallet.availableBalance.toFixed(2)}</span>. Complete daily check-in, lucky spins, and quick social tasks to reach ৳50!
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-start space-x-2 text-slate-500 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Withdrawals require manual backend verification by our admin team to safeguard against fraudulent activity. Minimum cashout is ৳50.
                    </span>
                  </div>
                )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Continue to Confirmation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Confirmation Step */
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider text-center">
                  Confirm Cashout Details
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-bold text-slate-800">{selectedMethod}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Account:</span>
                    <span className="font-mono font-bold text-slate-800">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-bold text-emerald-700 text-sm">৳{amount} BDT</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Fee:</span>
                    <span className="font-bold text-emerald-600">৳0.00 (Free)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Net Transfer:</span>
                    <span className="font-extrabold text-slate-900 text-sm">৳{amount} BDT</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
                >
                  Back / Edit
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
