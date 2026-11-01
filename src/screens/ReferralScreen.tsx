import React, { useState } from 'react';
import { ReferralFriend } from '../types';
import { Users, Copy, Check, Share2, Inbox, ArrowRight } from 'lucide-react';
import { triggerHaptic, shareReferralLink } from '../services/telegram';

interface ReferralScreenProps {
  referralData: {
    code: string;
    link: string;
    totalReferrals: number;
    activeReferrals: number;
    totalCommissionBDT: number;
    friends: ReferralFriend[];
  };
}

export const ReferralScreen: React.FC<ReferralScreenProps> = ({
  referralData,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(referralData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    shareReferralLink(referralData.code);
  };

  return (
    <div className="space-y-3.5 pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg shadow-emerald-900/15 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <span className="bg-white/20 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Referral Program
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Invite Friends, Earn ৳15 Each
          </h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed max-w-sm">
            Share your invite link on Telegram. Earn ৳15 BDT when your friend activates their account!
          </p>
        </div>
      </div>

      {/* Referral Code & Link Box */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Your Referral Code
          </span>
          <span className="font-mono text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            {referralData.code}
          </span>
        </div>

        {/* Link Input with Copy */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono text-slate-600 truncate">
            {referralData.link}
          </div>
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all active:scale-95 shrink-0"
            title="Copy Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-2xl shadow-sm shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all text-xs"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Invite Link on Telegram</span>
        </button>
      </div>

      {/* Metric Cards (All at 0 initially) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 block font-medium">Invited</span>
          <span className="text-base font-extrabold text-slate-900">{referralData.totalReferrals}</span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 block font-medium">Active</span>
          <span className="text-base font-extrabold text-emerald-700">{referralData.activeReferrals}</span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 block font-medium">Commission</span>
          <span className="text-base font-extrabold text-emerald-600">৳{referralData.totalCommissionBDT.toFixed(0)}</span>
        </div>
      </div>

      {/* Referral History / Empty State */}
      <div className="space-y-2 pt-1">
        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
          Invited Friends
        </h3>

        {referralData.friends.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs text-center space-y-1.5">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No referrals yet</h4>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
              Share your link in Telegram university, freelance, or social groups to earn ৳15 bonus per friend!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-xs divide-y divide-slate-100">
            {referralData.friends.map((friend) => (
              <div key={friend.id} className="py-2 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{friend.name}</h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">@{friend.username}</div>
                </div>
                <div className="text-right text-xs font-bold text-emerald-600">
                  +৳{friend.rewardEarnedBDT.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
