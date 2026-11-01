import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  WalletData,
  Offer,
  SocialTask,
  Transaction,
  WithdrawalRequest,
  ActivationRequest,
  DailyCheckInState,
  LuckySpinState,
  AdminPaymentConfig,
} from '../types';

// Initialize Firebase App and Firestore with specific database ID
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);

// Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn(`[Firestore Error - ${operationType} on ${path}]:`, JSON.stringify(errInfo));
  return errInfo;
}

// Test Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline. Local cache/fallback will be used.');
    }
    return false;
  }
}

/**
 * FirestoreService
 * Centralized service for reading, writing, and synchronizing EarnBox data via Firestore
 */
export class FirestoreService {
  /* ================= User Profiles ================= */

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.id}`;
    try {
      await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static subscribeUserProfile(userId: string, callback: (profile: UserProfile | null) => void): Unsubscribe {
    const path = `users/${userId}`;
    return onSnapshot(
      doc(db, 'users', userId),
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as UserProfile);
        } else {
          callback(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  /* ================= Wallet Data ================= */

  static async getWallet(userId: string): Promise<WalletData | null> {
    const path = `wallets/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'wallets', userId));
      if (snap.exists()) {
        return snap.data() as WalletData;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  static async saveWallet(userId: string, wallet: WalletData): Promise<void> {
    const path = `wallets/${userId}`;
    try {
      await setDoc(doc(db, 'wallets', userId), wallet, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async updateWallet(userId: string, updates: Partial<WalletData>): Promise<void> {
    const path = `wallets/${userId}`;
    try {
      await updateDoc(doc(db, 'wallets', userId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static subscribeWallet(userId: string, callback: (wallet: WalletData | null) => void): Unsubscribe {
    const path = `wallets/${userId}`;
    return onSnapshot(
      doc(db, 'wallets', userId),
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as WalletData);
        } else {
          callback(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  /* ================= Offers & Statuses ================= */

  static async getOffers(): Promise<Offer[]> {
    const path = 'offers';
    try {
      const snap = await getDocs(collection(db, 'offers'));
      const offers: Offer[] = [];
      snap.forEach((d) => offers.push(d.data() as Offer));
      return offers;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  static async saveOffer(offer: Offer): Promise<void> {
    const path = `offers/${offer.id}`;
    try {
      await setDoc(doc(db, 'offers', offer.id), offer, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async updateOfferStatus(offerId: string, status: Offer['status']): Promise<void> {
    const path = `offers/${offerId}`;
    try {
      await updateDoc(doc(db, 'offers', offerId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static subscribeOffers(callback: (offers: Offer[]) => void): Unsubscribe {
    const path = 'offers';
    return onSnapshot(
      collection(db, 'offers'),
      (snap) => {
        const list: Offer[] = [];
        snap.forEach((d) => list.push(d.data() as Offer));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  /* ================= Social & Sponsor Tasks ================= */

  static async getSocialTasks(): Promise<SocialTask[]> {
    const path = 'socialTasks';
    try {
      const snap = await getDocs(collection(db, 'socialTasks'));
      const list: SocialTask[] = [];
      snap.forEach((d) => list.push(d.data() as SocialTask));
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  static async saveSocialTask(task: SocialTask): Promise<void> {
    const path = `socialTasks/${task.id}`;
    try {
      await setDoc(doc(db, 'socialTasks', task.id), task, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /* ================= ৳10 Account Activation Requests ================= */

  static async getActivationRequests(): Promise<ActivationRequest[]> {
    const path = 'activationRequests';
    try {
      const snap = await getDocs(collection(db, 'activationRequests'));
      const list: ActivationRequest[] = [];
      snap.forEach((d) => list.push(d.data() as ActivationRequest));
      return list.sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  static async addActivationRequest(request: ActivationRequest): Promise<void> {
    const path = `activationRequests/${request.id}`;
    try {
      await setDoc(doc(db, 'activationRequests', request.id), request);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async updateActivationRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    const path = `activationRequests/${requestId}`;
    try {
      const updates: any = {
        status,
        reviewedAt: new Date().toISOString(),
      };
      if (reason) updates.rejectReason = reason;
      await updateDoc(doc(db, 'activationRequests', requestId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static subscribeActivationRequests(callback: (requests: ActivationRequest[]) => void): Unsubscribe {
    const path = 'activationRequests';
    return onSnapshot(
      collection(db, 'activationRequests'),
      (snap) => {
        const list: ActivationRequest[] = [];
        snap.forEach((d) => list.push(d.data() as ActivationRequest));
        callback(list.sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  /* ================= Transactions ================= */

  static async getTransactions(userId: string): Promise<Transaction[]> {
    const path = 'transactions';
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: Transaction[] = [];
      snap.forEach((d) => list.push(d.data() as Transaction));
      return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  static async addTransaction(transaction: Transaction): Promise<void> {
    const path = `transactions/${transaction.id}`;
    try {
      await setDoc(doc(db, 'transactions', transaction.id), transaction);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static subscribeTransactions(userId: string, callback: (txs: Transaction[]) => void): Unsubscribe {
    const path = 'transactions';
    const q = query(collection(db, 'transactions'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snap) => {
        const list: Transaction[] = [];
        snap.forEach((d) => list.push(d.data() as Transaction));
        callback(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  /* ================= Withdrawals ================= */

  static async getWithdrawals(userId?: string): Promise<WithdrawalRequest[]> {
    const path = 'withdrawals';
    try {
      const snap = await getDocs(collection(db, 'withdrawals'));
      const list: WithdrawalRequest[] = [];
      snap.forEach((d) => {
        const data = d.data() as WithdrawalRequest;
        if (!userId || data.userId === userId) {
          list.push(data);
        }
      });
      return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  static async addWithdrawal(withdrawal: WithdrawalRequest): Promise<void> {
    const path = `withdrawals/${withdrawal.id}`;
    try {
      await setDoc(doc(db, 'withdrawals', withdrawal.id), withdrawal);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async updateWithdrawalStatus(
    withdrawalId: string,
    status: WithdrawalRequest['status'],
    txId?: string,
    reason?: string
  ): Promise<void> {
    const path = `withdrawals/${withdrawalId}`;
    try {
      const updates: any = {
        status,
        processedAt: new Date().toISOString(),
      };
      if (txId) updates.transactionId = txId;
      if (reason) updates.rejectReason = reason;

      await updateDoc(doc(db, 'withdrawals', withdrawalId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static subscribeWithdrawals(callback: (withdrawals: WithdrawalRequest[]) => void): Unsubscribe {
    const path = 'withdrawals';
    return onSnapshot(
      collection(db, 'withdrawals'),
      (snap) => {
        const list: WithdrawalRequest[] = [];
        snap.forEach((d) => list.push(d.data() as WithdrawalRequest));
        callback(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  /* ================= Daily Check-In ================= */

  static async getDailyCheckIn(userId: string): Promise<DailyCheckInState | null> {
    const path = `users/${userId}/dailyCheckIn/current`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'dailyCheckIn', 'current'));
      if (snap.exists()) {
        return snap.data() as DailyCheckInState;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  static async saveDailyCheckIn(userId: string, state: DailyCheckInState): Promise<void> {
    const path = `users/${userId}/dailyCheckIn/current`;
    try {
      await setDoc(doc(db, 'users', userId, 'dailyCheckIn', 'current'), state);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /* ================= Platform Admin Config ================= */

  static async getAdminConfig(): Promise<AdminPaymentConfig | null> {
    const path = 'config/paymentConfig';
    try {
      const snap = await getDoc(doc(db, 'config', 'paymentConfig'));
      if (snap.exists()) {
        return snap.data() as AdminPaymentConfig;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  static async saveAdminConfig(config: AdminPaymentConfig): Promise<void> {
    const path = 'config/paymentConfig';
    try {
      await setDoc(doc(db, 'config', 'paymentConfig'), config, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}
