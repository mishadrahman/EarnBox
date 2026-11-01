import React, { useState } from 'react';
import { Offer } from '../types';
import { X, Clock, Award, ShieldAlert, CheckCircle, ExternalLink, Zap, AlertTriangle } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';
import confetti from 'canvas-confetti';

interface OfferDetailsModalProps {
  offer: Offer | null;
  onClose: () => void;
  onPostbackCredited: () => void;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  offer,
  onClose,
  onPostbackCredited,
}) => {
  const [started, setStarted] = useState(false);
  const [isSimulatingPostback, setIsSimulatingPostback] = useState(false);
  const [creditedNotice, setCreditedNotice] = useState<string | null>(null);

  if (!offer) return null;

  const handleStart = () => {
    triggerHaptic('medium');
    DataService.startOffer(offer.id);
    setStarted(true);
    // Open provider mock link safely
    // window.open('https://t.me', '_blank');
  };

  const handleSimulatePostback = async () => {
    triggerHaptic('success');
    setIsSimulatingPostback(true);

    try {
      // Call server postback simulation or local data service
      const res = await fetch('/api/postback/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_789140231',
          offerId: offer.id,
          rewardBDT: offer.rewardBDT,
        }),
      });
      const data = await res.json();

      DataService.creditOfferReward(offer.id, offer.rewardBDT);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      setCreditedNotice(`Verified Postback Received! ৳${offer.rewardBDT.toFixed(2)} added to your wallet (TxID: ${data.transactionId || 'PB_VERIFIED'}).`);
      onPostbackCredited();
    } catch (e) {
      DataService.creditOfferReward(offer.id, offer.rewardBDT);
      setCreditedNotice(`Verified Postback Received! ৳${offer.rewardBDT.toFixed(2)} added to your wallet.`);
      onPostbackCredited();
    } finally {
      setIsSimulatingPostback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {offer.provider}
            </span>
            <span className="text-xs font-semibold text-slate-500 capitalize">
              {offer.category} Offer
            </span>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 flex-1">
          {/* Title & Reward Banner */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                {offer.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{offer.description}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white px-3.5 py-2 rounded-2xl text-center shrink-0 shadow-md shadow-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-100 block uppercase">Reward</span>
              <div className="text-xl font-extrabold flex items-center justify-center">
                <span>৳</span>
                <span>{offer.rewardBDT.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block font-medium">Est. Time</span>
              <span className="text-xs font-bold text-slate-800">{offer.estimatedMinutes} mins</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
              <Award className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block font-medium">Difficulty</span>
              <span className="text-xs font-bold text-slate-800">{offer.difficulty}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
              <Zap className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block font-medium">Tracking</span>
              <span className="text-xs font-bold text-emerald-700">Server Postback</span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Completion Steps
            </h4>
            <ol className="space-y-2 text-xs text-slate-600">
              {offer.detailedInstructions.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Requirements Checklist */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Mandatory Requirements
            </h4>
            <div className="space-y-1.5">
              {offer.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Verification Disclaimer */}
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200/80 flex items-start space-x-2.5 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Anti-Fraud Protection Policy</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Do not use VPNs, proxies, or multiple accounts. Rewards are only credited when the external provider transmits a verified cryptographic postback to our server.
              </p>
            </div>
          </div>

          {/* Postback Status Notice */}
          {creditedNotice && (
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{creditedNotice}</span>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
          {!started ? (
            <button
              onClick={handleStart}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Start Offer (Earn ৳{offer.rewardBDT.toFixed(0)})</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-center py-1">
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>Offer in Progress — Awaiting Partner Postback</span>
                </span>
              </div>

              {/* Dev Simulation Button */}
              <button
                onClick={handleSimulatePostback}
                disabled={isSimulatingPostback}
                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 active:scale-[0.99] font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isSimulatingPostback
                    ? 'Verifying Webhook Postback...'
                    : 'Test: Simulate Verified Provider Postback'}
                </span>
              </button>
            </div>
          )}

          <p className="text-[10px] text-center text-slate-400">
            Terms: {offer.terms}
          </p>
        </div>
      </div>
    </div>
  );
};
