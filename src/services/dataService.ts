import {
  UserProfile,
  WalletData,
  Offer,
  SocialTask,
  WithdrawalRequest,
  Transaction,
  ActivationRequest,
  ReferralFriend,
  DailyCheckInState,
  AdminStats,
  PaymentMethod,
  AdminPaymentConfig,
  MicroJob,
  MicroJobSubmission,
  MembershipPlan,
} from '../types';
import { FirestoreService, testFirestoreConnection } from './firebase';
import { getTelegramUserData, isInsideTelegram } from './telegram';

// Keys for local storage cache / sync (v2 fresh zero-start)
const STORAGE_KEYS = {
  PROFILE: 'earnbox_v2_profile',
  WALLET: 'earnbox_v2_wallet',
  OFFERS: 'earnbox_v2_offers',
  SOCIAL_TASKS: 'earnbox_v2_social_tasks',
  WITHDRAWALS: 'earnbox_v2_withdrawals',
  TRANSACTIONS: 'earnbox_v2_transactions',
  ACTIVATIONS: 'earnbox_v2_activations',
  REFERRALS: 'earnbox_v2_referrals',
  DAILY_CHECKIN: 'earnbox_v2_daily_checkin',
  ACTIVE_OFFERS: 'earnbox_v2_active_offers',
  PAYMENT_CONFIG: 'earnbox_v2_payment_config',
  MICRO_JOBS: 'earnbox_v2_micro_jobs',
  MICRO_JOB_SUBMISSIONS: 'earnbox_v2_micro_job_submissions',
};

const tgUser = getTelegramUserData();

// Clean zero-start profile
const initialProfile: UserProfile = {
  id: `usr_${tgUser.id}`,
  telegramId: String(tgUser.id),
  username: tgUser.username || 'tanvir_earn',
  firstName: tgUser.first_name || 'Tanvir',
  lastName: tgUser.last_name || 'Hasan',
  photoUrl: tgUser.photo_url,
  referralCode: `EB${String(tgUser.id).slice(-4)}`,
  accountStatus: 'active',
  accountTier: 'active', // 100% Free Start - Users can earn & withdraw without forced fee
  memberSince: 'Today',
  savedPaymentNumber: '',
  savedPaymentMethod: 'bKash',
  completedTasksCount: 0,
  isTelegramUser: isInsideTelegram(),
};

// All balances starting strictly at ZERO
const initialWallet: WalletData = {
  availableBalance: 0.0,
  pendingBalance: 0.0,
  totalEarned: 0.0,
  totalWithdrawn: 0.0,
  currency: 'BDT',
  lastUpdated: new Date().toISOString(),
};

const initialPaymentConfig: AdminPaymentConfig = {
  bkashPersonalNumber: '01812345678',
  nagadPersonalNumber: '01912345678',
  rocketPersonalNumber: '01712345678',
  activationFeeBDT: 10,
  minWithdrawalBDT: 50,
  cashoutFeePercent: 2,
  telegramChannelLink: 'https://t.me/EarnBoxOfficial',
  supportUsername: 'EarnBoxSupportBot',
};

// Clean, simple, non-hijibiji Bangladeshi tasks
const initialSocialTasks: SocialTask[] = [
  {
    id: 'soc_tg_01',
    title: 'Join EarnBox Telegram Channel',
    type: 'telegram',
    channelOrUrl: 'https://t.me',
    rewardBDT: 1.5,
    clientRateBDT: 3.0,
    ownerProfitBDT: 1.5,
    providerName: 'EarnBox BD',
    instructions: 'Join channel and stay member.',
    status: 'available',
  },
  {
    id: 'soc_yt_01',
    title: 'Subscribe YouTube Channel',
    type: 'youtube',
    channelOrUrl: 'https://youtube.com',
    rewardBDT: 2.0,
    clientRateBDT: 3.5,
    ownerProfitBDT: 1.5,
    providerName: 'Sponsor Partner',
    instructions: 'Press subscribe and claim reward.',
    status: 'available',
  },
  {
    id: 'soc_web_01',
    title: 'Visit Sponsor Website (15s)',
    type: 'web',
    channelOrUrl: 'https://google.com',
    rewardBDT: 1.0,
    clientRateBDT: 2.0,
    ownerProfitBDT: 1.0,
    providerName: 'Web Partner',
    instructions: 'Browse partner page for 15 seconds.',
    status: 'available',
  },
];

// Clean, simple introductory offers (removed complicated high-payout games/offers)
const initialOffers: Offer[] = [
  {
    id: 'off_survey_simple',
    title: 'Quick Opinion Survey',
    description: 'Answer 5 quick questions about mobile shopping in Bangladesh.',
    detailedInstructions: [
      'Click "Start Offer" to begin.',
      'Answer honest questions about bKash & mobile recharges.',
      'Submit completion to claim ৳10 BDT.',
    ],
    requirements: ['Resident of Bangladesh', 'No VPN allowed'],
    category: 'survey',
    rewardBDT: 10.0,
    estimatedMinutes: 3,
    difficulty: 'Easy',
    provider: 'BitLabs Insights',
    status: 'available',
    featured: true,
    requiresActiveAccount: false,
    terms: 'One completion per user account.',
  },
  {
    id: 'off_app_simple',
    title: 'MyGP App Quick Check',
    description: 'Launch the MyGP app or web portal and view free balance.',
    detailedInstructions: [
      'Open the MyGP offer link.',
      'Check welcome internet vouchers.',
      'Claim reward.',
    ],
    requirements: ['One completion per user'],
    category: 'app',
    rewardBDT: 8.0,
    estimatedMinutes: 2,
    difficulty: 'Easy',
    provider: 'CPALead BD',
    status: 'available',
    featured: true,
    requiresActiveAccount: false,
    terms: 'Reward credited upon verification.',
  },
];

