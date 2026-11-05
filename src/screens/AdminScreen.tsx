import React, { useState, useMemo } from 'react';
import {
  AdminStats,
  WithdrawalRequest,
  ActivationRequest,
  Offer,
  SocialTask,
  PaymentMethod,
  AdminPaymentConfig,
  MicroJob,
  MicroJobSubmission,
  MicroJobType,
  UserProfile,
} from '../types';
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Check,
  Zap,
  Settings,
  Shield,
  Phone,
  Lock,
  ExternalLink,
  TrendingUp,
  Copy,
  Flame,
  FileCheck,
  Edit2,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  PlusCircle,
  Eye,
  Award,
  Sparkles,
  UserCheck,
  Sliders,
  Share2,
  Plus,
  Trash2,
  Link,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';

interface AdminScreenProps {
  stats: AdminStats;
  withdrawals: WithdrawalRequest[];
  activations: ActivationRequest[];
  offers: Offer[];
  socialTasks: SocialTask[];
  adminConfig: AdminPaymentConfig;
  onExitAdmin: () => void;
  onRefreshData: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  stats,
  withdrawals,
  activations,
  adminConfig,
  onExitAdmin,
  onRefreshData,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'tasks' | 'activations' | 'withdrawals' | 'users' | 'rates' | 'export' | 'config'
  >('tasks');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [actFilter, setActFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [wdFilter, setWdFilter] = useState<'all' | 'pending' | 'paid' | 'rejected'>('pending');

  // Rejection Modal State
  const [rejectModalData, setRejectModalData] = useState<{
    type: 'task' | 'activation' | 'withdrawal';
    id: string;
    targetName: string;
    customReason: string;
  } | null>(null);

  // Withdrawal Payment Modal State
  const [selectedWd, setSelectedWd] = useState<WithdrawalRequest | null>(null);
  const [approvalTxId, setApprovalTxId] = useState('');

  // Rate Editing State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editPayout, setEditPayout] = useState<number>(0);
  const [editResell, setEditResell] = useState<number>(0);

  // New Sponsored Campaign Modal State
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [newCampaignTitleBn, setNewCampaignTitleBn] = useState('');
  const [newCampaignType, setNewCampaignType] = useState<MicroJobType>('tg_channel');
  const [newCampaignUrl, setNewCampaignUrl] = useState('');
  const [newCampaignPayout, setNewCampaignPayout] = useState<number>(2.0);
  const [newCampaignClientRate, setNewCampaignClientRate] = useState<number>(4.5);
  const [newCampaignSecretCode, setNewCampaignSecretCode] = useState('');
  const [newCampaignLimit, setNewCampaignLimit] = useState<number>(1);
  const [newCampaignShortDesc, setNewCampaignShortDesc] = useState('');
  const [newCampaignInstructions, setNewCampaignInstructions] = useState('');

  // User Balance Credit Modal State
  const [creditUserModal, setCreditUserModal] = useState<UserProfile | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('10');
  const [creditNote, setCreditNote] = useState<string>('কাজের পারফরম্যান্স বোনাস');

  // Config State
  const [bkashNum, setBkashNum] = useState(adminConfig.bkashPersonalNumber);
  const [nagadNum, setNagadNum] = useState(adminConfig.nagadPersonalNumber);
  const [rocketNum, setRocketNum] = useState(adminConfig.rocketPersonalNumber);
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('earnbox_admin_pin') || '8800');
  const [minWithdrawal, setMinWithdrawal] = useState(adminConfig.minWithdrawalBDT || 50);

  // Bulk Export State
  const [exportJobType, setExportJobType] = useState<string>('all');
  const [copiedExport, setCopiedExport] = useState(false);

  // Notice Banner
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fresh Data
  const microJobs = DataService.getMicroJobs();
  const microJobSubmissions = DataService.getMicroJobSubmissions();
  const allUsers = DataService.getAllUsers();

