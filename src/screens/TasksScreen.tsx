import React, { useState } from 'react';
import {
  Offer,
  OfferCategory,
  SocialTask,
  UserProfile,
  MicroJob,
  MicroJobSubmission,
} from '../types';
import {
  Search,
  Filter,
  Clock,
  Award,
  CheckCircle,
  ExternalLink,
  Zap,
  Lock,
  Send,
  Flame,
  FileCheck,
  ChevronRight,
  Sparkles,
  Crown,
  History,
  CheckCircle2,
  Clock3,
  XCircle,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';
import { SocialTasksList } from '../components/SocialTasksList';

interface TasksScreenProps {
  user: UserProfile;
  offers: Offer[];
  socialTasks: SocialTask[];
  selectedCategory: OfferCategory;
  onSelectCategory: (cat: OfferCategory) => void;
  onOpenOffer: (offer: Offer) => void;
  onOpenActivation: () => void;
  onOpenPlans: () => void;
  onSocialTaskCompleted: () => void;
  onOpenMicroJob: (job: MicroJob) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  user,
  offers,
  socialTasks,
  selectedCategory,
  onSelectCategory,
  onOpenOffer,
  onOpenActivation,
  onOpenPlans,
  onSocialTaskCompleted,
  onOpenMicroJob,
}) => {
  const [activeTab, setActiveTab] = useState<'create_work' | 'my_submissions' | 'other_offers'>('create_work');
  const [searchQuery, setSearchQuery] = useState('');

  const microJobs = DataService.getMicroJobs();
  const mySubmissions = DataService.getMicroJobSubmissions(user.id);

  // User tier bonus multiplier
  let bonusMultiplier = 1.0;
  if (user.accountTier === 'basic_10') bonusMultiplier = 1.1;
  else if (user.accountTier === 'vip') bonusMultiplier = 1.25;
  else if (user.accountTier === 'master') bonusMultiplier = 1.5;

  const today = new Date().toLocaleDateString('en-GB');
  const todaySubmissionsCount = mySubmissions.filter((s) => s.submittedAt.startsWith(today)).length;

  let dailyLimit = 15; // free active starter
  if (user.accountTier === 'basic_10') dailyLimit = 25;
  else if (user.accountTier === 'vip') dailyLimit = 40;
  else if (user.accountTier === 'master') dailyLimit = 999;

  const isActivated = true; // All users are active

  const categories: { id: OfferCategory; label: string }[] = [
    { id: 'all', label: 'All Offers' },
    { id: 'social', label: 'Social & Telegram' },
    { id: 'survey', label: 'Surveys' },
    { id: 'app', label: 'App Installs' },
  ];

  const filteredOffers = offers.filter((offer) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : offer.category === selectedCategory;

    const matchesSearch =
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.provider.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top Main Navigation Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-3 gap-1">
        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('create_work');
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'create_work'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          <span>মাইক্রো টাস্ক</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('my_submissions');
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 relative ${
            activeTab === 'my_submissions'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>জমা কাজ</span>
          {mySubmissions.length > 0 && (
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                activeTab === 'my_submissions'
                  ? 'bg-white text-emerald-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {mySubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('other_offers');
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'other_offers'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>সোশ্যাল ও অফার</span>
        </button>
      </div>

      {/* TAB 1: Micro-Jobs (Telegram, YouTube, Web Code, FB, App) */}
      {activeTab === 'create_work' && (
        <div className="space-y-3">
          {/* Daily Task Limit & Plan Status Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                  {user.accountTier === 'inactive' && 'ফ্রি মেম্বার'}
                  {user.accountTier === 'active' && 'ফ্রি স্টার্টার (১০০% অ্যাক্টিভ)'}
                  {user.accountTier === 'basic_10' && 'স্টার্টার প্রো (+১০% বোনাস)'}
                  {user.accountTier === 'vip' && 'ভিআইপি মেম্বার (+২৫% বোনাস)'}
                  {user.accountTier === 'master' && 'মাস্টার মেম্বার (+৫০% বোনাস)'}
                </span>
              </div>
              <p className="text-xs text-slate-200">
                আজকের কাজ সম্পন্ন:{' '}
                <span className="font-extrabold text-amber-300">
                  {todaySubmissionsCount} / {dailyLimit === 999 ? 'আনলিমিটেড' : `${dailyLimit} টি`}
                </span>
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenPlans();
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all"
            >
              বুস্টার প্ল্যান
            </button>
          </div>

          {/* Micro-Jobs List */}
          <div className="space-y-3">
            {microJobs.map((job) => {
              const userPayout = Number((job.payoutBDT * bonusMultiplier).toFixed(2));

              return (
                <div
                  key={job.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenMicroJob(job);
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {job.type === 'tg_channel' && '✈️'}
                        {job.type === 'youtube_sub' && '▶️'}
                        {job.type === 'article_code' && '🌐'}
                        {job.type === 'fb_follow' && '📘'}
                        {job.type === 'app_review' && '⭐'}
                        {job.type === 'fb_create' && '📘'}
                        {job.type === 'telegram_create' && '✈️'}
                        {job.type === 'whatsapp_create' && '💬'}
                        {job.type === 'gmail_create' && '📧'}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            {job.demandTag}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            ~{job.estimatedMinutes} মিনিট
                          </span>
                        </div>

                        <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {job.titleBn}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                          {job.shortDesc}
                        </p>
                      </div>
                    </div>

                    {/* Reward Box */}
                    <div className="text-right shrink-0 bg-emerald-50 border border-emerald-200/60 rounded-xl px-2.5 py-1.5">
                      <span className="text-[9px] font-bold text-emerald-700 block uppercase">
                        পাবেন
                      </span>
                      <div className="text-base font-black text-emerald-700">
                        ৳{userPayout.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                      দৈনিক সর্বোচ্চ: {job.dailyLimitPerUser} টি টাস্ক
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        onOpenMicroJob(job);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 transition-all"
                    >
                      <span>কাজ শুরু করুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-[11px] text-slate-500 text-center">
            💡 তথ্য জমা দেওয়ার পর এডমিন যাচাই করে অবিলম্বে আপনার ওয়ালেটে ব্যালেন্স জমা করবে।
          </div>
        </div>
      )}

      {/* TAB 2: User's Submissions History */}
      {activeTab === 'my_submissions' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                মোট জমা দেওয়া কাজ: {mySubmissions.length} টি
              </span>
            </div>
            <span className="text-[10px] text-slate-500">লাইভ আপডেট</span>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">কোনো কাজ জমা দেওয়া হয়নি</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                ফেসবুক, টেলিগ্রাম বা হোয়াটসঅ্যাপ ক্রিয়েট কাজ সম্পন্ন করে এখানে জমা দিন।
              </p>
              <button
                onClick={() => setActiveTab('create_work')}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                কাজ দেখুন
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {mySubmissions.map((sub) => {
                const isApproved = sub.status === 'approved';
                const isPending = sub.status === 'pending';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">{sub.jobTitle}</h4>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                          ID: {sub.accountIdentifier}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{sub.submittedAt}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-700 block">
                          +৳{sub.rewardBDT.toFixed(2)}
                        </span>
                        {isPending && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-1">
                            <Clock3 className="w-2.5 h-2.5 text-amber-600" />
                            <span>যাচাই হচ্ছে</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>অনুমোদিত</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 mt-1">
                            <XCircle className="w-2.5 h-2.5 text-red-600" />
                            <span>বাতিল</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {isRejected && sub.rejectReason && (
                      <div className="bg-red-50 rounded-xl p-2 text-[10px] text-red-700">
                        বাতিলের কারণ: {sub.rejectReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Social & Offerwalls */}
      {activeTab === 'other_offers' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offers by name or provider..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    onSelectCategory(cat.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Social Tasks */}
          {(selectedCategory === 'social' || selectedCategory === 'all') && (
            <SocialTasksList
              tasks={socialTasks}
              onTaskCompleted={onSocialTaskCompleted}
            />
          )}

          {/* Offerwall Offers */}
          {selectedCategory !== 'social' && (
            <div className="space-y-3">
              {filteredOffers.map((offer) => {
                const inProgress = DataService.isOfferInProgress(offer.id);
                const isLocked = offer.requiresActiveAccount && !isActivated;

                return (
                  <div
                    key={offer.id}
                    onClick={() => {
                      triggerHaptic('light');
                      if (isLocked) {
                        onOpenActivation();
                      } else {
                        onOpenOffer(offer);
                      }
                    }}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                          {offer.provider}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900">{offer.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{offer.description}</p>
                      </div>

                      <div className="text-right shrink-0 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/60">
                        <span className="text-[9px] font-bold text-emerald-700 block uppercase">Reward</span>
                        <span className="text-sm font-black text-emerald-700">৳{offer.rewardBDT.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">~{offer.estimatedMinutes} mins</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic('medium');
                          if (isLocked) onOpenActivation();
                          else onOpenOffer(offer);
                        }}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        {isLocked ? 'Unlock ৳10' : 'Start Offer'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
