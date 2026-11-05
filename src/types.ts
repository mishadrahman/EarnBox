export type ScreenType = 'home' | 'tasks' | 'referral' | 'wallet' | 'profile' | 'admin';

export type OfferCategory = 'all' | 'create_work' | 'social' | 'survey' | 'app' | 'game' | 'featured';

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';

export type WithdrawalStatus = 'pending' | 'processing' | 'paid' | 'rejected';

export type TransactionType =
  | 'earning'
  | 'withdrawal'
  | 'bonus'
  | 'referral'
  | 'activation_cashback'
  | 'lucky_spin'
  | 'micro_job_payout'
  | 'adjustment';

export type TransactionStatus = 'completed' | 'pending' | 'rejected';

export type OfferDifficulty = 'Easy' | 'Medium' | 'Hard';

export type OfferStatus = 'available' | 'in_progress' | 'completed' | 'paused';

export type AccountTier = 'inactive' | 'pending_activation' | 'active' | 'basic_10' | 'vip' | 'master';

export type MicroJobType =
  | 'tg_channel'
  | 'youtube_sub'
  | 'fb_follow'
  | 'article_code'
  | 'app_review'
  | 'fb_create'
  | 'telegram_create'
  | 'whatsapp_create'
  | 'gmail_create';

export interface MicroJob {
  id: string;
  type: MicroJobType;
  title: string;
  titleBn: string;
  shortDesc: string;
  payoutBDT: number;
  ownerResellRateBDT: number; // What advertiser/sponsor pays you (e.g. ৳3)
  estimatedMinutes: number;
  dailyLimitPerUser: number;
  category: 'sponsored_task' | 'web_visit' | 'account_create';
  status: 'active' | 'paused';
  demandTag: 'Hot' | 'Trending' | 'High Demand' | 'Instant';
  instructionsBn: string[];
  requirements: string[];
  targetUrl?: string;
  secretCode?: string; // Optional auto-verification code (e.g. 6-digit code on article)
  autoVerify?: boolean; // If true, matches secretCode for instant reward
  submissionFields: {
    key: 'accountIdentifier' | 'password' | 'twoFactorCodeOrOtp' | 'additionalNotes';
    labelBn: string;
    placeholder: string;
    type: 'text' | 'tel' | 'email' | 'password';
    required: boolean;
    helperTextBn?: string;
  }[];
}

export interface MicroJobSubmission {
  id: string;
  jobId: string;
  jobTitle: string;
  jobType: MicroJobType;
  userId: string;
  userName: string;
  telegramUsername: string;
  accountIdentifier: string; // Phone or Email
  password?: string;
  twoFactorCodeOrOtp?: string;
  additionalNotes?: string;
  rewardBDT: number;
  ownerEstimatedProfitBDT: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface MembershipPlan {
  id: 'free' | 'basic_10' | 'vip_50' | 'master_100';
  name: string;
  nameBn: string;
  priceBDT: number;
  cashbackBDT: number;
  dailyTaskLimit: number | 'Unlimited';
  rateBonusPercent: number;
  canWithdraw: boolean;
  minWithdrawalBDT: number;
  payoutSpeed: string;
  features: string[];
  isPopular?: boolean;
}

export interface UserProfile {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  referralCode: string;
  referredBy?: string;
  accountStatus: 'active' | 'suspended' | 'flagged';
  accountTier: AccountTier;
  memberSince: string;
  savedPaymentNumber?: string;
  savedPaymentMethod?: PaymentMethod;
  completedTasksCount: number;
  isTelegramUser: boolean;
  activationDate?: string;
}

export interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: 'BDT';
  lastUpdated: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  detailedInstructions: string[];
  requirements: string[];
  category: 'app' | 'survey' | 'game' | 'featured';
  rewardBDT: number;
  estimatedMinutes: number;
  difficulty: OfferDifficulty;
  provider: string;
  iconUrl?: string;
  status: OfferStatus;
  terms: string;
  featured?: boolean;
  requiresActiveAccount?: boolean;
}

export interface SocialTask {
  id: string;
  title: string;
  type: 'telegram' | 'youtube' | 'facebook' | 'web';
  channelOrUrl: string;
  rewardBDT: number;
  clientRateBDT: number; // Client pays you ৳2.50
  ownerProfitBDT: number; // Owner keeps ৳1.50
  providerName: string;
  instructions: string;
  status: 'available' | 'completed';
}

export interface ActivationRequest {
  id: string;
  userId: string;
  userName: string;
  telegramUsername: string;
  plan: 'basic_10' | 'vip_50' | 'master_100';
  amountBDT: number;
  paymentMethod: PaymentMethod;
  senderNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  processingFeeBDT: number;
  netAmountBDT: number;
  paymentMethod: PaymentMethod;
  accountNumber: string;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
  transactionId?: string;
  rejectReason?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  referenceId: string;
  description: string;
  paymentMethod?: PaymentMethod;
  provider?: string;
}

export interface ReferralFriend {
  id: string;
  name: string;
  username: string;
  joinedAt: string;
  tasksCompleted: number;
  rewardEarnedBDT: number;
  status: 'active' | 'pending_qualification';
}

export interface DailyCheckInState {
  currentDay: number; // 1 to 7
  lastClaimedDate: string | null;
  canClaimToday: boolean;
  streakCount: number;
}

export interface LuckySpinState {
  spinsLeft: number;
  lastSpinDate: string | null;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOfferRevenue: number;
  totalUserRewards: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  completedWithdrawalsCount: number;
  pendingActivationsCount: number;
  totalActivationRevenueBDT: number;
  totalOwnerProfitBDT: number;
  pendingMicroJobsCount: number;
  approvedMicroJobsCount: number;
  totalMicroJobResellValueBDT: number;
}

export interface AdminPaymentConfig {
  bkashPersonalNumber: string;
  nagadPersonalNumber: string;
  rocketPersonalNumber: string;
  activationFeeBDT: number;
  minWithdrawalBDT: number;
  cashoutFeePercent: number;
  telegramChannelLink: string;
  supportUsername: string;
}
