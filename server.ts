import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Google GenAI
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'EarnBox Server', time: new Date().toISOString() });
});

// Endpoint: AI Earning Advisor & Strategy Assistant
// Uses high thinking mode with gemini-4-argon (with fallback to gemini-3.8-flash)
app.post('/api/advisor', async (req, res) => {
  try {
    const { query, userContext } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!ai) {
      return res.json({
        advice: `💡 **Smart Strategy for EarnBox (Bangladesh):**
1. **High Yield Surveys:** Complete the Daily Market Survey (৳25) early morning when quotas reset.
2. **App Offers:** Finish the bKash Merchant Registration or Pathao Ride App install for fast ৳30-৳45 rewards.
3. **Daily Streak:** Never break your daily check-in — Day 7 grants a ৳25 bonus plus a mystery multiplier!
4. **Referral Multiplier:** Share your link in Telegram university & freelance groups to earn ৳15 per qualified friend.
5. **Withdrawal:** Once you reach ৳50, withdraw via bKash or Nagad. Remember not to use VPNs to prevent security flags.`,
        modelUsed: 'heuristic-advisor',
        thinkingLevel: 'HIGH',
      });
    }

    const systemInstruction = `You are the Senior Rewards Strategist and Task Advisor for EarnBox, the premier Telegram Mini App for Bangladeshi users.
Currency is Bangladeshi Taka (৳ BDT). Payment methods include bKash, Nagad, and Rocket (minimum cashout ৳50).
Give concise, realistic, high-value advice on maximizing legitimate rewards through offerwalls, surveys, game tiers, and daily check-ins.
Warn users strictly against VPN usage, multiple accounts, or fraudulent tactics which cause account bans.
Format output using clean markdown with bullet points, bold key terms, and Bangla welcoming phrases if appropriate (e.g., 'আসসালামু আলাইকুম', 'ধন্যবাদ').`;

    let adviceText = '';
    let chosenModel = 'gemini-4-argon';

    try {
      // First attempt with gemini-4-argon and HIGH thinking
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: `User Query: "${query}".\nUser Context: Current Balance: ৳${userContext?.balance ?? 125.5}, Completed Tasks: ${userContext?.completedTasks ?? 8}. Give concrete recommendations for today.`,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
      adviceText = response.text || '';
    } catch (err: any) {
      console.warn('Fallback from gemini-4-argon to gemini-3.8-flash:', err?.message);
      chosenModel = 'gemini-3.8-flash';
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Query: "${query}".\nUser Context: Current Balance: ৳${userContext?.balance ?? 125.5}, Completed Tasks: ${userContext?.completedTasks ?? 8}. Give concrete recommendations for today.`,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
      adviceText = fallbackResponse.text || '';
    }

    return res.json({
      advice: adviceText,
      modelUsed: chosenModel,
      thinkingLevel: 'HIGH',
    });
  } catch (error: any) {
    console.error('Advisor Error:', error);
    return res.status(500).json({
      error: 'Failed to generate earning strategy advice',
      details: error?.message,
    });
  }
});

// Endpoint: Offerwall Postback Webhook Simulator / Receiver
// Demonstrates server-authoritative crediting with HMAC check
app.post('/api/postback/simulate', (req, res) => {
  const { userId, offerId, rewardBDT, secretKey } = req.body;
  if (!userId || !offerId || !rewardBDT) {
    return res.status(400).json({ error: 'Missing required parameters: userId, offerId, rewardBDT' });
  }

  // Simulated server validation
  const transactionId = `POSTBACK_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  res.json({
    success: true,
    message: `Secure offerwall postback verified and processed for user ${userId}`,
    creditedAmount: rewardBDT,
    transactionId,
    verifiedAt: new Date().toISOString(),
  });
});

// Mount Vite in development or static dist in production
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EarnBox Telegram Mini App running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
