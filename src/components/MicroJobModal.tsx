import React, { useState } from 'react';
import { MicroJob, UserProfile } from '../types';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Send,
  ShieldCheck,
  Clock,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';
import confetti from 'canvas-confetti';

interface MicroJobModalProps {
  job: MicroJob | null;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenPlans: () => void;
}

export const MicroJobModal: React.FC<MicroJobModalProps> = ({
  job,
  user,
  isOpen,
  onClose,
  onSuccess,
  onOpenPlans,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !job) return null;

  // Rate bonus calculation based on user plan
  let bonusMultiplier = 1.0;
  if (user.accountTier === 'vip') bonusMultiplier = 1.2;
  else if (user.accountTier === 'master') bonusMultiplier = 1.4;

  const userPayout = Number((job.payoutBDT * bonusMultiplier).toFixed(2));
  const hasBonus = bonusMultiplier > 1.0;

  const handleInputChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    setErrorMsg(null);

    // Validate required fields
    for (const field of job.submissionFields) {
      if (field.required && (!formData[field.key] || !formData[field.key].trim())) {
        setErrorMsg(`অনুগ্রহ করে "${field.labelBn}" পূরণ করুন।`);
        return;
      }
    }

    setIsSubmitting(true);

    const result = DataService.submitMicroJobWork({
      jobId: job.id,
      accountIdentifier: formData['accountIdentifier'] || '',
      password: formData['password'],
      twoFactorCodeOrOtp: formData['twoFactorCodeOrOtp'],
      additionalNotes: formData['additionalNotes'],
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
      triggerHaptic('error');
      setErrorMsg(result.message);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrorMsg(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xl">
              {job.type === 'fb_create' && '📘'}
              {job.type === 'telegram_create' && '✈️'}
              {job.type === 'whatsapp_create' && '💬'}
              {job.type === 'gmail_create' && '📧'}
            </span>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-sm text-slate-900">{job.titleBn}</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {job.demandTag}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{job.shortDesc}</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              handleClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3.5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">
                কাজটি সফলভাবে সাবমিট হয়েছে!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                আপনার প্রদত্ত তথ্যসমূহ এডমিন পর্যালোচনার জন্য জমা হয়েছে। এডমিন আইডি লগইন/যাচাই করে
                সঠিক পেলেই সরাসরি আপনার ওয়ালেটে{' '}
                <span className="font-extrabold text-emerald-700">৳{userPayout.toFixed(2)} BDT</span>{' '}
                যুক্ত করে দেবে।
              </p>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-center justify-between">
                <span>স্ট্যাটাস:</span>
                <span className="font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[11px]">
                  পেন্ডিং ভেরিফিকেশন (১৫-৩০ মিনিট)
                </span>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-98"
              >
                ঠিক আছে (পরবর্তী কাজ দেখুন)
              </button>
            </div>
          ) : (
            <>
              {/* Reward & Payout Box */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    প্রতি একাউন্টে পাবেন
                  </span>
                  <div className="text-2xl font-black mt-0.5 flex items-baseline space-x-1">
                    <span>৳{userPayout.toFixed(2)}</span>
                    <span className="text-xs font-semibold text-emerald-100">BDT</span>
                  </div>
                  {hasBonus && (
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                      VIP Plan +{bonusMultiplier === 1.2 ? '20%' : '40%'} এক্সট্রা বোনাস রেট!
                    </span>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-flex items-center space-x-1 text-[11px] bg-white/20 px-2.5 py-1 rounded-xl backdrop-blur-xs font-medium">
                    <Clock className="w-3 h-3" />
                    <span>~{job.estimatedMinutes} মিনিট</span>
                  </div>
                  <div className="text-[10px] text-emerald-100">দৈনিক লিমিট: {job.dailyLimitPerUser}টি</div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>কাজের নিয়ম ও ধাপসমূহ:</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600 pl-1">
                  {job.instructionsBn.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="flex-1 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Restriction Tip */}
              {user.accountTier === 'inactive' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-start space-x-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">ফ্রি মেম্বার লিমিট:</span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        আপনি ফ্রি প্ল্যানে আছেন (দিনে ১টি কাজ)। আনলিমিটেড কাজ করতে এবং উইথড্র অন করতে ৳১০ দিয়ে একাউন্ট একটিভ করুন।
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onClose();
                      onOpenPlans();
                    }}
                    className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-xl transition-all"
                  >
                    প্ল্যান দেখুন
                  </button>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                  <span>তৈরি করা একাউন্টের তথ্য জমা দিন:</span>
                </div>

                {job.submissionFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>{field.labelBn}</span>
                      {field.required ? (
                        <span className="text-[10px] text-red-500 font-semibold">*অবশ্যই দিন</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">ঐচ্ছিক</span>
                      )}
                    </label>
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-2xs"
                    />
                    {field.helperTextBn && (
                      <p className="text-[10px] text-slate-500 pl-1">{field.helperTextBn}</p>
                    )}
                  </div>
                ))}

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-3.5 rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2"
                  >
                    <span>{isSubmitting ? 'যাচাই করা হচ্ছে...' : 'কাজ জমা দিন / Submit Work'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    ভুল বা ফেক ডাটা দিলে একাউন্ট সাময়িক ব্যান হতে পারে। এডমিন রিভিউ দ্রুত হয়।
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
