import React, { useState } from 'react';
import { UserProfile, PaymentMethod, AdminPaymentConfig } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Phone,
  AlertCircle,
  Lock,
  Gift,
  Zap,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';
import confetti from 'canvas-confetti';

interface AccountActivationModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminConfig: AdminPaymentConfig;
  initialPlan?: 'basic_10' | 'vip_50' | 'master_100';
}

export const AccountActivationModal: React.FC<AccountActivationModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  adminConfig,
  initialPlan = 'basic_10',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic_10' | 'vip_50' | 'master_100'>(initialPlan);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [senderNumber, setSenderNumber] = useState('01712345678');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync initialPlan when opened
  React.useEffect(() => {
    if (initialPlan) setSelectedPlan(initialPlan);
  }, [initialPlan, isOpen]);

  if (!isOpen) return null;

  const planAmount = selectedPlan === 'basic_10' ? 10 : selectedPlan === 'vip_50' ? 50 : 100;
  const cashbackAmount = selectedPlan === 'basic_10' ? 5 : selectedPlan === 'vip_50' ? 15 : 30;

  const getAdminNumber = () => {
    switch (paymentMethod) {
      case 'bKash':
        return adminConfig.bkashPersonalNumber;
      case 'Nagad':
        return adminConfig.nagadPersonalNumber;
      case 'Rocket':
        return adminConfig.rocketPersonalNumber;
    }
  };

  const handleCopyNumber = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(getAdminNumber());
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    setErrorMsg(null);

    const cleanedNumber = senderNumber.replace(/\D/g, '');
    if (!cleanedNumber.startsWith('01') || cleanedNumber.length !== 11) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number.');
      return;
    }

    if (!trxId.trim() || trxId.trim().length < 6) {
      setErrorMsg('Please enter a valid bKash/Nagad Transaction ID (TrxID).');
      return;
    }

    setIsSubmitting(true);

    const result = DataService.submitActivationRequest({
      plan: selectedPlan,
      paymentMethod,
      senderNumber: cleanedNumber,
      trxId: trxId.trim().toUpperCase(),
    });

    setIsSubmitting(false);

    if (result.success) {
      triggerHaptic('success');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
      setIsSuccess(true);
      onSuccess();
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Activate EarnBox Account
              </h3>
              <p className="text-[11px] text-slate-500">
                Unlock cashout & earn ৳5 instant cashback
              </p>
            </div>
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
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">
                Activation Request Submitted!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Thank you! We received your TrxID <span className="font-mono font-bold text-slate-900">{trxId.toUpperCase()}</span>.
                Our admin verifies payment within 10–30 minutes. Once approved, your account will be activated with <span className="font-bold text-emerald-700">৳{cashbackAmount} BDT</span> instant cashback bonus!
              </p>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs text-slate-500">
                Status: <span className="text-amber-600 font-bold">Pending Admin Verification</span>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Plan Choice: ৳10 Starter vs ৳50 VIP vs ৳100 Master */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Choose Activation / VIP Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedPlan('basic_10');
                    }}
                    className={`p-2.5 rounded-2xl border-2 cursor-pointer transition-all text-left relative ${
                      selectedPlan === 'basic_10'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold text-slate-900 leading-tight">Starter</div>
                    <div className="text-xs font-black text-emerald-700 mt-0.5">৳10 BDT</div>
                    <p className="text-[9px] text-slate-500 mt-1 leading-snug">
                      ৫টি কাজ/দিন + ৳৫ ক্যাশব্যাক!
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedPlan('vip_50');
                    }}
                    className={`p-2.5 rounded-2xl border-2 cursor-pointer transition-all text-left relative ${
                      selectedPlan === 'vip_50'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold text-slate-900 leading-tight">VIP Pro</div>
                    <div className="text-xs font-black text-amber-700 mt-0.5">৳50 BDT</div>
                    <p className="text-[9px] text-slate-500 mt-1 leading-snug">
                      ২০টি কাজ/দিন +২০% বোনাস + ৳১৫ ব্যাক!
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedPlan('master_100');
                    }}
                    className={`p-2.5 rounded-2xl border-2 cursor-pointer transition-all text-left relative ${
                      selectedPlan === 'master_100'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold text-slate-900 leading-tight">Master</div>
                    <div className="text-xs font-black text-indigo-700 mt-0.5">৳100 BDT</div>
                    <p className="text-[9px] text-slate-500 mt-1 leading-snug">
                      আনলিমিটেড কাজ +৪০% রেট + ৳৩০ ব্যাক!
                    </p>
                  </div>
                </div>
              </div>

              {/* What You Unlock Checklist */}
              <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200/80 space-y-1.5 text-xs text-emerald-950">
                <div className="font-extrabold text-[11px] text-emerald-900 uppercase tracking-wider">
                  Verified Member Perks
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unlocks bKash, Nagad & Rocket withdrawals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unlocks high-paying ৳35 - ৳100 surveys & offers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-bold text-amber-900">
                    Instant ৳{cashbackAmount} joining cashback into your wallet
                  </span>
                </div>
              </div>

              {/* Select Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => {
                    const isSelected = paymentMethod === m;
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => {
                          triggerHaptic('selection');
                          setPaymentMethod(m);
                        }}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: Send Money Box */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-600">
                  Step 1: Send Money (৳{planAmount} BDT) to:
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{paymentMethod} Personal</span>
                    <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wide">
                      {getAdminNumber()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center space-x-1"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Verification Input Fields */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700">
                  Step 2: Enter Payment Verification Details:
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Your {paymentMethod} Sender Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. BK9X872019"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Found in the confirmation SMS received from {paymentMethod}.
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-200 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>{isSubmitting ? 'Submitting...' : `Submit TrxID & Activate Account`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
