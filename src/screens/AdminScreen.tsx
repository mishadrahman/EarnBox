import React, { useState } from 'react';
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
} from '../types';
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowLeft,
  Check,
  Zap,
  Settings,
  Shield,
  Send,
  Sparkles,
  Phone,
  Lock,
  ExternalLink,
  TrendingUp,
  Copy,
  Flame,
  FileCheck,
  Edit2,
  AlertCircle,
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
  offers,
  socialTasks,
  adminConfig,
  onExitAdmin,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'revenue' | 'micro_jobs' | 'activations' | 'withdrawals' | 'job_rates' | 'config'
  >('micro_jobs');

  // Withdrawal action state
  const [selectedWd, setSelectedWd] = useState<WithdrawalRequest | null>(null);
  const [approvalTxId, setApprovalTxId] = useState('');
  const [rejectReason, setRejectReason] = useState('Invalid phone number or suspicious proxy flag');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Activation action state
  const [selectedAct, setSelectedAct] = useState<ActivationRequest | null>(null);

  // Config state
  const [bkashNum, setBkashNum] = useState(adminConfig.bkashPersonalNumber);
  const [nagadNum, setNagadNum] = useState(adminConfig.nagadPersonalNumber);
  const [rocketNum, setRocketNum] = useState(adminConfig.rocketPersonalNumber);
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('earnbox_admin_pin') || '8800');

  // Micro jobs data
  const microJobs = DataService.getMicroJobs();
  const microJobSubmissions = DataService.getMicroJobSubmissions();
  const pendingMicroJobs = microJobSubmissions.filter((s) => s.status === 'pending');

  // Job rate edit states
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editPayout, setEditPayout] = useState<number>(0);
  const [editResell, setEditResell] = useState<number>(0);

  const handleApproveWd = () => {
    if (!selectedWd) return;
    triggerHaptic('success');
    const tx = approvalTxId.trim() || `BK9X${Math.floor(100000 + Math.random() * 900000)}`;
    DataService.updateWithdrawalStatus(selectedWd.id, 'paid', tx);
    setActionNotice(`Approved cashout ${selectedWd.id} for ৳${selectedWd.amount} (TxID: ${tx})`);
    setSelectedWd(null);
    setApprovalTxId('');
    onRefreshData();
  };

  const handleRejectWd = () => {
    if (!selectedWd) return;
    triggerHaptic('warning');
    DataService.updateWithdrawalStatus(selectedWd.id, 'rejected', undefined, rejectReason);
    setActionNotice(`Rejected cashout ${selectedWd.id} (Refunded to user balance).`);
    setSelectedWd(null);
    onRefreshData();
  };

  const handleApproveActivation = (req: ActivationRequest) => {
    triggerHaptic('success');
    DataService.approveActivationRequest(req.id);
    setActionNotice(`Approved ৳${req.amountBDT} activation for ${req.userName} (@${req.telegramUsername}). Account is now Active!`);
    onRefreshData();
  };

  const handleRejectActivation = (req: ActivationRequest) => {
    triggerHaptic('warning');
    DataService.rejectActivationRequest(req.id, 'TrxID could not be verified on bKash/Nagad statement.');
    setActionNotice(`Rejected activation ${req.id}.`);
    onRefreshData();
  };

  const handleApproveMicroJob = (sub: MicroJobSubmission) => {
    triggerHaptic('success');
    DataService.approveMicroJobSubmission(sub.id);
    setActionNotice(`Approved ${sub.jobTitle} from ${sub.userName}! ৳${sub.rewardBDT} credited to user wallet.`);
    onRefreshData();
  };

  const handleRejectMicroJob = (sub: MicroJobSubmission) => {
    const reason = prompt('বাতিলের কারণ লিখুন (Reason for rejection):', 'পাসওয়ার্ড বা লগইন কোড ভুল') || 'তথ্য সঠিক নয়';
    triggerHaptic('warning');
    DataService.rejectMicroJobSubmission(sub.id, reason);
    setActionNotice(`Rejected submission ${sub.id}. Reason: ${reason}`);
    onRefreshData();
  };

  const handleCopyCredentials = (sub: MicroJobSubmission) => {
    triggerHaptic('light');
    let text = `ID/Email/Phone: ${sub.accountIdentifier}`;
    if (sub.password) text += `\nPassword: ${sub.password}`;
    if (sub.twoFactorCodeOrOtp) text += `\n2FA/OTP: ${sub.twoFactorCodeOrOtp}`;
    if (sub.additionalNotes) text += `\nNotes: ${sub.additionalNotes}`;
    navigator.clipboard.writeText(text);
    setActionNotice(`Copied credentials for ${sub.accountIdentifier} to clipboard!`);
  };

  const handleSaveRate = (jobId: string) => {
    triggerHaptic('success');
    DataService.updateMicroJobRate(jobId, editPayout, editResell);
    setEditingJobId(null);
    setActionNotice('Job rates and resell margins updated!');
    onRefreshData();
  };

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    DataService.updateAdminPaymentConfig({
      bkashPersonalNumber: bkashNum,
      nagadPersonalNumber: nagadNum,
      rocketPersonalNumber: rocketNum,
    });
    if (adminPin.trim().length >= 4) {
      localStorage.setItem('earnbox_admin_pin', adminPin.trim());
    }
    setActionNotice('Admin payment numbers & Master PIN updated successfully!');
    onRefreshData();
  };

  // Admin PIN Auth Gate
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
      setPinError('Incorrect Admin PIN. Please try again.');
    }
  };

  const handleLogout = () => {
    triggerHaptic('light');
    sessionStorage.removeItem('earnbox_admin_auth');
    setIsAuthenticated(false);
    setPinInput('');
  };

  // If not authenticated, render dedicated PIN Security Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-slate-900">EarnBox Owner Portal</h3>
            <p className="text-xs text-slate-500 mt-1">
              Protected /admin route. Enter Master PIN to access management console.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block text-left mb-1.5">
                Admin Master PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center font-mono font-extrabold text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            {pinError && (
              <div className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-fade-in">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-amber-300 font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-xl border border-slate-100">
              Default Master PIN: <span className="font-mono font-bold text-slate-800">8800</span>
            </div>

            <button
              onClick={onExitAdmin}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1 mx-auto py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to User App (/)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Admin Top Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900 text-white rounded-3xl p-4 shadow-md">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-xs shrink-0">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm tracking-tight text-white flex items-center space-x-1.5 truncate">
              <span>EarnBox Owner Console</span>
              <span className="bg-amber-400/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                /admin
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 truncate">Bangladesh Micro-Task Operations & Revenue Desk</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all"
            title="Log Out of Admin"
          >
            Lock
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              onExitAdmin();
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>User View (/)</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between animate-fade-in">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          {
            id: 'micro_jobs' as const,
            label: `Account Tasks (${pendingMicroJobs.length})`,
            badge: pendingMicroJobs.length > 0,
          },
          {
            id: 'activations' as const,
            label: `Activations (${activations.filter((a) => a.status === 'pending').length})`,
          },
          {
            id: 'withdrawals' as const,
            label: `Cashouts (${withdrawals.filter((w) => w.status === 'pending').length})`,
          },
          { id: 'job_rates' as const, label: 'Rates & Resell Margins' },
          { id: 'revenue' as const, label: 'Owner Profit ৳' },
          { id: 'config' as const, label: 'Settings & Numbers' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab(tab.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all relative ${
              activeTab === tab.id
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Account Creation Submissions (FB, Telegram, WhatsApp, Gmail) */}
      {activeTab === 'micro_jobs' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Creation Submissions (FB / TG / WA)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ইউজারের তৈরি করা ফেসবুক, টেলিগ্রাম ও হোয়াটসঅ্যাপ একাউন্ট ভেরিফাই করুন।
              </p>
            </div>
            <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {pendingMicroJobs.length} Pending
            </span>
          </div>

          {microJobSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">কোনো সাবমিশন জমা নেই</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                ইউজাররা অ্যাপের 'ক্রিয়েট কাজ' সেকশন থেকে ফেসবুক বা টেলিগ্রাম একাউন্ট জমা দিলে এখানে লিস্ট আকারে প্রদর্শিত হবে।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {microJobSubmissions.map((sub) => {
                const isPending = sub.status === 'pending';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-2xl p-4 border transition-all space-y-3 ${
                      isPending
                        ? 'border-amber-300 shadow-sm'
                        : isApproved
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-base">
                            {sub.jobType === 'fb_create' && '📘'}
                            {sub.jobType === 'telegram_create' && '✈️'}
                            {sub.jobType === 'whatsapp_create' && '💬'}
                            {sub.jobType === 'gmail_create' && '📧'}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900">{sub.jobTitle}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isPending ? 'Pending Review' : isApproved ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Worker: <span className="font-bold text-slate-800">{sub.userName}</span> (@{sub.telegramUsername}) • {sub.submittedAt}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block uppercase">Payout</span>
                        <span className="text-sm font-black text-emerald-700">৳{sub.rewardBDT.toFixed(2)}</span>
                        <span className="text-[10px] text-emerald-600 block">
                          Est. Profit: +৳{sub.ownerEstimatedProfitBDT.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Submitted Credentials Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Submitted Account Details:</span>
                        <button
                          onClick={() => handleCopyCredentials(sub)}
                          className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 text-[11px] font-bold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy All</span>
                        </button>
                      </div>

                      <div className="text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 space-y-1 select-all">
                        <div>
                          <span className="text-slate-400">ID/Email/Phone: </span>
                          <span className="font-bold">{sub.accountIdentifier}</span>
                        </div>
                        {sub.password && (
                          <div>
                            <span className="text-slate-400">Password: </span>
                            <span className="font-bold text-slate-800">{sub.password}</span>
                          </div>
                        )}
                        {sub.twoFactorCodeOrOtp && (
                          <div>
                            <span className="text-slate-400">2FA / Code: </span>
                            <span className="font-extrabold text-amber-600">{sub.twoFactorCodeOrOtp}</span>
                          </div>
                        )}
                        {sub.additionalNotes && (
                          <div className="text-[11px] text-slate-600 font-sans mt-1">
                            Note: {sub.additionalNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isPending && (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleApproveMicroJob(sub)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Credit ৳{sub.rewardBDT}</span>
                        </button>

                        <button
                          onClick={() => handleRejectMicroJob(sub)}
                          className="px-4 bg-red-100 hover:bg-red-200 active:scale-98 text-red-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {isRejected && sub.rejectReason && (
                      <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg">
                        Reject Reason: {sub.rejectReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Activation Requests (৳10 / ৳50 / ৳100) */}
      {activeTab === 'activations' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Account Activations & VIP Upgrades</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                বিকাশ/নগদ/রকেটে আসা ট্রানজেকশন আইডি মিলিয়ে একাউন্ট সক্রিয় করুন।
              </p>
            </div>
          </div>

          {activations.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-2">
              <Lock className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No activation requests</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Users will appear here when they send ৳10/৳50 and submit their bKash TrxID.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activations.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-sm text-slate-900">{req.userName}</span>
                        <span className="text-xs text-slate-500">(@{req.telegramUsername})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.paymentMethod} • Sender: <span className="font-bold">{req.senderNumber}</span>
                      </p>
                      <p className="text-xs font-mono font-bold text-emerald-700 mt-1">
                        TrxID: {req.trxId}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">৳{req.amountBDT}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleApproveActivation(req)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Activation</span>
                      </button>

                      <button
                        onClick={() => handleRejectActivation(req)}
                        className="px-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Cashouts / Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Withdrawal Requests (bKash / Nagad / Rocket)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ইউজারদের উইথড্র রিকোয়েস্ট যাচাই করে বিকাশ/নগদে সেন্ড মানি করুন।
              </p>
            </div>
          </div>

          {withdrawals.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-2">
              <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No cashout requests</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                All withdrawals are cleared. Minimum cashout is ৳50.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((wd) => (
                <div
                  key={wd.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-black text-sm text-slate-900">{wd.userName}</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {wd.paymentMethod}: <span className="font-mono font-bold text-slate-900">{wd.accountNumber}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{wd.createdAt}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700 block">৳{wd.amount}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Net: ৳{wd.netAmountBDT} (Fee: ৳{wd.processingFeeBDT})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                          wd.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : wd.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {wd.status}
                      </span>
                    </div>
                  </div>

                  {wd.status === 'pending' && (
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedWd(wd)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Process / Pay</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Withdrawal Processing Modal */}
          {selectedWd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">Process Cashout</h4>
                  <button onClick={() => setSelectedWd(null)} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div>User: <span className="font-bold">{selectedWd.userName}</span></div>
                  <div>Method: <span className="font-bold">{selectedWd.paymentMethod}</span></div>
                  <div>Account: <span className="font-mono font-bold">{selectedWd.accountNumber}</span></div>
                  <div>Pay Amount: <span className="font-bold text-emerald-700">৳{selectedWd.netAmountBDT}</span></div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Your {selectedWd.paymentMethod} TrxID
                  </label>
                  <input
                    type="text"
                    value={approvalTxId}
                    onChange={(e) => setApprovalTxId(e.target.value)}
                    placeholder="e.g. BK9X29104"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={handleApproveWd}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={handleRejectWd}
                    className="px-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2.5 rounded-xl text-xs transition-all"
                  >
                    Reject & Refund
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Job Rates & Resell Margins */}
      {activeTab === 'job_rates' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Micro-Task Payout Rates & Your Profit Margins</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              এখানে আপনি নির্ধারণ করবেন ইউজারকে কত টাকা দিবেন এবং আপনি অন্য বায়ারের কাছে একাউন্ট কত টাকায় সেল করবেন।
            </p>
          </div>

          <div className="space-y-3">
            {microJobs.map((job) => {
              const isEditing = editingJobId === job.id;
              const margin = job.ownerResellRateBDT - job.payoutBDT;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {job.type === 'fb_create' && '📘'}
                        {job.type === 'telegram_create' && '✈️'}
                        {job.type === 'whatsapp_create' && '💬'}
                        {job.type === 'gmail_create' && '📧'}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">{job.titleBn}</h4>
                        <p className="text-[11px] text-slate-500">{job.title}</p>
                      </div>
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingJobId(job.id);
                          setEditPayout(job.payoutBDT);
                          setEditResell(job.ownerResellRateBDT);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                            User Payout (৳)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={editPayout}
                            onChange={(e) => setEditPayout(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                            Owner Resell Value (৳)
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={editResell}
                            onChange={(e) => setEditResell(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-emerald-800">
                        Net Owner Margin: ৳{(editResell - editPayout).toFixed(2)} / account
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleSaveRate(job.id)}
                          className="flex-1 bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-xs"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingJobId(null)}
                          className="px-3 bg-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">User Payout</span>
                        <span className="text-xs font-extrabold text-slate-900">৳{job.payoutBDT}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Resell Value</span>
                        <span className="text-xs font-extrabold text-slate-900">৳{job.ownerResellRateBDT}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-600 block uppercase font-bold">Your Profit</span>
                        <span className="text-xs font-extrabold text-emerald-700">+৳{margin.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Revenue & Profit Overview */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-500/30">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full">
              Platform Total Profit
            </span>
            <div className="flex items-baseline space-x-1.5 my-2">
              <span className="text-2xl font-light text-emerald-400">৳</span>
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {stats.totalOwnerProfitBDT.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-300 font-bold ml-1">BDT</span>
            </div>
            <p className="text-xs text-emerald-100/80">
              মোট মুনাফা = ৳১০/৳৫০ মেম্বারশিপ অ্যাক্টিভেশন ফি + একাউন্ট রিসেল মার্জিন মুনাফা।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
              <div className="flex items-center space-x-1.5 text-emerald-600 text-xs font-bold mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Activation Fees</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                ৳{stats.totalActivationRevenueBDT.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                From ৳10 & ৳50 VIP member signups
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
              <div className="flex items-center space-x-1.5 text-amber-600 text-xs font-bold mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Account Resell Value</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                ৳{stats.totalMicroJobResellValueBDT.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {stats.approvedMicroJobsCount} accounts verified
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Settings & Payment Numbers */}
      {activeTab === 'config' && (
        <form onSubmit={handleSavePaymentConfig} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">
            বিকাশ, নগদ ও রকেট ব্যক্তিগত নম্বর পরিবর্তন
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                bKash Personal Number (বিকাশ পার্সোনাল)
              </label>
              <input
                type="text"
                value={bkashNum}
                onChange={(e) => setBkashNum(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Nagad Personal Number (নগদ পার্সোনাল)
              </label>
              <input
                type="text"
                value={nagadNum}
                onChange={(e) => setNagadNum(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Rocket Personal Number (রকেট পার্সোনাল)
              </label>
              <input
                type="text"
                value={rocketNum}
                onChange={(e) => setRocketNum(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Admin Master PIN (Default: 8800)
              </label>
              <input
                type="password"
                maxLength={8}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-98"
          >
            Save All Changes
          </button>
        </form>
      )}
    </div>
  );
};
