import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionCount((prev) => prev + 1);

      // Play beep audio via Web Audio API
      playCompletionSound();

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const playCompletionSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio fallback
    }
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progressPercent = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl border border-pink-200 shadow-xl relative text-center overflow-hidden bg-white text-slate-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-pink-200 mb-6">
          <div className="flex items-center gap-2 text-amber-800 font-extrabold text-lg">
            <Timer className="w-6 h-6 text-amber-600" />
            <span>Đồng Hồ Tập Trung (Pomodoro 25m)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-pink-50 text-slate-500 hover:text-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Circle Visual */}
        <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-amber-100"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-amber-500 transition-all duration-1000"
              strokeWidth="12"
              strokeDasharray={527}
              strokeDashoffset={527 - (527 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-extrabold text-slate-800 tracking-widest drop-shadow-sm">
              {timeFormatted}
            </span>
            <span className="text-xs font-bold text-amber-700 mt-1 uppercase tracking-wider">
              {isRunning ? '🔥 Đang tập trung...' : 'Tạm dừng'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-semibold mb-6">
          Đã hoàn thành <strong className="text-pink-950 font-bold">{sessionCount}</strong> phiên Pomodoro hôm nay 🎉
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleStartPause}
            className={`px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 active:scale-95 border-none ${
              isRunning
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" /> Tạm Dừng
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Bắt Đầu (25m)
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-pink-50 text-slate-600 hover:text-slate-900 hover:bg-pink-100 border border-pink-200 transition-all active:scale-95"
            title="Đặt lại phiên"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