// High-converting, realistic tasks (Sponsored Telegram, YouTube, Website visits with auto-verification, FB like, App review)
const initialMicroJobs: MicroJob[] = [
  {
    id: 'job_tg_join_01',
    type: 'tg_channel',
    title: 'Join EarnBox Official Telegram Channel',
    titleBn: 'অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন',
    shortDesc: 'টেলিগ্রাম চ্যানেলে জয়েন হয়ে আপনার টেলিগ্রাম ইউজারনেম দিয়ে পেমেন্ট নিন',
    payoutBDT: 2.0,
    ownerResellRateBDT: 4.5,
    estimatedMinutes: 1,
    dailyLimitPerUser: 1,
    category: 'sponsored_task',
    status: 'active',
    demandTag: 'Hot',
    targetUrl: 'https://t.me/EarnBoxOfficial',
    instructionsBn: [
      'নিচের "চ্যানেল লিংক ওপেন করুন" বাটনে ক্লিক করে আমাদের টেলিগ্রাম চ্যানেলে জয়েন হোন।',
      'চ্যানেলে যুক্ত থেকে আপনার টেলিগ্রাম ইউজারনেম (@username) নিচে লিখে সাবমিট করুন।',
      'এডমিন চেক করে আপনার ওয়ালেটে ৳২ টাকা যোগ করে দেবে।',
    ],
    requirements: ['চ্যানেলে মেম্বার হিসেবে থাকতে হবে', 'সঠিক টেলিগ্রাম ইউজারনেম দিতে হবে'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: 'আপনার টেলিগ্রাম ইউজারনেম (@ সহ)',
        placeholder: '@your_username',
        type: 'text',
        required: true,
      },
      {
        key: 'additionalNotes',
        labelBn: 'অতিরিক্ত নোট বা মন্তব্য (ঐচ্ছিক)',
        placeholder: 'জয়েন করা হয়েছে...',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    id: 'job_yt_sub_01',
    type: 'youtube_sub',
    title: 'Subscribe YouTube Channel & Watch 1 Min',
    titleBn: 'ইউটিউব চ্যানেল সাবস্ক্রাইব ও ১ মিনিট ভিডিও দেখুন',
    shortDesc: 'স্পনসর ইউটিউব চ্যানেল সাবস্ক্রাইব করে আপনার জিমেইল নাম সাবমিট করুন',
    payoutBDT: 2.5,
    ownerResellRateBDT: 5.0,
    estimatedMinutes: 2,
    dailyLimitPerUser: 2,
    category: 'sponsored_task',
    status: 'active',
    demandTag: 'Trending',
    targetUrl: 'https://youtube.com',
    instructionsBn: [
      'নিচের ইউটিউব লিংকে ক্লিক করে চ্যানেলে যান।',
      'যেকোনো একটি ভিডিও কমপক্ষে ১ মিনিট দেখুন এবং চ্যানেলটি সাবস্ক্রাইব ও লাইক করুন।',
      'আপনার ইউটিউব প্রোফাইল নাম বা জিমেইল নাম নিচে লিখে সাবমিট করুন।',
    ],
    requirements: ['চ্যানেল সাবস্ক্রাইব থাকতে হবে', 'সঠিক প্রোফাইল নাম'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: 'আপনার ইউটিউব একাউন্ট বা জিমেইল নাম',
        placeholder: 'e.g. Tanvir Hasan বা tanvir123@gmail.com',
        type: 'text',
        required: true,
      },
      {
        key: 'additionalNotes',
        labelBn: 'ভিডিওর নাম বা মন্তব্য (ঐচ্ছিক)',
        placeholder: 'ভিডিও লাইক করা হয়েছে...',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    id: 'job_web_code_01',
    type: 'article_code',
    title: 'Visit Sponsor Blog & Collect Secret Code',
    titleBn: 'ব্লগ ভিজিট ও ইনস্ট্যান্ট সিক্রেট কোড সংগ্রহ (অটো পেমেন্ট)',
    shortDesc: 'ওয়েবসাইটে ২০-৩০ সেকেন্ড অবস্থান করে প্রাপ্ত কোডটি দিন, সাথে সাথে টাকা পাবেন!',
    payoutBDT: 1.5,
    ownerResellRateBDT: 3.5,
    estimatedMinutes: 1,
    dailyLimitPerUser: 5,
    category: 'web_visit',
    status: 'active',
    demandTag: 'Instant',
    targetUrl: 'https://google.com',
    secretCode: '849201',
    autoVerify: true,
    instructionsBn: [
      'নিচের "ওয়েবসাইট ভিজিট করুন" বাটনে ক্লিক করে স্পনসর আর্টিকেলে যান।',
      'পেজে ২০-৩০ সেকেন্ড অপেক্ষা করুন এবং স্ক্রোল করুন।',
      'আর্টিকেলের নিচে প্রদর্শিত ৬-সংখ্যার সিক্রেট ভেরিফিকেশন কোডটি (যেমন: 849201) কপি করুন।',
      'নিচের ঘরে কোডটি দিয়ে সাবমিট করলেই কোনো অপেক্ষা ছাড়া সাথে সাথে ব্যালেন্স মেইন ওয়ালেটে যোগ হবে!',
    ],
    requirements: ['সঠিক ৬-সংখ্যার সিক্রেট কোড', 'পেজে ৩০ সেকেন্ড থাকতে হবে'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: '৬-সংখ্যার সিক্রেট কোড (Secret Code)',
        placeholder: 'e.g. 849201',
        type: 'text',
        required: true,
        helperTextBn: 'সঠিক কোড দিলে এক সেকেন্ডের মধ্যে ব্যালেন্স জমা হবে',
      },
    ],
  },
  {
    id: 'job_fb_follow_01',
    type: 'fb_follow',
    title: 'Like & Follow Facebook Page',
    titleBn: 'ফেসবুক পেজ লাইক ও ফলো করুন',
    shortDesc: 'স্পনসর ফেসবুক পেজে লাইক ও ফলো দিয়ে আপনার ফেসবুক নাম জমা দিন',
    payoutBDT: 1.8,
    ownerResellRateBDT: 4.0,
    estimatedMinutes: 1,
    dailyLimitPerUser: 2,
    category: 'sponsored_task',
    status: 'active',
    demandTag: 'High Demand',
    targetUrl: 'https://facebook.com',
    instructionsBn: [
      'ফেসবুক পেজের লিংকে ক্লিক করে পেজটি ওপেন করুন।',
      'পেজটিতে Like এবং Follow বাটনে ক্লিক করুন।',
      'আপনার ফেসবুক প্রোফাইলের নাম নিচে লিখে সাবমিট করুন।',
    ],
    requirements: ['পেজটি ফলো থাকতে হবে', 'সঠিক ফেসবুক নাম'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: 'আপনার ফেসবুক প্রোফাইল নাম',
        placeholder: 'e.g. Tanvir Hasan',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'job_app_review_01',
    type: 'app_review',
    title: 'Install App & 5-Star Play Store Review',
    titleBn: 'প্লে-স্টোর অ্যাপ ইনস্টল ও ৫-স্টার রিভিউ',
    shortDesc: 'প্লে-স্টোর থেকে অ্যাপ ইনস্টল করে ৫-স্টার রিভিউ দিয়ে প্লে-স্টোর নাম দিন',
    payoutBDT: 6.0,
    ownerResellRateBDT: 15.0,
    estimatedMinutes: 3,
    dailyLimitPerUser: 1,
    category: 'sponsored_task',
    status: 'active',
    demandTag: 'Hot',
    targetUrl: 'https://play.google.com',
    instructionsBn: [
      'প্লে-স্টোর লিংকে গিয়ে অ্যাপটি আপনার মোবাইলে ইনস্টল করুন।',
      'অ্যাপটিতে ৫-স্টার (⭐⭐⭐⭐⭐) রেটিং দিয়ে একটি পজিটিভ রিভিউ (যেমন: Very good app) লিখুন।',
      'আপনার গুগল প্লে-স্টোরের রিভিউয়ার নাম নিচে লিখে সাবমিট করুন।',
    ],
    requirements: ['অ্যাপটি ইনস্টল ও ৫-স্টার রিভিউ হতে হবে', 'সঠিক প্লে স্টোর নাম'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: 'আপনার প্লে-স্টোর / গুগল একাউন্টের নাম',
        placeholder: 'e.g. Tanvir Hasan',
        type: 'text',
        required: true,
      },
    ],
  },
];

// Clean empty activity lists
const initialActivations: ActivationRequest[] = [];
const initialWithdrawals: WithdrawalRequest[] = [];
const initialTransactions: Transaction[] = [];
const initialReferrals: ReferralFriend[] = [];
const initialMicroJobSubmissions: MicroJobSubmission[] = [];

// Membership Plans (Free Starter is 100% active; VIP/Master are optional earnings boosters)
const initialMembershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    nameBn: 'ফ্রি স্টার্টার (১০০% ফ্রি ও অ্যাক্টিভ)',
    priceBDT: 0,
    cashbackBDT: 0,
    dailyTaskLimit: 15,
    rateBonusPercent: 0,
    canWithdraw: true,
    minWithdrawalBDT: 50,
    payoutSpeed: '১২-২৪ ঘণ্টা',
    isPopular: true,
    features: [
      'কোনো এক্টিভেশন ফি নেই - ১০০% ফ্রি একাউন্ট',
      'প্রতিদিন ১৫টি স্পনসর ও সোশ্যাল টাস্ক',
      'বিকাশ, নগদ ও রকেটে সর্বনিম্ন ৳৫০ ক্যাশআউট',
      'প্রতিদিনের লাকি স্পিন ও ডেইলি চেক-ইন বোনাস',
      'রেগুলার আর্নিং রেট',
    ],
  },
  {
    id: 'basic_10',
    name: 'Starter Pro',
    nameBn: 'স্টার্টার প্রো বুস্টার (৳১০)',
    priceBDT: 10,
    cashbackBDT: 5,
    dailyTaskLimit: 25,
    rateBonusPercent: 10,
    canWithdraw: true,
    minWithdrawalBDT: 50,
    payoutSpeed: '৮-১২ ঘণ্টা',
    features: [
      'সব কাজে +১০% অতিরিক্ত বোনাস ইনকাম',
      'সাথে সাথে ৳৫ ক্যাশব্যাক বোনাস',
      'প্রতিদিন ২৫টি টাস্ক করার সুযোগ',
      'ফাস্ট ভেরিফিকেশন ও উইথড্রল',
    ],
  },
  {
    id: 'vip_50',
    name: 'VIP Earner',
    nameBn: 'ভিআইপি আর্নার প্ল্যান (৳৩০)',
    priceBDT: 30,
    cashbackBDT: 10,
    dailyTaskLimit: 40,
    rateBonusPercent: 25,
    canWithdraw: true,
    minWithdrawalBDT: 50,
    payoutSpeed: '২-৪ ঘণ্টার মধ্যে ফাস্ট',
    features: [
      'সব কাজে +২৫% এক্সট্রা বোনাস ইনকাম',
      'সাথে সাথে ৳১০ ইনস্ট্যান্ট ক্যাশব্যাক',
      'প্রতিদিন ৪০টি টাস্ক করার সুযোগ',
      '২ ঘণ্টার মধ্যে ফাস্ট বিকাশ/নগদ পেমেন্ট',
      'হাই প্রায়োরিটি ভেরিফিকেশন',
    ],
  },
  {
    id: 'master_100',
    name: 'Master Pro',
    nameBn: 'মাস্টার প্রো টিম (৳৭০)',
    priceBDT: 70,
    cashbackBDT: 25,
    dailyTaskLimit: 'Unlimited',
    rateBonusPercent: 50,
    canWithdraw: true,
    minWithdrawalBDT: 50,
    payoutSpeed: '১৫-৩০ মিনিটে ইনস্ট্যান্ট',
    features: [
      'সব কাজে +৫০% ডাবল বোনাস ইনকাম',
      'আনলিমিটেড টাস্ক করার সুবিধা',
      'সাথে সাথে ৳২৫ ক্যাশব্যাক বোনাস',
      '১৫ মিনিটে ইনস্ট্যান্ট বিকাশ/নগদ উইথড্র',
      'ভিআইপি প্রায়োরিটি সাপোর্ট',
    ],
  },
];

