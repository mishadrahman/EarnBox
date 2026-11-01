// Telegram Web App helper and haptics

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export function getTelegramWebApp() {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function isInsideTelegram(): boolean {
  const tg = getTelegramWebApp();
  return Boolean(tg && tg.initData && tg.initData.length > 0);
}

export function initTelegramApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (tg.enableClosingConfirmation) {
        tg.enableClosingConfirmation();
      }
    } catch (e) {
      console.warn('Telegram WebApp init notice:', e);
    }
  }
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'light') {
  const tg = getTelegramWebApp();
  if (!tg || !tg.HapticFeedback) return;

  try {
    if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    } else if (type === 'success' || type === 'warning' || type === 'error') {
      tg.HapticFeedback.notificationOccurred(type);
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch (e) {
    // Graceful fallback for non-supported browsers
  }
}

export function getTelegramUserData(): TelegramUser {
  const tg = getTelegramWebApp();
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    return tg.initDataUnsafe.user;
  }

  // Realistic default Bangladeshi Telegram user for browser development
  return {
    id: 789140231,
    first_name: 'Tanvir',
    last_name: 'Hasan',
    username: 'tanvir_earn',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    language_code: 'bn',
  };
}

export function shareReferralLink(referralCode: string, botUsername: string = 'EarnBoxBot') {
  triggerHaptic('medium');
  const shareUrl = `https://t.me/${botUsername}?start=ref_${referralCode}`;
  const message = `🔥 Join EarnBox — Bangladesh's premier Telegram Earning Mini App! Complete quick surveys and mobile tasks to earn ৳ BDT directly to bKash & Nagad. Sign up with my link for a ৳10 joining bonus!`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;

  const tg = getTelegramWebApp();
  if (tg && tg.openTelegramLink) {
    tg.openTelegramLink(telegramShareUrl);
  } else {
    window.open(telegramShareUrl, '_blank');
  }
}