  const pendingMicroJobs = microJobSubmissions.filter((s) => s.status === 'pending');
  const pendingActivations = activations.filter((a) => a.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  // Master PIN Auth Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('earnbox_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const correctPin = localStorage.getItem('earnbox_admin_pin') || '8800';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === correctPin) {
      triggerHaptic('success');
      sessionStorage.setItem('earnbox_admin_auth', 'true');
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      triggerHaptic('error');
      setPinError('ভুল মাস্টার পিন! সঠিক ৪-সংখ্যার এডমিন পিন দিন।');
    }
  };

  const handleLogout = () => {
    triggerHaptic('light');
    sessionStorage.removeItem('earnbox_admin_auth');
    setIsAuthenticated(false);
    setPinInput('');
  };

  const copyToClipboard = (text: string, id: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Task Actions
  const handleApproveMicroJob = (sub: MicroJobSubmission) => {
    triggerHaptic('success');
    DataService.approveMicroJobSubmission(sub.id);
    setActionNotice(`✅ অনুমোদিত: ${sub.jobTitle} (${sub.accountIdentifier}) — ৳${sub.rewardBDT} ইউজারের ওয়ালেটে যোগ হয়েছে!`);
    onRefreshData();
  };

  const handleConfirmReject = () => {
    if (!rejectModalData) return;
    const { type, id, customReason } = rejectModalData;
    const reason = customReason.trim() || 'প্রদত্ত তথ্য সঠিক নয়';

    triggerHaptic('warning');
    if (type === 'task') {
      DataService.rejectMicroJobSubmission(id, reason);
      setActionNotice(`❌ কাজটি বাতিল করা হয়েছে (${id})। কারণ: ${reason}`);
    } else if (type === 'activation') {
      DataService.rejectActivationRequest(id, reason);
      setActionNotice(`❌ অ্যাক্টিভেশন বাতিল করা হয়েছে (${id})।`);
    } else if (type === 'withdrawal') {
      DataService.updateWithdrawalStatus(id, 'rejected', undefined, reason);
      setActionNotice(`❌ টাকা উত্তোলন বাতিল ও রিফান্ড করা হয়েছে (${id})।`);
    }

    setRejectModalData(null);
    onRefreshData();
  };

  // Activation Actions
  const handleApproveActivation = (req: ActivationRequest) => {
    triggerHaptic('success');
    DataService.approveActivationRequest(req.id);
    setActionNotice(`✅ ৳${req.amountBDT} অ্যাক্টিভেশন সফল! ${req.userName} (@${req.telegramUsername}) এখন একটিভ মেম্বার।`);
    onRefreshData();
  };

  // Cashout Actions
  const handleApproveWd = () => {
    if (!selectedWd) return;
    triggerHaptic('success');
    const tx = approvalTxId.trim() || `BK9X${Math.floor(100000 + Math.random() * 900000)}`;
    DataService.updateWithdrawalStatus(selectedWd.id, 'paid', tx);
    setActionNotice(`✅ ক্যাশআউট পেইড: ৳${selectedWd.netAmountBDT} পাঠানো হয়েছে ${selectedWd.accountNumber} নম্বরে (TrxID: ${tx})`);
    setSelectedWd(null);
    setApprovalTxId('');
    onRefreshData();
  };

  // Job Rates & Toggle
  const handleSaveRate = (jobId: string) => {
    triggerHaptic('success');
    DataService.updateMicroJobRate(jobId, editPayout, editResell);
    setEditingJobId(null);
    setActionNotice('✅ কাজের রেট ও রিসেল মার্জিন সফলভাবে আপডেট করা হয়েছে!');
    onRefreshData();
  };

  const handleToggleJob = (jobId: string) => {
    triggerHaptic('medium');
    DataService.toggleMicroJobStatus(jobId);
    setActionNotice('কাজের স্ট্যাটাস পরিবর্তন করা হয়েছে!');
    onRefreshData();
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitleBn.trim()) {
      alert('অনুগ্রহ করে টাস্কের নাম দিন।');
      return;
    }

    const isAuto = newCampaignType === 'article_code' || Boolean(newCampaignSecretCode.trim());

    const instructions = newCampaignInstructions.trim()
      ? newCampaignInstructions.split('\n').filter(Boolean)
      : [
          'নিচের বাটনে ক্লিক করে স্পনসর পেজে যান।',
          'কাজ সম্পন্ন করে প্রয়োজনীয় প্রুফ নিচে সাবমিট করুন।',
          'এডমিন যাচাই করলেই একাউন্টে টাকা যোগ হবে।',
        ];

    let submissionFieldLabel = 'আপনার টেলিগ্রাম ইউজারনেম (@ সহ)';
    let submissionFieldPlaceholder = '@username';
    if (newCampaignType === 'youtube_sub') {
      submissionFieldLabel = 'ইউটিউব প্রোফাইল নাম বা জিমেইল';
      submissionFieldPlaceholder = 'e.g. Tanvir Hasan';
    } else if (newCampaignType === 'article_code') {
      submissionFieldLabel = '৬-সংখ্যার সিক্রেট কোড';
      submissionFieldPlaceholder = 'e.g. 849201';
    } else if (newCampaignType === 'fb_follow') {
      submissionFieldLabel = 'ফেসবুক প্রোফাইল নাম';
      submissionFieldPlaceholder = 'e.g. Tanvir Hasan';
    } else if (newCampaignType === 'app_review') {
      submissionFieldLabel = 'গুগল প্লে-স্টোর নাম';
      submissionFieldPlaceholder = 'e.g. Tanvir Hasan';
    }

    DataService.addMicroJob({
      type: newCampaignType,
      title: newCampaignTitleBn,
      titleBn: newCampaignTitleBn,
      shortDesc: newCampaignShortDesc || 'লিংকে গিয়ে কাজটি করুন এবং রিওয়ার্ড নিন',
      payoutBDT: Number(newCampaignPayout),
      ownerResellRateBDT: Number(newCampaignClientRate),
      estimatedMinutes: 2,
      dailyLimitPerUser: Number(newCampaignLimit) || 1,
      category: newCampaignType === 'article_code' ? 'web_visit' : 'sponsored_task',
      status: 'active',
      demandTag: isAuto ? 'Instant' : 'Hot',
      targetUrl: newCampaignUrl.trim() || undefined,
      secretCode: newCampaignSecretCode.trim() || undefined,
      autoVerify: isAuto,
      instructionsBn: instructions,
      requirements: ['সঠিক তথ্য জমা দিতে হবে', 'একজনের জন্য একটি একাউন্ট'],
      submissionFields: [
        {
          key: 'accountIdentifier',
          labelBn: submissionFieldLabel,
          placeholder: submissionFieldPlaceholder,
          type: 'text',
          required: true,
        },
      ],
    });

    triggerHaptic('success');
    setShowAddCampaignModal(false);
    setNewCampaignTitleBn('');
    setNewCampaignUrl('');
    setNewCampaignSecretCode('');
    setNewCampaignShortDesc('');
    setNewCampaignInstructions('');
    setActionNotice('✅ নতুন স্পনসর ক্যাম্পেইন সফলভাবে তৈরি হয়েছে এবং ব্যবহারকারীদের জন্য লাইভ হয়েছে!');
    onRefreshData();
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই টাস্কটি মুছে ফেলতে চান?')) {
      DataService.deleteMicroJob(jobId);
      triggerHaptic('medium');
      setActionNotice('টাস্কটি সফলভাবে মুছে ফেলা হয়েছে।');
      onRefreshData();
    }
  };

  // User Balance Credit
  const handleCreditUser = () => {
    if (!creditUserModal) return;
    const amt = parseFloat(creditAmount);
    if (isNaN(amt) || amt === 0) return;

    triggerHaptic('success');
    DataService.adjustUserBalance(creditUserModal.id, amt, creditNote);
    setActionNotice(`✅ ${creditUserModal.firstName}-এর একাউন্টে ৳${amt} ক্রেডিট করা হয়েছে!`);
    setCreditUserModal(null);
    onRefreshData();
  };

  // Config Update
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    DataService.updateAdminPaymentConfig({
      bkashPersonalNumber: bkashNum,
      nagadPersonalNumber: nagadNum,
      rocketPersonalNumber: rocketNum,
      minWithdrawalBDT: Number(minWithdrawal) || 50,
    });
    if (adminPin.trim().length >= 4) {
      localStorage.setItem('earnbox_admin_pin', adminPin.trim());
    }
    setActionNotice('✅ পেমেন্ট নম্বর, মিনিমাম উইথড্র ও মাস্টার পিন সেভ হয়েছে!');
    onRefreshData();
  };

  // Filtered Task Submissions
  const filteredSubmissions = useMemo(() => {
    return microJobSubmissions.filter((sub) => {
      const matchesStatus = taskFilter === 'all' || sub.status === taskFilter;
      const matchesType = taskTypeFilter === 'all' || sub.jobType === taskTypeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sub.userName.toLowerCase().includes(q) ||
        sub.telegramUsername.toLowerCase().includes(q) ||
        sub.accountIdentifier.toLowerCase().includes(q) ||
        sub.jobTitle.toLowerCase().includes(q);
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [microJobSubmissions, taskFilter, taskTypeFilter, searchQuery]);

  // Filtered Activations
  const filteredActivations = useMemo(() => {
    return activations.filter((act) => {
      const matchesStatus = actFilter === 'all' || act.status === actFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        act.userName.toLowerCase().includes(q) ||
        act.telegramUsername.toLowerCase().includes(q) ||
        act.senderNumber.includes(q) ||
        act.trxId.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [activations, actFilter, searchQuery]);

  // Filtered Withdrawals
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((wd) => {
      const matchesStatus = wdFilter === 'all' || wd.status === wdFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        wd.userName.toLowerCase().includes(q) ||
        wd.accountNumber.includes(q) ||
        (wd.transactionId && wd.transactionId.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [withdrawals, wdFilter, searchQuery]);

  // Bulk Export String
  const exportText = useMemo(() => {
    return DataService.exportApprovedSubmissionsText(exportJobType);
  }, [exportJobType, microJobSubmissions]);

  // 1. PIN Security Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-7 h-7 text-amber-400" />
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-slate-900">EarnBox Owner Console</h3>
            <p className="text-xs text-slate-500 mt-1">
              সুরক্ষিত অ্যাডমিন পোর্টাল। প্রবেশ করতে আপনার ৪-সংখ্যার মাস্টার পিন কোড দিন।
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block text-left mb-1.5">
                Master Admin PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                placeholder="ডিফল্ট পিন: 8800"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-center font-mono font-extrabold text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
                autoFocus
              />
            </div>

            {pinError && (
              <div className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-amber-300 font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>এডমিন প্যানেলে প্রবেশ করুন</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
              Default Master PIN: <span className="font-bold text-slate-900">8800</span>
            </div>

            <button
              onClick={onExitAdmin}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1 mx-auto py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ইউজার অ্যাপে ফিরে যান (/)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Authenticated Admin Console
  return (
    <div className="space-y-4 pb-20 max-w-5xl mx-auto">
      {/* Top Professional Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20 shrink-0">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  EarnBox Operations Desk
                </h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  /admin
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold">Live System</span>
                </span>
                <span>•</span>
                <span>Currency: ৳ BDT</span>
                <span>•</span>
                <span className="text-slate-300">Master PIN Protected</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                triggerHaptic('light');
                onRefreshData();
                setActionNotice('🔄 সর্বশেষ ডাটা রিফ্রেশ করা হয়েছে!');
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                onExitAdmin();
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-sm"
              title="Return to User App"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ইউজার ভিউ (/)</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-bold rounded-xl transition-all"
              title="Lock Admin Panel"
            >
              লক
            </button>
          </div>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="bg-emerald-50 text-emerald-900 px-4 py-3 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-black px-1.5 py-0.5 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Metric 1: Net Owner Profit */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-4 border border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full">
              মোট এডমিন লাভ
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            ৳{stats.totalOwnerProfitBDT.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-200/80 mt-1 flex items-center justify-between">
            <span>ফি: ৳{stats.totalActivationRevenueBDT}</span>
            <span>মার্জিন: +৳{(stats.totalOwnerProfitBDT - stats.totalActivationRevenueBDT).toFixed(1)}</span>
          </div>
        </div>

        {/* Metric 2: Pending Tasks */}
        <div
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('tasks');
            setTaskFilter('pending');
          }}
          className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              জমা কাজ যাচাই
            </span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-baseline space-x-1.5">
            <span>{pendingMicroJobs.length}</span>
            <span className="text-xs font-bold text-slate-400">অপেক্ষমাণ</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            ফেসবুক, টেলিগ্রাম ও হোয়াটসঅ্যাপ সাবমিশন
          </div>
        </div>

        {/* Metric 3: Activations */}
        <div
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('activations');
            setActFilter('pending');
          }}
          className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              মেম্বার অ্যাক্টিভেশন
            </span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-baseline space-x-1.5">
            <span>{pendingActivations.length}</span>
            <span className="text-xs font-bold text-slate-400">নতুন রিকোয়েস্ট</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            ৳১০/৳৫০ বিকাশ ও নগদ TrxID ভেরিফিকেশন
          </div>
        </div>

        {/* Metric 4: Cashouts */}
        <div
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('withdrawals');
            setWdFilter('pending');
          }}
          className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:border-rose-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              উইথড্র / ক্যাশআউট
            </span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-baseline space-x-1.5">
            <span>{pendingWithdrawals.length}</span>
            <span className="text-xs font-bold text-slate-400">পেন্ডিং</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            মোট প্রদেয়: <span className="font-bold text-slate-900">৳{stats.pendingWithdrawalsAmount}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          {
            id: 'tasks' as const,
            label: 'জমা কাজ যাচাই',
            badge: pendingMicroJobs.length,
            icon: FileCheck,
          },
          {
            id: 'activations' as const,
            label: 'অ্যাক্টিভেশন অনুমোদন',
            badge: pendingActivations.length,
            icon: Lock,
          },
          {
            id: 'withdrawals' as const,
            label: 'উইথড্র প্রদান',
            badge: pendingWithdrawals.length,
            icon: DollarSign,
          },
          {
            id: 'users' as const,
            label: `ইউজার লিস্ট (${allUsers.length})`,
            icon: Users,
          },
          {
            id: 'rates' as const,
            label: 'রেট ও রিসেল মার্জিন',
            icon: Sliders,
          },
          {
            id: 'export' as const,
            label: 'হোলসেল এক্সপোর্ট',
            icon: Download,
          },
          {
            id: 'config' as const,
            label: 'পেমেন্ট নম্বর ও সেটিংস',
            icon: Settings,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab(tab.id);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-slate-950 text-amber-300 shadow-md ring-2 ring-slate-800'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Micro-Job Submissions Review */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সার্চ: ইউজারনেম, ফোন, ইমেইল বা আইডি..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              {/* Type Filter */}
              <select
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">সব ক্যাটাগরি</option>
                <option value="fb_create">📘 Facebook</option>
                <option value="telegram_create">✈️ Telegram</option>
                <option value="whatsapp_create">💬 WhatsApp</option>
                <option value="gmail_create">📧 Gmail</option>
              </select>

              {/* Status Tabs */}
              {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTaskFilter(st)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    taskFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'pending' ? 'অপেক্ষমাণ' : st === 'approved' ? 'অনুমোদিত' : st === 'rejected' ? 'বাতিল' : 'সব'}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">কোনো সাবমিশন খুঁজে পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                ইউজাররা অ্যাপের 'ক্রিয়েট কাজ' সেকশন থেকে ফেসবুক বা টেলিগ্রাম একাউন্ট জমা দিলে এখানে দেখতে পাবেন।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((sub) => {
                const isPending = sub.status === 'pending';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all space-y-3 shadow-xs ${
                      isPending
                        ? 'border-amber-300 ring-2 ring-amber-100/60'
                        : isApproved
                        ? 'border-emerald-200 bg-emerald-50/15'
                        : 'border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">
                            {sub.jobType === 'fb_create' && '📘'}
                            {sub.jobType === 'telegram_create' && '✈️'}
                            {sub.jobType === 'whatsapp_create' && '💬'}
                            {sub.jobType === 'gmail_create' && '📧'}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900">{sub.jobTitle}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {isPending ? 'অপেক্ষমাণ (Pending)' : isApproved ? 'অনুমোদিত (Approved)' : 'বাতিল (Rejected)'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          ওয়ার্কার: <span className="font-bold text-slate-900">{sub.userName}</span> (@{sub.telegramUsername})
                          <span className="text-slate-400 ml-2">• জমা: {sub.submittedAt}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">ইউজার পাবে</span>
                        <span className="text-base font-black text-emerald-700">৳{sub.rewardBDT.toFixed(2)}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          আপনার সম্ভাব্য লাভ: +৳{sub.ownerEstimatedProfitBDT.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Submitted Credentials Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center space-x-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>জমা দেওয়া একাউন্ট ডিটেইলস:</span>
                        </span>
                        <button
                          onClick={() => {
                            let text = `ID/Email/Phone: ${sub.accountIdentifier}`;
                            if (sub.password) text += `\nPassword: ${sub.password}`;
                            if (sub.twoFactorCodeOrOtp) text += `\n2FA: ${sub.twoFactorCodeOrOtp}`;
                            if (sub.additionalNotes) text += `\nNotes: ${sub.additionalNotes}`;
                            copyToClipboard(text, sub.id);
                          }}
                          className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 text-[11px] font-bold bg-white px-2 py-1 rounded-lg border border-slate-200"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === sub.id ? 'কপি হয়েছে!' : 'সব কপি করুন'}</span>
                        </button>
                      </div>

                      <div className="text-xs font-mono bg-white p-3 rounded-xl border border-slate-200 text-slate-900 space-y-1.5 select-all">
                        <div className="flex items-center justify-between">
                          <span>
                            <span className="text-slate-400">লগইন আইডি/নম্বর: </span>
                            <span className="font-bold text-slate-900">{sub.accountIdentifier}</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(sub.accountIdentifier, `${sub.id}_id`)}
                            className="text-[10px] text-slate-400 hover:text-slate-700"
                          >
                            {copiedId === `${sub.id}_id` ? '✓' : 'কপি'}
                          </button>
                        </div>

                        {sub.password && (
                          <div className="flex items-center justify-between">
                            <span>
                              <span className="text-slate-400">পাসওয়ার্ড: </span>
                              <span className="font-bold text-slate-900">{sub.password}</span>
                            </span>
                            <button
                              onClick={() => copyToClipboard(sub.password || '', `${sub.id}_pass`)}
                              className="text-[10px] text-slate-400 hover:text-slate-700"
                            >
                              {copiedId === `${sub.id}_pass` ? '✓' : 'কপি'}
                            </button>
                          </div>
                        )}

                        {sub.twoFactorCodeOrOtp && (
                          <div className="flex items-center justify-between">
                            <span>
                              <span className="text-slate-400">2FA কোড / ওটিপি: </span>
                              <span className="font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                {sub.twoFactorCodeOrOtp}
                              </span>
                            </span>
                            <button
                              onClick={() => copyToClipboard(sub.twoFactorCodeOrOtp || '', `${sub.id}_2fa`)}
                              className="text-[10px] text-slate-400 hover:text-slate-700"
                            >
                              {copiedId === `${sub.id}_2fa` ? '✓' : 'কপি'}
                            </button>
                          </div>
                        )}

                        {sub.additionalNotes && (
                          <div className="text-[11px] text-slate-600 font-sans pt-1 border-t border-slate-100">
                            নোট: {sub.additionalNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for Pending */}
                    {isPending && (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleApproveMicroJob(sub)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>এপ্রুভ করুন ও ৳{sub.rewardBDT} ব্যালেন্স যোগ করুন</span>
                        </button>

                        <button
                          onClick={() =>
                            setRejectModalData({
                              type: 'task',
                              id: sub.id,
                              targetName: `${sub.jobTitle} (${sub.accountIdentifier})`,
                              customReason: 'পাসওয়ার্ড বা লগইন তথ্য সঠিক নয়',
                            })
                          }
                          className="px-4 bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-700 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition-all border border-rose-200 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>বাতিল</span>
                        </button>
                      </div>
                    )}

                    {isRejected && sub.rejectReason && (
                      <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        বাতিলের কারণ: <span className="font-semibold">{sub.rejectReason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Activation Requests Review */}
      {activeTab === 'activations' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সার্চ: ইউজার, প্রেরক নম্বর বা TrxID..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    actFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'pending' ? 'অপেক্ষমাণ' : st === 'approved' ? 'অনুমোদিত' : st === 'rejected' ? 'বাতিল' : 'সব'}
                </button>
              ))}
            </div>
          </div>

          {filteredActivations.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
              <Lock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">কোনো অ্যাক্টিভেশন রিকোয়েস্ট নেই</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                ইউজাররা বিকাশ বা নগদে ৳১০/৳৫০ পাঠিয়ে ট্রানজেকশন আইডি জমা দিলে এখানে দেখতে পাবেন।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivations.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all space-y-3 shadow-xs ${
                      isPending ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-sm text-slate-900">{req.userName}</h4>
                          <span className="text-xs text-slate-500">(@{req.telegramUsername})</span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {req.plan}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1">
                          মেথড: <span className="font-bold text-slate-900">{req.paymentMethod}</span> • প্রেরক নম্বর:{' '}
                          <span className="font-mono font-bold text-slate-900">{req.senderNumber}</span>
                        </p>

                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            TrxID: {req.trxId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(req.trxId, req.id)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 font-bold"
                          >
                            {copiedId === req.id ? '✓ কপি হয়েছে' : 'কপি'}
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-slate-900 block">৳{req.amountBDT}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleApproveActivation(req)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>অনুমোদন করুন (Active Plan)</span>
                        </button>

                        <button
                          onClick={() =>
                            setRejectModalData({
                              type: 'activation',
                              id: req.id,
                              targetName: `${req.userName} (TrxID: ${req.trxId})`,
                              customReason: 'বিকাশ/নগদ স্টেটমেন্টে TrxID খুঁজে পাওয়া যায়নি',
                            })
                          }
                          className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition-all border border-rose-200 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>বাতিল</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Withdrawal / Cashout Management */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সার্চ: ইউজারনেম, বিকাশ নম্বর বা TrxID..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              {(['pending', 'paid', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setWdFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    wdFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'pending' ? 'অপেক্ষমাণ' : st === 'paid' ? 'পেইড' : st === 'rejected' ? 'বাতিল' : 'সব'}
                </button>
              ))}
            </div>
          </div>

          {filteredWithdrawals.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
              <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">কোনো উইথড্র রিকোয়েস্ট নেই</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                সকল পেমেন্ট ক্লিয়ার আছে। ইউজারের ব্যালেন্স ৳৫০ হলেই উইথড্র করতে পারে।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWithdrawals.map((wd) => {
                const isPending = wd.status === 'pending';
                const isPaid = wd.status === 'paid';

                return (
                  <div
                    key={wd.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all space-y-3 shadow-xs ${
                      isPending ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{wd.userName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-bold text-slate-700">{wd.paymentMethod}:</span>
                          <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {wd.accountNumber}
                          </span>
                          <button
                            onClick={() => copyToClipboard(wd.accountNumber, wd.id)}
                            className="text-[11px] text-emerald-700 font-bold hover:underline"
                          >
                            {copiedId === wd.id ? '✓ কপি' : 'কপি'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">সময়: {wd.createdAt}</p>
                        {wd.transactionId && (
                          <p className="text-[11px] font-mono font-bold text-emerald-700 mt-0.5">
                            পেমেন্ট TrxID: {wd.transactionId}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-slate-900 block">৳{wd.amount}</span>
                        <span className="text-[11px] font-bold text-emerald-700 block">
                          পাঠাতে হবে: ৳{wd.netAmountBDT}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {wd.status}
                        </span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedWd(wd);
                            setApprovalTxId(`BK9X${Math.floor(100000 + Math.random() * 900000)}`);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>পেমেন্ট পাঠান (Pay ৳{wd.netAmountBDT})</span>
                        </button>

                        <button
                          onClick={() =>
                            setRejectModalData({
                              type: 'withdrawal',
                              id: wd.id,
                              targetName: `${wd.userName} (৳${wd.amount})`,
                              customReason: 'ভুল অ্যাকাউন্ট নম্বর বা সন্দেহজনক কার্যকলাপ',
                            })
                          }
                          className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition-all border border-rose-200 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>বাতিল ও রিফান্ড</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>ওয়ার্কার ও মেম্বার ম্যানেজমেন্ট</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                সকল ইউজারের বর্তমান ব্যালেন্স, কমপ্লিট কাজ এবং বোনাস দেওয়ার কন্ট্রোল।
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              মোট ইউজার: {allUsers.length}
            </span>
          </div>

          <div className="space-y-3">
            {allUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 font-black flex items-center justify-center text-sm border border-slate-200 shrink-0">
                      {u.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-sm text-slate-900">
                          {u.firstName} {u.lastName}
                        </h4>
                        <span className="text-xs text-slate-500">(@{u.username})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            u.accountTier === 'vip'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : u.accountTier === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {u.accountTier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        TG ID: <span className="font-mono">{u.telegramId}</span> • মেম্বার: {u.memberSince} • কাজ করেছে: {u.completedTasksCount}টি
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">বর্তমান ব্যালেন্স</span>
                      <span className="text-base font-black text-emerald-700">৳{u.currentBalance.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => setCreditUserModal(u)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>বোনাস / ব্যালেন্স</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Rates & Resell Margins */}
      {activeTab === 'rates' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>স্পনসর ক্যাম্পেইন ও রেট মার্জিন (লাইভ প্রফিট ক্যালকুলেটর)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                নতুন স্পনসর টাস্ক যোগ করুন, ইউজার রেট ও আপনার প্রতি কাজে নিট লাভ নিয়ন্ত্রণ করুন।
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic('medium');
                setShowAddCampaignModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন স্পনসর ক্যাম্পেইন যোগ</span>
            </button>
          </div>

          <div className="space-y-3">
            {microJobs.map((job) => {
              const isEditing = editingJobId === job.id;
              const margin = job.ownerResellRateBDT - job.payoutBDT;
              const isPaused = job.status === 'paused';

              return (
                <div
                  key={job.id}
                  className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all space-y-3 shadow-xs ${
                    isPaused ? 'border-slate-200 opacity-60' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <span className="text-2xl shrink-0 mt-0.5">
                        {job.type === 'tg_channel' && '✈️'}
                        {job.type === 'youtube_sub' && '▶️'}
                        {job.type === 'article_code' && '🌐'}
                        {job.type === 'fb_follow' && '📘'}
                        {job.type === 'app_review' && '⭐'}
                        {job.type === 'fb_create' && '📘'}
                        {job.type === 'telegram_create' && '✈️'}
                        {job.type === 'whatsapp_create' && '💬'}
                        {job.type === 'gmail_create' && '📧'}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="font-black text-sm text-slate-900">{job.titleBn}</h4>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                              isPaused ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {job.status}
                          </span>
                          {job.autoVerify && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                              ⚡ অটো-পেমেন্ট
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{job.shortDesc}</p>
                        {job.targetUrl && (
                          <div className="flex items-center space-x-1 text-[11px] text-emerald-700 mt-1 font-mono">
                            <Link className="w-3 h-3 shrink-0" />
                            <a href={job.targetUrl} target="_blank" rel="noreferrer" className="underline truncate max-w-xs hover:text-emerald-900">
                              {job.targetUrl}
                            </a>
                          </div>
                        )}
                        {job.secretCode && (
                          <div className="text-[11px] font-mono font-bold text-amber-700 mt-0.5">
                            ভেরিফিকেশন কোড: <span className="bg-amber-100 px-1.5 py-0.5 rounded">{job.secretCode}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleToggleJob(job.id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${
                          isPaused
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isPaused ? 'চালু করুন' : 'পজ করুন'}
                      </button>

                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingJobId(job.id);
                            setEditPayout(job.payoutBDT);
                            setEditResell(job.ownerResellRateBDT);
                          }}
                          className="px-3 py-1 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>রেট এডিট</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            ইউজারকে দেবেন (User Payout ৳)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={editPayout}
                            onChange={(e) => setEditPayout(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            বায়ারের কাছে সেল (Resell Price ৳)
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={editResell}
                            onChange={(e) => setEditResell(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="text-xs font-black text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        আপনার প্রতি একাউন্টে নীট লাভ: ৳{(editResell - editPayout).toFixed(2)} BDT
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleSaveRate(job.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs shadow-xs"
                        >
                          সেভ করুন
                        </button>
                        <button
                          onClick={() => setEditingJobId(null)}
                          className="px-4 bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">ইউজার পাবে</span>
                        <span className="text-sm font-black text-slate-900">৳{job.payoutBDT.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">বায়ার সেল মূল্য</span>
                        <span className="text-sm font-black text-slate-900">৳{job.ownerResellRateBDT.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 block uppercase font-black">আপনার লাভ / আইডি</span>
                        <span className="text-sm font-black text-emerald-700">+৳{margin.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: Wholesale Bulk Export Tool */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>হোলসেল বায়ার এক্সপোর্ট টুল (Wholesale Export)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                অনুমোদিত একাউন্টগুলো টেলিগ্রাম বা হোয়াটসঅ্যাপ বায়ারকে এক ক্লিকে লিস্ট করে পাঠানোর জন্য।
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={exportJobType}
                onChange={(e) => setExportJobType(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">সব একাউন্ট</option>
                <option value="fb_create">📘 Facebook Accounts</option>
                <option value="telegram_create">✈️ Telegram Accounts</option>
                <option value="whatsapp_create">💬 WhatsApp Accounts</option>
                <option value="gmail_create">📧 Gmail Accounts</option>
              </select>

              <button
                onClick={() => {
                  triggerHaptic('success');
                  navigator.clipboard.writeText(exportText);
                  setCopiedExport(true);
                  setTimeout(() => setCopiedExport(false), 2000);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedExport ? '✓ কপি হয়েছে!' : 'সব টেক্সট কপি'}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              readOnly
              rows={10}
              value={exportText}
              className="w-full p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-2xl border border-slate-800 leading-relaxed focus:outline-none select-all"
            />
          </div>
        </div>
      )}

      {/* TAB 7: Payment Numbers & Settings */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-1.5">
              <Settings className="w-4 h-4 text-emerald-600" />
              <span>পেমেন্ট নম্বর ও সিস্টেম সেটিংস</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ইউজাররা মেম্বারশিপ ফি পাঠানোর জন্য এই নম্বরগুলো তাদের স্ক্রিনে দেখতে পাবে।
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                বিকাশ পার্সোনাল নম্বর (bKash Personal)
              </label>
              <input
                type="text"
                value={bkashNum}
                onChange={(e) => setBkashNum(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                নগদ পার্সোনাল নম্বর (Nagad Personal)
              </label>
              <input
                type="text"
                value={nagadNum}
                onChange={(e) => setNagadNum(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                রকেট পার্সোনাল নম্বর (Rocket Personal)
              </label>
              <input
                type="text"
                value={rocketNum}
                onChange={(e) => setRocketNum(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  সর্বনিম্ন টাকা উত্তোলন (Minimum Cashout ৳)
                </label>
                <input
                  type="number"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  এডমিন মাস্টার পিন (Master PIN - Default: 8800)
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer mt-2"
          >
            পরিবর্তনগুলো সংরক্ষণ করুন (Save Settings)
          </button>
        </form>
      )}

      {/* REJECTION MODAL */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-black text-sm text-rose-700 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>বাতিলের কারণ নিশ্চিত করুন</span>
              </h4>
              <button
                onClick={() => setRejectModalData(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              আপনি <span className="font-bold text-slate-900">{rejectModalData.targetName}</span> বাতিল করছেন।
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                বাতিলের কারণ সিলেক্ট করুন বা লিখুন:
              </label>
              <div className="space-y-1.5 mb-2">
                {[
                  'পাসওয়ার্ড বা লগইন কোড সঠিক নয়',
                  '২-স্টেপ ভেরিফিকেশন (2FA) কাজ করছে না',
                  'নাম্বার ইতোমধ্যে একাউন্টে ব্যবহৃত',
                  'বিকাশ/নগদ স্টেটমেন্টে TrxID খুঁজে পাওয়া যায়নি',
                  'ভুয়া সাবমিশন / ফেক স্ক্রিনশট',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() =>
                      setRejectModalData({ ...rejectModalData, customReason: reason })
                    }
                    className={`w-full text-left p-2 rounded-xl text-[11px] font-semibold border transition-all ${
                      rejectModalData.customReason === reason
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={rejectModalData.customReason}
                onChange={(e) =>
                  setRejectModalData({ ...rejectModalData, customReason: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleConfirmReject}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                বাতিল নিশ্চিত করুন
              </button>
              <button
                onClick={() => setRejectModalData(null)}
                className="px-4 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAWAL PAYMENT MODAL */}
      {selectedWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-black text-sm text-slate-900 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>ক্যাশআউট পেমেন্ট সম্পন্ন করুন</span>
              </h4>
              <button onClick={() => setSelectedWd(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">ইউজার:</span>
                <span className="font-bold text-slate-900">{selectedWd.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পেমেন্ট মেথড:</span>
                <span className="font-bold text-slate-900">{selectedWd.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">অ্যাকাউন্ট নম্বর:</span>
                <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-900">
                  <span>{selectedWd.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(selectedWd.accountNumber, 'modal_acc')}
                    className="text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                  >
                    {copiedId === 'modal_acc' ? '✓' : 'কপি'}
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-emerald-700 pt-1 border-t border-slate-200">
                <span>পাঠাতে হবে (Net):</span>
                <span>৳{selectedWd.netAmountBDT} BDT</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                আপনার বিকাশ/নগদ পেমেন্ট TrxID
              </label>
              <input
                type="text"
                value={approvalTxId}
                onChange={(e) => setApprovalTxId(e.target.value)}
                placeholder="e.g. BK9X29104"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleApproveWd}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                পেইড মার্ক করুন (Confirm Paid)
              </button>
              <button
                onClick={() => setSelectedWd(null)}
                className="px-4 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER BONUS CREDIT MODAL */}
      {creditUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-black text-sm text-slate-900 flex items-center space-x-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>ব্যালেন্স বা বোনাস যোগ করুন</span>
              </h4>
              <button onClick={() => setCreditUserModal(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              ইউজার: <span className="font-bold text-slate-900">{creditUserModal.firstName} {creditUserModal.lastName}</span> (@{creditUserModal.username})
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                টাকার পরিমাণ (৳ BDT)
              </label>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {['5', '10', '20', '50'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCreditAmount(val)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      creditAmount === val
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ৳{val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                নোট / কারণ (User ledger-এ দেখাবে)
              </label>
              <input
                type="text"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleCreditUser}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                ব্যালেন্স যোগ করুন
              </button>
              <button
                onClick={() => setCreditUserModal(null)}
                className="px-4 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW SPONSORED CAMPAIGN MODAL */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">নতুন স্পনসর ক্যাম্পেইন যোগ করুন</h4>
                  <p className="text-[11px] text-slate-500">ক্লায়েন্টের কাজ যুক্ত করুন ও নিট লাভ সেট করুন</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCampaignModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5">
              {/* Type Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  কাজের ধরন (Task Type)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'tg_channel' as const, label: 'টেলিগ্রাম চ্যানেল', icon: '✈️' },
                    { id: 'youtube_sub' as const, label: 'ইউটিউব সাবস্ক্রাইব', icon: '▶️' },
                    { id: 'article_code' as const, label: 'ব্লগ ভিজিট (কোড)', icon: '🌐' },
                    { id: 'fb_follow' as const, label: 'ফেসবুক পেজ লাইক', icon: '📘' },
                    { id: 'app_review' as const, label: 'প্লে-স্টোর অ্যাপ', icon: '⭐' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewCampaignType(t.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center space-x-1.5 ${
                        newCampaignType === t.id
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-1 ring-emerald-400'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  টাস্কের শিরোনাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন"
                  value={newCampaignTitleBn}
                  onChange={(e) => setNewCampaignTitleBn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Target Link */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  টার্গেট লিংক / চ্যানেল URL (যেখানে ইউজার যাবে)
                </label>
                <input
                  type="url"
                  placeholder="https://t.me/... বা https://youtube.com/..."
                  value={newCampaignUrl}
                  onChange={(e) => setNewCampaignUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Pricing & Profit Grid */}
              <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    ইউজারকে দেবেন (৳ Payout)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newCampaignPayout}
                    onChange={(e) => setNewCampaignPayout(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    ক্লায়েন্ট রেট (৳ Advertiser Price)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newCampaignClientRate}
                    onChange={(e) => setNewCampaignClientRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900"
                  />
                </div>

                <div className="col-span-2 text-xs font-extrabold text-emerald-800 flex items-center justify-between border-t border-emerald-200/60 pt-2">
                  <span>প্রতি টাস্কে আপনার লাভ:</span>
                  <span className="text-sm">
                    +৳{(newCampaignClientRate - newCampaignPayout).toFixed(2)} BDT
                  </span>
                </div>
              </div>

              {/* Secret Code (for article visits / instant auto-payment) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  সিক্রেট ভেরিফিকেশন কোড (ঐচ্ছিক - ইনস্ট্যান্ট অটো-পেমেন্ট)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 849201 (আর্টিকেল ভিজিট হলে এই কোডটি দিন)"
                  value={newCampaignSecretCode}
                  onChange={(e) => setNewCampaignSecretCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 এখানে কোনো কোড দিলে ব্যবহারকারী সঠিক কোড সাবমিট করার সাথে সাথে সিস্টেম অটোমেটিকভাবে কোনো অপেক্ষা ছাড়াই টাকা যোগ করে দেবে!
                </p>
              </div>

              {/* Short Desc & Limit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    দৈনিক লিমিট / ইউজার
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCampaignLimit}
                    onChange={(e) => setNewCampaignLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    সংক্ষিপ্ত বর্ণনা
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. চ্যানেল সাবস্ক্রাইব করুন"
                    value={newCampaignShortDesc}
                    onChange={(e) => setNewCampaignShortDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md shadow-emerald-600/25 active:scale-98 transition-all"
                >
                  ক্যাম্পেইন লাইভ করুন / Publish Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition-all"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
