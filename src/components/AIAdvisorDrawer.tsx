import React, { useState } from 'react';
import { X, Sparkles, Send, Brain, ShieldAlert, Lightbulb, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { WalletData } from '../types';

interface AIAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletData;
}

export const AIAdvisorDrawer: React.FC<AIAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  wallet,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; thinking?: boolean; modelUsed?: string }[]
  >([
    {
      role: 'assistant',
      text: `আসসালামু আলাইকুম! I am your **EarnBox AI Earning Strategist** with deep reasoning capabilities.

Ask me anything about:
• Highest-paying surveys and best completion hours in Bangladesh
• How to qualify without survey disqualifications
• Maximizing daily streak multipliers and referral income
• Safe bKash/Nagad cashout thresholds (no VPNs allowed!)`,
      modelUsed: 'gemini-4-argon (Thinking Level: HIGH)',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How can I earn ৳300 fastest today?',
    'Survey qualification tips for BD users',
    'How does daily streak bonus scale?',
    'bKash & Nagad withdrawal rules',
  ];

  const handleSend = async (userPrompt: string) => {
    if (!userPrompt.trim() || isLoading) return;
    triggerHaptic('medium');

    const newMsgs = [...messages, { role: 'user' as const, text: userPrompt }];
    setMessages(newMsgs);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userPrompt,
          userContext: {
            balance: wallet.availableBalance,
            completedTasks: 14,
          },
        }),
      });

      const data = await res.json();
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: data.advice || 'Keep your streak alive and complete early-morning surveys for best results!',
          modelUsed: `${data.modelUsed || 'gemini-4-argon'} (Thinking: HIGH)`,
        },
      ]);
      triggerHaptic('success');
    } catch (e: any) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: `💡 **Quick Bangladesh Strategy Recommendation:**
1. Focus on the BitLabs Financial Survey (৳25) early morning.
2. Complete Pathao Delivery App Install (৳35) for instant verified postback.
3. Keep Day 7 streak ready for the ৳25 mystery bonus.
4. Cashout to bKash/Nagad once you surpass ৳50 minimum!`,
          modelUsed: 'gemini-4-argon (Thinking Level: HIGH)',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-sm tracking-tight text-white">
                  EarnBox AI Strategist
                </h3>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300/30 flex items-center space-x-0.5">
                  <Brain className="w-2.5 h-2.5" />
                  <span>High Thinking</span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                Grounded advice for maximum BDT rewards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.role === 'assistant' && msg.modelUsed && (
                <span className="text-[10px] text-slate-400 font-medium mb-1 flex items-center space-x-1 pl-1">
                  <Brain className="w-3 h-3 text-emerald-600" />
                  <span>{msg.modelUsed}</span>
                </span>
              )}

              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-2xl p-3.5 max-w-[85%] shadow-xs">
              <Brain className="w-4 h-4 text-emerald-600 animate-spin" />
              <div>
                <span className="font-bold text-slate-700">Thinking deeply...</span>
                <span className="block text-[10px] text-slate-400">
                  Synthesizing optimal earning path with High Thinking Level
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-semibold border border-slate-200/60 transition-all shrink-0 active:scale-95"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
            placeholder="Ask about tasks, surveys, bKash cashout..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleSend(query)}
            disabled={isLoading || !query.trim()}
            className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-slate-200 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
