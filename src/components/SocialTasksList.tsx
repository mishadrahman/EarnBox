import React, { useState } from 'react';
import { SocialTask } from '../types';
import {
  Send,
  Youtube,
  Facebook,
  Globe,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';
import { DataService } from '../services/dataService';
import confetti from 'canvas-confetti';

interface SocialTasksListProps {
  tasks: SocialTask[];
  onTaskCompleted: () => void;
}

export const SocialTasksList: React.FC<SocialTasksListProps> = ({
  tasks,
  onTaskCompleted,
}) => {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const getIcon = (type: SocialTask['type']) => {
    switch (type) {
      case 'telegram':
        return <Send className="w-4 h-4 text-sky-500" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'web':
        return <Globe className="w-4 h-4 text-emerald-600" />;
    }
  };

  const handleStartAndVerify = (task: SocialTask) => {
    triggerHaptic('medium');
    window.open(task.channelOrUrl, '_blank');
    setVerifyingId(task.id);

    // Simulate verification delay
    setTimeout(() => {
      DataService.completeSocialTask(task.id);
      triggerHaptic('success');
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch (e) {}
      setVerifyingId(null);
      onTaskCompleted();
    }, 2000);
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-sky-950">
            Instant Social Micro-Tasks
          </span>
        </div>
        <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200">
          Instant Payout
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
          const isDone = task.status === 'completed';
          const isVerifying = verifyingId === task.id;

          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl p-3.5 border transition-all flex items-center justify-between ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/30 opacity-80'
                  : 'border-slate-100 shadow-xs hover:border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getIcon(task.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {task.providerName}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{task.instructions}</p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3 space-y-1">
                <div className="text-xs font-extrabold text-emerald-700">
                  +৳{task.rewardBDT.toFixed(2)}
                </div>

                {isDone ? (
                  <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Done</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleStartAndVerify(task)}
                    disabled={isVerifying}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 transition-all"
                  >
                    <span>{isVerifying ? 'Checking...' : 'Join'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
