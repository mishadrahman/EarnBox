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
  accountTier: 'inactive', // Fresh inactive tier (10 Tk activation)
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

// Trending high-demand micro-jobs (FB Create, Telegram Create, WhatsApp Create, Gmail Create)
const initialMicroJobs: MicroJob[] = [
  {
    id: 'job_fb_01',
    type: 'fb_create',
    title: 'Facebook Account Creation Work',
    titleBn: 'ফেসবুক অ্যাকাউন্ট ক্রিয়েট কাজ',
    shortDesc: 'নতুন ফ্রেশ ফেসবুক আইডি খুলে লগইন ডিটেইলস জমা দিন ও রিওয়ার্ড নিন',
    payoutBDT: 12.0,
    ownerResellRateBDT: 30.0,
    estimatedMinutes: 4,
    dailyLimitPerUser: 5,
    category: 'account_create',
    status: 'active',
    demandTag: 'Hot',
    instructionsBn: [
      'ক্রোম বা অন্য ব্রাউজারে ইনকগনিটো (Incognito) মোড অন করুন।',
      'যেকোনো ইংলিশ বা বাংলা ফ্রেশ নাম এবং ইমেইল/নম্বর দিয়ে নতুন ফেসবুক একাউন্ট সাইন-আপ করুন।',
      'প্রোফাইলে যেকোনো স্বাভাবিক ছবি ও বায়ো যুক্ত করুন।',
      'লগইন ইমেইল/নম্বর, পাসওয়ার্ড এবং (থাকলে) 2FA সিক্রেট কোড নিচে জমা দিন।',
      'এডমিন চেক করে অবিলম্বে আপনার ওয়ালেটে ৳১২ টাকা যোগ করে দেবে।',
    ],
    requirements: ['নতুন ও সক্রিয় ফেসবুক আইডি', 'প্রোফাইল পিকচার থাকতে হবে', 'সঠিক পাসওয়ার্ড'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: 'ফেসবুক লগইন ইমেইল বা ফোন নম্বর',
        placeholder: 'e.g. user123@gmail.com বা 017xxxxxxxx',
        type: 'text',
        required: true,
      },
      {
        key: 'password',
        labelBn: 'ফেসবুক পাসওয়ার্ড',
        placeholder: 'e.g. FbPass#2026',
        type: 'text',
        required: true,
      },
      {
        key: 'twoFactorCodeOrOtp',
        labelBn: '2FA ব্যাকআপ কোড / সিক্রেট কি (যদি থাকে)',
        placeholder: 'e.g. 123456 বা 2FA Secret',
        type: 'text',
        required: false,
        helperTextBn: '2FA কোড দিলে আইডি দ্রুত এপ্রুভ হয়',
      },
      {
        key: 'additionalNotes',
        labelBn: 'প্রোফাইল লিংক বা অতিরিক্ত নোট (ঐচ্ছিক)',
        placeholder: 'https://facebook.com/...',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    id: 'job_tg_01',
    type: 'telegram_create',
    title: 'Telegram Account Creation Work',
    titleBn: 'টেলিগ্রাম অ্যাকাউন্ট ক্রিয়েট কাজ',
    shortDesc: 'সিম বা ভার্চুয়াল নম্বর দিয়ে টেলিগ্রাম আইডি খুলে লগইন কোড দিন',
    payoutBDT: 18.0,
    ownerResellRateBDT: 45.0,
    estimatedMinutes: 3,
    dailyLimitPerUser: 5,
    category: 'account_create',
    status: 'active',
    demandTag: 'Trending',
    instructionsBn: [
      'নতুন একটি সিম কার্ড দিয়ে টেলিগ্রাম অ্যাপ বা টেলিগ্রাম ওয়েবে সাইন-আপ করুন।',
      'একাউন্টে যেকোনো ইউজারনেম ও স্বাভাবিক নাম সেট করুন।',
      'আপনার ফোন নম্বরটি কান্ট্রি কোড সহ (+880...) নিচে লিখুন।',
      'এডমিন লগইন ট্রাই করলে আপনার ফোনে আসা ৫-সংখ্যার লগইন কোড ও 2FA দিন।',
      'ভেরিফিকেশন সম্পন্ন হলেই ওয়ালেটে ৳১৮ টাকা ক্রেডিট হবে।',
    ],
    requirements: ['ফ্রেশ সিম নম্বর (আগে ব্যান হয়নি)', 'এডমিনকে ৫ মিনিটের মধ্যে ওটিপি প্রদান', 'সঠিক কান্ট্রি কোড'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: 'টেলিগ্রাম ফোন নম্বর (+৮৮০ সহ)',
        placeholder: '+88017xxxxxxxx',
        type: 'tel',
        required: true,
      },
      {
        key: 'twoFactorCodeOrOtp',
        labelBn: 'টেলিগ্রাম লগইন ওটিপি / কোড',
        placeholder: 'e.g. 74821',
        type: 'text',
        required: true,
        helperTextBn: 'লগইনের জন্য কোড প্রয়োজন',
      },
      {
        key: 'password',
        labelBn: '2-Step Verification পাসওয়ার্ড (যদি থাকে)',
        placeholder: 'e.g. TgPass@88',
        type: 'text',
        required: false,
      },
      {
        key: 'additionalNotes',
        labelBn: 'ইউজারনেম বা অতিরিক্ত নোট',
        placeholder: '@username',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    id: 'job_wa_01',
    type: 'whatsapp_create',
    title: 'WhatsApp Account Creation & Link',
    titleBn: 'হোয়াটসঅ্যাপ একাউন্ট ক্রিয়েট / লিংক কাজ',
    shortDesc: 'হোয়াটসঅ্যাপে নম্বর চালু করে লিংক কোড সাবমিট করে আয় করুন',
    payoutBDT: 15.0,
    ownerResellRateBDT: 38.0,
    estimatedMinutes: 2,
    dailyLimitPerUser: 5,
    category: 'account_create',
    status: 'active',
    demandTag: 'High Demand',
    instructionsBn: [
      'হোয়াটসঅ্যাপে আপনার নতুন সিম দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন।',
      'অথবা লিঙ্কড ডিভাইস (Linked Device) কোড ব্যবহার করে লিংক কোড শেয়ার করুন।',
      'আপনার হোয়াটসঅ্যাপ ফোন নম্বর ও ওটিপি/লিংক কোড নিচে সাবমিট করুন।',
      'এডমিন সফলভাবে কানেক্ট করলেই সাথে সাথে ৳১৫ টাকা বোনাস পাবেন।',
    ],
    requirements: ['সক্রিয় হোয়াটসঅ্যাপ নম্বর', 'সঠিক ৬-সংখ্যার ওটিপি বা লিংক কোড'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: 'হোয়াটসঅ্যাপ মোবাইল নম্বর',
        placeholder: '018xxxxxxxx বা +88018xxxxxxxx',
        type: 'tel',
        required: true,
      },
      {
        key: 'twoFactorCodeOrOtp',
        labelBn: 'হোয়াটসঅ্যাপ ভেরিফিকেশন কোড বা লিংক কোড',
        placeholder: 'e.g. 491-032',
        type: 'text',
        required: true,
      },
      {
        key: 'password',
        labelBn: 'টু-স্টেপ পিন (যদি সেট করে থাকেন)',
        placeholder: 'e.g. 123456',
        type: 'text',
        required: false,
      },
      {
        key: 'additionalNotes',
        labelBn: 'অতিরিক্ত তথ্য (ঐচ্ছিক)',
        placeholder: 'নোট লিখুন...',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    id: 'job_gmail_01',
    type: 'gmail_create',
    title: 'Fresh Gmail Account Work',
    titleBn: 'ফ্রেশ জিমেইল (Gmail) ক্রিয়েট কাজ',
    shortDesc: 'মোবাইল দিয়ে ফোন নম্বর ছাড়া জিমেইল খুলে ইমেইল ও পাসওয়ার্ড জমা দিন',
    payoutBDT: 8.0,
    ownerResellRateBDT: 20.0,
    estimatedMinutes: 2,
    dailyLimitPerUser: 10,
    category: 'account_create',
    status: 'active',
    demandTag: 'Hot',
    instructionsBn: [
      'ব্রাউজারে Incognito মোডে accounts.google.com খুলুন।',
      'যেকোনো ইংলিশ নাম দিয়ে একটি নতুন জিমেইল খুলুন (ফোন নম্বর ছাড়া Skip দিন)।',
      'পাসওয়ার্ড দিন সহজ ও স্ট্রং যেমন: BdEarn#2026',
      'জিমেইল এড্রেস ও পাসওয়ার্ড নিচে লিখে সাবমিট করুন।',
    ],
    requirements: ['কোনো ফোন নম্বর অ্যাড করা যাবে না', 'সঠিক পাসওয়ার্ড দিতে হবে'],
    submissionFields: [
      {
        key: 'accountIdentifier',
        labelBn: 'জিমেইল এড্রেস (Gmail Address)',
        placeholder: 'example123@gmail.com',
        type: 'email',
        required: true,
      },
      {
        key: 'password',
        labelBn: 'জিমেইল পাসওয়ার্ড',
        placeholder: 'BdEarn#2026',
        type: 'text',
        required: true,
      },
      {
        key: 'twoFactorCodeOrOtp',
        labelBn: 'রিকভারি ইমেইল (যদি দিয়ে থাকেন)',
        placeholder: 'recovery@mail.com',
        type: 'text',
        required: false,
      },
      {
        key: 'additionalNotes',
        labelBn: 'অতিরিক্ত নোট (ঐচ্ছিক)',
        placeholder: '',
        type: 'text',
        required: false,
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

// Membership Plans
const initialMembershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    nameBn: 'ফ্রি ট্রায়াল (ডিফল্ট)',
    priceBDT: 0,
    cashbackBDT: 0,
    dailyTaskLimit: 1,
    rateBonusPercent: 0,
    canWithdraw: false,
    minWithdrawalBDT: 50,
    payoutSpeed: 'লকড',
    features: [
      'দিনে মাত্র ১টি কাজ করার সুযোগ',
      'উইথড্র অপশন লকড (সক্রিয় করতে ৳১০ ফি)',
      'রেগুলার টাস্ক রেট',
    ],
  },
  {
    id: 'basic_10',
    name: 'Starter Active',
    nameBn: 'স্টার্টার অ্যাক্টিভ (৳১০)',
    priceBDT: 10,
    cashbackBDT: 5,
    dailyTaskLimit: 5,
    rateBonusPercent: 0,
    canWithdraw: true,
    minWithdrawalBDT: 50,
    payoutSpeed: '১২-২৪ ঘণ্টা',
    isPopular: true,
    features: [
      'আজীবন অ্যাক্টিভ একাউন্ট',
      'সাথে সাথে ৳৫ ক্যাশব্যাক বোনাস',
      'প্রতিদিন ৫টি অ্যাকাউন্ট ক্রিয়েট কাজ',
      'বিকাশ, নগদ ও রকেটে সর্বনিম্ন ৳৫০ ক্যাশআউট',
      'সোশ্যাল ও অফারওয়াল এক্সেস',
    ],
  },
  {
    id: 'vip_50',
    name: 'VIP Pro Worker',
    nameBn: 'ভিআইপি প্রো প্ল্যান (৳৫০)',
    priceBDT: 50,
    cashbackBDT: 15,
    dailyTaskLimit: 20,
    rateBonusPercent: 20,
    canWithdraw: true,
    minWithdrawalBDT: 50,
    payoutSpeed: '২ ঘণ্টার মধ্যে ফাস্ট',
    features: [
      'প্রতিদিন ২০টি অ্যাকাউন্ট ক্রিয়েট কাজ',
      'সাথে সাথে ৳১৫ ক্যাশব্যাক বোনাস',
      'প্রতিটি কাজে +২০% এক্সট্রা বোনাস ইনকাম',
      '২ ঘণ্টার মধ্যে ফাস্ট বিকাশ/নগদ পেমেন্ট',
      'হাই প্রায়োরিটি ভেরিফিকেশন',
    ],
  },
  {
    id: 'master_100',
    name: 'Master Earner',
    nameBn: 'মাস্টার টিম প্ল্যান (৳১০০)',
    priceBDT: 100,
    cashbackBDT: 30,
    dailyTaskLimit: 'Unlimited',
    rateBonusPercent: 40,
    canWithdraw: true,
    minWithdrawalBDT: 50,
    payoutSpeed: '১৫ মিনিটে ইনস্ট্যান্ট',
    features: [
      'আনলিমিটেড অ্যাকাউন্ট ক্রিয়েট কাজ',
      'সাথে সাথে ৳৩০ ক্যাশব্যাক বোনাস',
      'প্রতি কাজে +৪০% এক্সট্রা রেট',
      '১৫ মিনিটে ইনস্ট্যান্ট বিকাশ/নগদ উইথড্র',
      'স্পেশাল বালক জবস ও ভিআইপি সাপোর্ট',
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

  // Micro Jobs (FB, Telegram, WhatsApp, Gmail Create Work)
  static getMicroJobs(): MicroJob[] {
    return loadData(STORAGE_KEYS.MICRO_JOBS, initialMicroJobs);
  }

  static getMicroJobById(jobId: string): MicroJob | undefined {
    return this.getMicroJobs().find((j) => j.id === jobId);
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

    let allowedLimit = 1; // free
    if (profile.accountTier === 'active') allowedLimit = 5;
    else if (profile.accountTier === 'vip') allowedLimit = 20;
    else if (profile.accountTier === 'master') allowedLimit = 999;

    if (todaySubmissions.length >= allowedLimit && profile.accountTier === 'inactive') {
      return {
        success: false,
        message: 'ফ্রি একাউন্টে দিনে মাত্র ১টি কাজ করা যায়। দিনে আনলিমিটেড কাজ করতে ৳১০ দিয়ে একাউন্ট একটিভ করুন!',
      };
    } else if (todaySubmissions.length >= allowedLimit && allowedLimit !== 999) {
      return {
        success: false,
        message: `আপনার আজকের দৈনিক লিমিট (${allowedLimit} টি কাজ) শেষ হয়েছে। অতিরিক্ত কাজ করতে ভিআইপি প্ল্যানে আপগ্রেড করুন!`,
      };
    }

    // Rate calculation with bonus based on plan
    let bonusMultiplier = 1.0;
    if (profile.accountTier === 'vip') bonusMultiplier = 1.2;
    else if (profile.accountTier === 'master') bonusMultiplier = 1.4;

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
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const allSubmissions = loadData<MicroJobSubmission[]>(STORAGE_KEYS.MICRO_JOB_SUBMISSIONS, initialMicroJobSubmissions);
    allSubmissions.unshift(newSubmission);
    saveData(STORAGE_KEYS.MICRO_JOB_SUBMISSIONS, allSubmissions);

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
}