// Check-in starts on Day 1 (ready to claim ৳2)
const initialCheckIn: DailyCheckInState = {
  currentDay: 1,
  lastClaimedDate: null,
  canClaimToday: true,
  streakCount: 0,
};

function loadData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

function saveData<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('earnbox_data_changed', { detail: { key } }));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export class DataService {
  private static isInitialized = false;

  static async initializeFirestore(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    testFirestoreConnection();

    // Check & Seed User Profile
    const remoteProfile = await FirestoreService.getUserProfile(initialProfile.id);
    if (!remoteProfile) {
      await FirestoreService.saveUserProfile(initialProfile);
    } else {
      saveData(STORAGE_KEYS.PROFILE, remoteProfile);
    }

    // Check & Seed Wallet
    const remoteWallet = await FirestoreService.getWallet(initialProfile.id);
    if (!remoteWallet) {
      await FirestoreService.saveWallet(initialProfile.id, initialWallet);
    } else {
      saveData(STORAGE_KEYS.WALLET, remoteWallet);
    }

    // Real-time Subscriptions
    FirestoreService.subscribeUserProfile(initialProfile.id, (p) => {
      if (p) saveData(STORAGE_KEYS.PROFILE, p);
    });

    FirestoreService.subscribeWallet(initialProfile.id, (w) => {
      if (w) saveData(STORAGE_KEYS.WALLET, w);
    });

    FirestoreService.subscribeActivationRequests((acts) => {
      if (acts) saveData(STORAGE_KEYS.ACTIVATIONS, acts);
    });
  }

  // User Profile
  static getUserProfile(): UserProfile {
    return loadData(STORAGE_KEYS.PROFILE, initialProfile);
  }

  static updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...updates };
    saveData(STORAGE_KEYS.PROFILE, updated);
    FirestoreService.updateUserProfile(updated.id, updates).catch(() => {});
    return updated;
  }

  // Wallet
  static getWallet(): WalletData {
    return loadData(STORAGE_KEYS.WALLET, initialWallet);
  }

  static updateWallet(updates: Partial<WalletData>): WalletData {
    const current = this.getWallet();
    const updated = { ...current, ...updates, lastUpdated: new Date().toISOString() };
    saveData(STORAGE_KEYS.WALLET, updated);
    FirestoreService.updateWallet(initialProfile.id, updates).catch(() => {});
    return updated;
  }

  // ৳10 Account Activation Flow
  static submitActivationRequest(data: {
    plan: 'basic_10' | 'vip_50' | 'master_100';
    paymentMethod: PaymentMethod;
    senderNumber: string;
    trxId: string;
  }): { success: boolean; message: string; request?: ActivationRequest } {
    const profile = this.getUserProfile();
    const amount = data.plan === 'basic_10' ? 10 : data.plan === 'vip_50' ? 50 : 100;

    const newRequest: ActivationRequest = {
      id: `act_${Date.now().toString().slice(-6)}`,
      userId: profile.id,
      userName: `${profile.firstName} ${profile.lastName}`,
      telegramUsername: profile.username,
      plan: data.plan,
      amountBDT: amount,
      paymentMethod: data.paymentMethod,
      senderNumber: data.senderNumber,
      trxId: data.trxId,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const allRequests = this.getActivationRequests();
    allRequests.unshift(newRequest);
    saveData(STORAGE_KEYS.ACTIVATIONS, allRequests);

    FirestoreService.addActivationRequest(newRequest).catch(() => {});

    this.updateUserProfile({
      accountTier: 'pending_activation',
    });

    return { success: true, message: 'Activation request submitted for verification.', request: newRequest };
  }

  static getActivationRequests(): ActivationRequest[] {
    return loadData(STORAGE_KEYS.ACTIVATIONS, initialActivations);
  }

  static approveActivationRequest(requestId: string): boolean {
    const requests = this.getActivationRequests();
    const target = requests.find((r) => r.id === requestId);
    if (!target) return false;

    target.status = 'approved';
    target.reviewedAt = new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US');
    saveData(STORAGE_KEYS.ACTIVATIONS, requests);

    FirestoreService.updateActivationRequestStatus(requestId, 'approved').catch(() => {});

    // If it's current user, activate and give cashback
    const profile = this.getUserProfile();
    if (profile.id === target.userId) {
      const cashback = target.plan === 'basic_10' ? 5 : target.plan === 'vip_50' ? 15 : 30;
      const targetTier = target.plan === 'basic_10' ? 'active' : target.plan === 'vip_50' ? 'vip' : 'master';

      this.updateUserProfile({
        accountTier: targetTier,
        activationDate: new Date().toLocaleDateString('en-GB'),
      });

      // Credit cashback to wallet
      const wallet = this.getWallet();
      this.updateWallet({
        availableBalance: Number((wallet.availableBalance + cashback).toFixed(2)),
        totalEarned: Number((wallet.totalEarned + cashback).toFixed(2)),
      });

      // Add transaction for cashback
      const tx: Transaction = {
        id: `tx_cb_${Date.now()}`,
        userId: profile.id,
        title: `Plan Activation ৳${cashback} Cashback`,
        type: 'activation_cashback',
        amount: cashback,
        status: 'completed',
        createdAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US'),
        referenceId: target.trxId,
        description: `Welcome bonus for activating ${target.plan} plan`,
      };
      const txs = this.getTransactions();
      txs.unshift(tx);
      saveData(STORAGE_KEYS.TRANSACTIONS, txs);
    }

    return true;
  }

  static rejectActivationRequest(requestId: string, reason: string): boolean {
    const requests = this.getActivationRequests();
    const target = requests.find((r) => r.id === requestId);
    if (!target) return false;

    target.status = 'rejected';
    target.rejectReason = reason;
    target.reviewedAt = new Date().toLocaleDateString('en-GB');
    saveData(STORAGE_KEYS.ACTIVATIONS, requests);

    FirestoreService.updateActivationRequestStatus(requestId, 'rejected', reason).catch(() => {});

    const profile = this.getUserProfile();
    if (profile.id === target.userId) {
      this.updateUserProfile({ accountTier: 'inactive' });
    }

    return true;
  }

  // Social / Sponsor Tasks
  static getSocialTasks(): SocialTask[] {
    return loadData(STORAGE_KEYS.SOCIAL_TASKS, initialSocialTasks);
  }

  static completeSocialTask(taskId: string): boolean {
    const tasks = this.getSocialTasks();
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return false;

    target.status = 'completed';
    saveData(STORAGE_KEYS.SOCIAL_TASKS, tasks);

    // Credit user
    const wallet = this.getWallet();
    this.updateWallet({
      availableBalance: Number((wallet.availableBalance + target.rewardBDT).toFixed(2)),
      totalEarned: Number((wallet.totalEarned + target.rewardBDT).toFixed(2)),
    });

    // Add transaction
    const profile = this.getUserProfile();
    const tx: Transaction = {
      id: `tx_soc_${Date.now()}`,
      userId: profile.id,
      title: `${target.title}`,
      type: 'earning',
      amount: target.rewardBDT,
      status: 'completed',
      createdAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      referenceId: `SOC_${Date.now().toString().slice(-4)}`,
      description: `Completed task: ${target.instructions}`,
      provider: target.providerName,
    };
    const txs = this.getTransactions();
    txs.unshift(tx);
    saveData(STORAGE_KEYS.TRANSACTIONS, txs);

    this.updateUserProfile({
      completedTasksCount: (profile.completedTasksCount || 0) + 1,
    });

    return true;
  }

  // Lucky Spin
  static creditLuckySpinReward(amount: number): void {
    const wallet = this.getWallet();
    this.updateWallet({
      availableBalance: Number((wallet.availableBalance + amount).toFixed(2)),
      totalEarned: Number((wallet.totalEarned + amount).toFixed(2)),
    });

    const profile = this.getUserProfile();
    const tx: Transaction = {
      id: `tx_spin_${Date.now()}`,
      userId: profile.id,
      title: 'Daily Lucky Wheel Prize',
      type: 'lucky_spin',
      amount: amount,
      status: 'completed',
      createdAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      referenceId: `SPIN_${Date.now().toString().slice(-4)}`,
      description: 'Daily retention reward',
    };
    const txs = this.getTransactions();
    txs.unshift(tx);
    saveData(STORAGE_KEYS.TRANSACTIONS, txs);
  }

  // Offers
  static getOffers(): Offer[] {
    return loadData(STORAGE_KEYS.OFFERS, initialOffers);
  }

  static getOfferById(id: string): Offer | undefined {
    return this.getOffers().find((o) => o.id === id);
  }

  static startOffer(offerId: string): boolean {
    const activeOffers = loadData<string[]>(STORAGE_KEYS.ACTIVE_OFFERS, []);
    if (!activeOffers.includes(offerId)) {
      activeOffers.push(offerId);
      saveData(STORAGE_KEYS.ACTIVE_OFFERS, activeOffers);
    }
    return true;
  }

  static isOfferInProgress(offerId: string): boolean {
    const activeOffers = loadData<string[]>(STORAGE_KEYS.ACTIVE_OFFERS, []);
    return activeOffers.includes(offerId);
  }

  static creditOfferReward(offerId: string, customAmount?: number): { success: boolean; amount: number; txId: string } {
    const offer = this.getOfferById(offerId);
    const amount = customAmount ?? (offer ? offer.rewardBDT : 10.0);
    const title = offer ? offer.title : 'Task Reward';
    const provider = offer ? offer.provider : 'Certified Provider';

    const txId = `PB_${Date.now().toString().slice(-6)}`;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: initialProfile.id,
      title: `${provider} Offer Completed`,
      type: 'earning',
      amount: amount,
      status: 'completed',
      createdAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      referenceId: txId,
      description: `Verified completion: ${title}`,
      provider: provider,
    };

    FirestoreService.addTransaction(newTx).catch(() => {});

    const txs = this.getTransactions();
    txs.unshift(newTx);
    saveData(STORAGE_KEYS.TRANSACTIONS, txs);

    const wallet = this.getWallet();
    this.updateWallet({
      availableBalance: Number((wallet.availableBalance + amount).toFixed(2)),
      totalEarned: Number((wallet.totalEarned + amount).toFixed(2)),
    });

    const profile = this.getUserProfile();
    this.updateUserProfile({
      completedTasksCount: (profile.completedTasksCount || 0) + 1,
    });

    const activeOffers = loadData<string[]>(STORAGE_KEYS.ACTIVE_OFFERS, []).filter((id) => id !== offerId);
    saveData(STORAGE_KEYS.ACTIVE_OFFERS, activeOffers);

    return { success: true, amount, txId };
  }

  // Withdrawals
  static getWithdrawals(): WithdrawalRequest[] {
    return loadData(STORAGE_KEYS.WITHDRAWALS, initialWithdrawals);
  }

  static createWithdrawal(amount: number, method: PaymentMethod, accountNumber: string): { success: boolean; message: string; withdrawal?: WithdrawalRequest } {
    const profile = this.getUserProfile();
    if (profile.accountTier === 'inactive' || profile.accountTier === 'pending_activation') {
      return { success: false, message: 'Please activate your account for ৳10 to enable withdrawals and instant payouts.' };
    }

    const wallet = this.getWallet();
    if (amount < 50) {
      return { success: false, message: 'Minimum withdrawal amount is ৳50.' };
    }
    if (wallet.availableBalance < amount) {
      return { success: false, message: 'Insufficient available balance in your wallet.' };
    }

    const fee = Number((amount * 0.02).toFixed(2));
    const net = Number((amount - fee).toFixed(2));

    const newId = `wd_${Date.now().toString().slice(-6)}`;
    const newWithdrawal: WithdrawalRequest = {
      id: newId,
      userId: initialProfile.id,
      userName: initialProfile.firstName + ' ' + initialProfile.lastName,
      amount: amount,
      processingFeeBDT: fee,
      netAmountBDT: net,
      paymentMethod: method,
      accountNumber: accountNumber,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    FirestoreService.addWithdrawal(newWithdrawal).catch(() => {});

    const allWds = this.getWithdrawals();
    allWds.unshift(newWithdrawal);
    saveData(STORAGE_KEYS.WITHDRAWALS, allWds);

    this.updateWallet({
      availableBalance: Number((wallet.availableBalance - amount).toFixed(2)),
      pendingBalance: Number((wallet.pendingBalance + amount).toFixed(2)),
    });

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: initialProfile.id,
      title: `${method} Cashout Request`,
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      createdAt: newWithdrawal.createdAt,
      referenceId: newId,
      description: `Cashout to ${method} ${accountNumber} (Fee: ৳${fee})`,
      paymentMethod: method,
    };

    FirestoreService.addTransaction(newTx).catch(() => {});

    const txs = this.getTransactions();
    txs.unshift(newTx);
    saveData(STORAGE_KEYS.TRANSACTIONS, txs);

    this.updateUserProfile({
      savedPaymentNumber: accountNumber,
      savedPaymentMethod: method,
    });

    return { success: true, message: 'Withdrawal request submitted for review!', withdrawal: newWithdrawal };
  }

  // Transactions
  static getTransactions(): Transaction[] {
    return loadData(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  }

  static getTransactionById(id: string): Transaction | undefined {
    return this.getTransactions().find((t) => t.id === id);
  }

  // Daily Check-In
  static getDailyCheckIn(): DailyCheckInState {
    return loadData(STORAGE_KEYS.DAILY_CHECKIN, initialCheckIn);
  }

  static claimDailyCheckIn(): { success: boolean; rewardBDT: number; nextDay: number } {
    const state = this.getDailyCheckIn();
    if (!state.canClaimToday) {
      return { success: false, rewardBDT: 0, nextDay: state.currentDay };
    }

    const rewardMap: Record<number, number> = {
      1: 2,
      2: 3,
      3: 4,
      4: 5,
      5: 6,
      6: 8,
      7: 15,
    };

    const reward = rewardMap[state.currentDay] || 2;
    const nextDay = state.currentDay >= 7 ? 1 : state.currentDay + 1;

    const updatedState: DailyCheckInState = {
      currentDay: nextDay,
      lastClaimedDate: new Date().toISOString().split('T')[0],
      canClaimToday: false,
      streakCount: state.streakCount + 1,
    };
    saveData(STORAGE_KEYS.DAILY_CHECKIN, updatedState);

    const wallet = this.getWallet();
    this.updateWallet({
      availableBalance: Number((wallet.availableBalance + reward).toFixed(2)),
      totalEarned: Number((wallet.totalEarned + reward).toFixed(2)),
    });

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: initialProfile.id,
      title: `Daily Check-In Bonus (Day ${state.currentDay})`,
      type: 'bonus',
      amount: reward,
      status: 'completed',
      createdAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      referenceId: `DAILY_D${state.currentDay}_${Date.now().toString().slice(-4)}`,
      description: `Daily login reward`,
    };

    const txs = this.getTransactions();
    txs.unshift(tx);
    saveData(STORAGE_KEYS.TRANSACTIONS, txs);

    return { success: true, rewardBDT: reward, nextDay };
  }

  // Referrals
  static getReferrals(): { code: string; link: string; totalReferrals: number; activeReferrals: number; totalCommissionBDT: number; friends: ReferralFriend[] } {
    const friends = loadData(STORAGE_KEYS.REFERRALS, initialReferrals);
    const active = friends.filter((f) => f.status === 'active').length;
    const totalEarned = friends.reduce((sum, f) => sum + f.rewardEarnedBDT, 0);

    return {
      code: initialProfile.referralCode,
      link: `https://t.me/EarnBoxBot?start=ref_${initialProfile.referralCode}`,
      totalReferrals: friends.length,
      activeReferrals: active,
      totalCommissionBDT: totalEarned,
      friends,
    };
  }

  // Admin Payment Configuration
  static getAdminPaymentConfig(): AdminPaymentConfig {
    return loadData(STORAGE_KEYS.PAYMENT_CONFIG, initialPaymentConfig);
  }

  static updateAdminPaymentConfig(updates: Partial<AdminPaymentConfig>): AdminPaymentConfig {
    const current = this.getAdminPaymentConfig();
    const updated = { ...current, ...updates };
    saveData(STORAGE_KEYS.PAYMENT_CONFIG, updated);
    FirestoreService.saveAdminConfig(updated).catch(() => {});
    return updated;
  }

  // Membership Plans
  static getMembershipPlans(): MembershipPlan[] {
    return initialMembershipPlans;
  }

  static getPlanById(planId: string): MembershipPlan | undefined {
    return initialMembershipPlans.find((p) => p.id === planId);
  }

  // Micro Jobs (Sponsored Channels, YouTube, Website visits with code, FB follow, App review)
  static getMicroJobs(): MicroJob[] {
    const list = loadData<MicroJob[]>(STORAGE_KEYS.MICRO_JOBS, initialMicroJobs);
    // If list has only old account creation jobs, upgrade to realistic tasks
    const hasRealisticJobs = list.some(
      (j) => j.type === 'tg_channel' || j.type === 'article_code' || j.type === 'youtube_sub' || j.category === 'sponsored_task'
    );
    if (!hasRealisticJobs) {
      saveData(STORAGE_KEYS.MICRO_JOBS, initialMicroJobs);
      return initialMicroJobs;
    }
    return list;
  }

  static getMicroJobById(jobId: string): MicroJob | undefined {
    return this.getMicroJobs().find((j) => j.id === jobId);
  }

  static addMicroJob(jobData: Omit<MicroJob, 'id'>): MicroJob {
    const jobs = this.getMicroJobs();
    const newJob: MicroJob = {
      ...jobData,
      id: `job_${Date.now().toString().slice(-6)}`,
    };
    jobs.unshift(newJob);
    saveData(STORAGE_KEYS.MICRO_JOBS, jobs);
    return newJob;
  }

  static deleteMicroJob(jobId: string): boolean {
    const jobs = this.getMicroJobs();
    const filtered = jobs.filter((j) => j.id !== jobId);
    saveData(STORAGE_KEYS.MICRO_JOBS, filtered);
    return true;
  }

  static updateMicroJobRate(jobId: string, payoutBDT: number, ownerResellRateBDT: number): boolean {
    const jobs = this.getMicroJobs();
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return false;
    target.payoutBDT = payoutBDT;
    target.ownerResellRateBDT = ownerResellRateBDT;
    saveData(STORAGE_KEYS.MICRO_JOBS, jobs);
    return true;
  }

  static getMicroJobSubmissions(userId?: string): MicroJobSubmission[] {
    const all = loadData<MicroJobSubmission[]>(STORAGE_KEYS.MICRO_JOB_SUBMISSIONS, initialMicroJobSubmissions);
    if (userId) {
      return all.filter((s) => s.userId === userId);
    }
    return all;
  }

  static submitMicroJobWork(data: {
    jobId: string;
    accountIdentifier: string;
    password?: string;
    twoFactorCodeOrOtp?: string;
    additionalNotes?: string;
  }): { success: boolean; message: string; submission?: MicroJobSubmission } {
    const job = this.getMicroJobById(data.jobId);
    if (!job) return { success: false, message: 'টাস্কটি খুঁজে পাওয়া যায়নি।' };

    const profile = this.getUserProfile();

    // Check Plan task limit
    const mySubmissions = this.getMicroJobSubmissions(profile.id);
    const today = new Date().toLocaleDateString('en-GB');
    const todaySubmissions = mySubmissions.filter((s) => s.submittedAt.startsWith(today));

    let allowedLimit = 15; // default 100% free active account allows 15 tasks/day
    if (profile.accountTier === 'basic_10') allowedLimit = 25;
    else if (profile.accountTier === 'vip') allowedLimit = 40;
    else if (profile.accountTier === 'master') allowedLimit = 999;

    if (todaySubmissions.length >= allowedLimit && allowedLimit !== 999) {
      return {
        success: false,
        message: `আপনার আজকের দৈনিক লিমিট (${allowedLimit} টি কাজ) শেষ হয়েছে। অতিরিক্ত কাজ করতে ভিআইপি বুস্টারে আপগ্রেড করুন!`,
      };
    }

    // Auto-verify for Secret Code Article / Website Visit tasks
    const isAutoVerified = Boolean(job.autoVerify && job.secretCode);
    if (isAutoVerified) {
      const submittedCode = (data.accountIdentifier || '').trim();
      if (submittedCode !== job.secretCode?.trim()) {
        return {
          success: false,
          message: 'ভুল সিক্রেট কোড! অনুগ্রহ করে ওয়েবসাইটে ২০-৩০ সেকেন্ড অপেক্ষা করে প্রাপ্ত সঠিক ৬-সংখ্যার কোডটি দিন।',
        };
      }
    }

    // Rate calculation with bonus based on plan
    let bonusMultiplier = 1.0;
    if (profile.accountTier === 'basic_10') bonusMultiplier = 1.1;
    else if (profile.accountTier === 'vip') bonusMultiplier = 1.25;
    else if (profile.accountTier === 'master') bonusMultiplier = 1.5;

    const finalReward = Number((job.payoutBDT * bonusMultiplier).toFixed(2));
    const ownerProfit = Number((job.ownerResellRateBDT - finalReward).toFixed(2));

    const newSubmission: MicroJobSubmission = {
      id: `sub_${Date.now().toString().slice(-6)}`,
      jobId: job.id,
      jobTitle: job.titleBn,
      jobType: job.type,
      userId: profile.id,
      userName: `${profile.firstName} ${profile.lastName}`,
      telegramUsername: profile.username,
      accountIdentifier: data.accountIdentifier,
      password: data.password,
      twoFactorCodeOrOtp: data.twoFactorCodeOrOtp,
      additionalNotes: data.additionalNotes,
      rewardBDT: finalReward,
      ownerEstimatedProfitBDT: ownerProfit,
      status: isAutoVerified ? 'approved' : 'pending',
      submittedAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      reviewedAt: isAutoVerified ? new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US') : undefined,
    };

    const allSubmissions = loadData<MicroJobSubmission[]>(STORAGE_KEYS.MICRO_JOB_SUBMISSIONS, initialMicroJobSubmissions);
    allSubmissions.unshift(newSubmission);
    saveData(STORAGE_KEYS.MICRO_JOB_SUBMISSIONS, allSubmissions);

    // If auto-verified, credit wallet immediately without delay!
    if (isAutoVerified) {
      const wallet = this.getWallet();
      this.updateWallet({
        availableBalance: Number((wallet.availableBalance + finalReward).toFixed(2)),
        totalEarned: Number((wallet.totalEarned + finalReward).toFixed(2)),
      });

      const tx: Transaction = {
        id: `tx_job_${Date.now()}`,
        userId: profile.id,
        title: `${job.titleBn} (ইনস্ট্যান্ট পেমেন্ট)`,
        type: 'micro_job_payout',
        amount: finalReward,
        status: 'completed',
        createdAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US'),
        referenceId: newSubmission.id,
        description: `Auto-verified secret code: ${data.accountIdentifier}`,
      };
      const txs = this.getTransactions();
      txs.unshift(tx);
      saveData(STORAGE_KEYS.TRANSACTIONS, txs);

      this.updateUserProfile({
        completedTasksCount: (profile.completedTasksCount || 0) + 1,
      });

      return {
        success: true,
        message: `অভিনন্দন! আপনার সিক্রেট কোড সঠিক হয়েছে। সাথে সাথে ৳${finalReward} টাকা আপনার মেইন ওয়ালেটে জমা হয়েছে!`,
        submission: newSubmission,
      };
    }

    return {
      success: true,
      message: 'কাজটি সফলভাবে জমা হয়েছে! এডমিন যাচাই করে ব্যালেন্স যোগ করে দেবে।',
      submission: newSubmission,
    };
  }

  static approveMicroJobSubmission(submissionId: string): boolean {
    const all = this.getMicroJobSubmissions();
    const target = all.find((s) => s.id === submissionId);
    if (!target) return false;

    target.status = 'approved';
    target.reviewedAt = new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US');
    saveData(STORAGE_KEYS.MICRO_JOB_SUBMISSIONS, all);

    // If it's current user or if approving, credit user wallet
    const profile = this.getUserProfile();
    if (profile.id === target.userId) {
      const wallet = this.getWallet();
      this.updateWallet({
        availableBalance: Number((wallet.availableBalance + target.rewardBDT).toFixed(2)),
        totalEarned: Number((wallet.totalEarned + target.rewardBDT).toFixed(2)),
      });

      const tx: Transaction = {
        id: `tx_job_${Date.now()}`,
        userId: target.userId,
        title: `${target.jobTitle} - অনুমোদিত`,
        type: 'micro_job_payout',
        amount: target.rewardBDT,
        status: 'completed',
        createdAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US'),
        referenceId: target.id,
        description: `Account verified: ${target.accountIdentifier}`,
      };
      const txs = this.getTransactions();
      txs.unshift(tx);
      saveData(STORAGE_KEYS.TRANSACTIONS, txs);

      this.updateUserProfile({
        completedTasksCount: (profile.completedTasksCount || 0) + 1,
      });
    }

    return true;
  }

  static rejectMicroJobSubmission(submissionId: string, reason: string): boolean {
    const all = this.getMicroJobSubmissions();
    const target = all.find((s) => s.id === submissionId);
    if (!target) return false;

    target.status = 'rejected';
    target.rejectReason = reason;
    target.reviewedAt = new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US');
    saveData(STORAGE_KEYS.MICRO_JOB_SUBMISSIONS, all);

    return true;
  }

  // Owner Monetization & Statistics Calculation
  static getAdminStats(): AdminStats {
    const withdrawals = this.getWithdrawals();
    const pendingWds = withdrawals.filter((w) => w.status === 'pending');
    const pendingAmount = pendingWds.reduce((sum, w) => sum + w.amount, 0);
    const completedCount = withdrawals.filter((w) => w.status === 'paid').length;

    const activations = this.getActivationRequests();
    const pendingActs = activations.filter((a) => a.status === 'pending').length;
    const approvedActs = activations.filter((a) => a.status === 'approved');
    const activationRevenue = approvedActs.reduce((sum, a) => sum + a.amountBDT, 0);

    const microSubmissions = this.getMicroJobSubmissions();
    const pendingMicroJobs = microSubmissions.filter((s) => s.status === 'pending').length;
    const approvedMicroJobs = microSubmissions.filter((s) => s.status === 'approved');
    const approvedMicroJobsCount = approvedMicroJobs.length;
    const totalMicroJobResellValueBDT = approvedMicroJobs.reduce((sum, s) => {
      const job = this.getMicroJobById(s.jobId);
      return sum + (job ? job.ownerResellRateBDT : 30);
    }, 0);
    const microJobOwnerProfit = approvedMicroJobs.reduce((sum, s) => sum + s.ownerEstimatedProfitBDT, 0);

    return {
      totalUsers: 1,
      activeUsers: 1,
      totalOfferRevenue: totalMicroJobResellValueBDT,
      totalUserRewards: approvedMicroJobs.reduce((sum, s) => sum + s.rewardBDT, 0),
      pendingWithdrawalsCount: pendingWds.length,
      pendingWithdrawalsAmount: pendingAmount,
      completedWithdrawalsCount: completedCount,
      pendingActivationsCount: pendingActs,
      totalActivationRevenueBDT: activationRevenue,
      totalOwnerProfitBDT: activationRevenue + microJobOwnerProfit,
      pendingMicroJobsCount: pendingMicroJobs,
      approvedMicroJobsCount: approvedMicroJobsCount,
      totalMicroJobResellValueBDT: totalMicroJobResellValueBDT,
    };
  }

  static updateWithdrawalStatus(withdrawalId: string, newStatus: 'paid' | 'rejected' | 'processing', txId?: string, reason?: string): boolean {
    const withdrawals = this.getWithdrawals();
    const targetIndex = withdrawals.findIndex((w) => w.id === withdrawalId);
    if (targetIndex === -1) return false;

    const wd = withdrawals[targetIndex];
    if (!wd) return false;
    wd.status = newStatus;
    wd.processedAt = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US');
    if (txId) wd.transactionId = txId;
    if (reason) wd.rejectReason = reason;

    FirestoreService.updateWithdrawalStatus(withdrawalId, newStatus, txId, reason).catch(() => {});
    saveData(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    const wallet = this.getWallet();
    if (newStatus === 'paid') {
      this.updateWallet({
        pendingBalance: Math.max(0, Number((wallet.pendingBalance - wd.amount).toFixed(2))),
        totalWithdrawn: Number((wallet.totalWithdrawn + wd.amount).toFixed(2)),
      });
    } else if (newStatus === 'rejected') {
      this.updateWallet({
        pendingBalance: Math.max(0, Number((wallet.pendingBalance - wd.amount).toFixed(2))),
        availableBalance: Number((wallet.availableBalance + wd.amount).toFixed(2)),
      });
    }

    const txs = this.getTransactions();
    const targetTx = txs.find((t) => t.referenceId === withdrawalId);
    if (targetTx) {
      targetTx.status = newStatus === 'paid' ? 'completed' : newStatus === 'rejected' ? 'rejected' : 'pending';
      if (reason) targetTx.description += ` (Rejected: ${reason})`;
      if (txId) targetTx.referenceId = txId;
      saveData(STORAGE_KEYS.TRANSACTIONS, txs);
      FirestoreService.addTransaction(targetTx).catch(() => {});
    }

    return true;
  }

  // Admin User Management
  static getAllUsers(): (UserProfile & { currentBalance: number; totalEarned: number })[] {
    const profile = this.getUserProfile();
    const wallet = this.getWallet();

    const currentWithWallet = {
      ...profile,
      currentBalance: wallet.availableBalance,
      totalEarned: wallet.totalEarned,
    };

    return [
      currentWithWallet,
      {
        id: 'usr_demo_101',
        telegramId: '584920194',
        username: 'shakib_earn99',
        firstName: 'Shakib',
        lastName: 'Al Hasan',
        referralCode: 'EB9912',
        accountStatus: 'active',
        accountTier: 'active',
        memberSince: '2 days ago',
        savedPaymentNumber: '01799887766',
        savedPaymentMethod: 'bKash',
        completedTasksCount: 14,
        isTelegramUser: true,
        currentBalance: 72.5,
        totalEarned: 142.5,
      },
      {
        id: 'usr_demo_102',
        telegramId: '629104820',
        username: 'fahim_dhaka',
        firstName: 'Fahim',
        lastName: 'Ahmed',
        referralCode: 'EB4820',
        accountStatus: 'active',
        accountTier: 'vip',
        memberSince: 'Yesterday',
        savedPaymentNumber: '01855443322',
        savedPaymentMethod: 'Nagad',
        completedTasksCount: 28,
        isTelegramUser: true,
        currentBalance: 125.0,
        totalEarned: 310.0,
      },
      {
        id: 'usr_demo_103',
        telegramId: '719284910',
        username: 'rakib_tg',
        firstName: 'Rakibul',
        lastName: 'Islam',
        referralCode: 'EB8491',
        accountStatus: 'active',
        accountTier: 'pending_activation',
        memberSince: 'Today',
        savedPaymentNumber: '01922334455',
        savedPaymentMethod: 'Rocket',
        completedTasksCount: 3,
        isTelegramUser: true,
        currentBalance: 15.0,
        totalEarned: 15.0,
      },
    ];
  }

  static toggleMicroJobStatus(jobId: string): boolean {
    const jobs = this.getMicroJobs();
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return false;
    target.status = target.status === 'active' ? 'paused' : 'active';
    saveData(STORAGE_KEYS.MICRO_JOBS, jobs);
    return true;
  }

  static adjustUserBalance(userId: string, amountBDT: number, note: string): boolean {
    const profile = this.getUserProfile();
    if (profile.id === userId) {
      const wallet = this.getWallet();
      const newAvail = Math.max(0, Number((wallet.availableBalance + amountBDT).toFixed(2)));
      const newEarned = amountBDT > 0 ? Number((wallet.totalEarned + amountBDT).toFixed(2)) : wallet.totalEarned;
      this.updateWallet({ availableBalance: newAvail, totalEarned: newEarned });

      const tx: Transaction = {
        id: `tx_admin_${Date.now()}`,
        userId: profile.id,
        title: amountBDT >= 0 ? 'Admin Bonus Credit' : 'Admin Balance Adjustment',
        type: amountBDT >= 0 ? 'bonus' : 'adjustment',
        amount: Math.abs(amountBDT),
        status: 'completed',
        createdAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US'),
        referenceId: `ADM_${Date.now().toString().slice(-4)}`,
        description: note || 'Admin Adjustment',
      };
      const txs = this.getTransactions();
      txs.unshift(tx);
      saveData(STORAGE_KEYS.TRANSACTIONS, txs);
      return true;
    }
    return true;
  }

  static updateUserTierDirect(userId: string, newTier: 'inactive' | 'active' | 'vip' | 'master'): boolean {
    const profile = this.getUserProfile();
    if (profile.id === userId) {
      this.updateUserProfile({
        accountTier: newTier,
        activationDate: newTier !== 'inactive' ? new Date().toLocaleDateString('en-GB') : undefined,
      });
      return true;
    }
    return true;
  }

  static exportApprovedSubmissionsText(jobType?: string): string {
    const subs = this.getMicroJobSubmissions().filter((s) => s.status === 'approved');
    const filtered = jobType && jobType !== 'all' ? subs.filter((s) => s.jobType === jobType) : subs;
    if (filtered.length === 0) return 'কোনো অনুমোদিত একাউন্ট পাওয়া যায়নি (No approved accounts found).';

    return filtered
      .map((s, idx) => {
        let line = `${idx + 1}. [${s.jobType.toUpperCase()}] ID: ${s.accountIdentifier}`;
        if (s.password) line += ` | Pass: ${s.password}`;
        if (s.twoFactorCodeOrOtp) line += ` | 2FA: ${s.twoFactorCodeOrOtp}`;
        if (s.additionalNotes) line += ` | Note: ${s.additionalNotes}`;
        return line;
      })
      .join('\n');
  }
}
