import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActualTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actualData: { actualStart: string; actualEnd: string; actualDuration: number; delayReason?: string }) => void;
  task: Task | null;
}

export const ActualTimeModal: React.FC<ActualTimeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
}) => {
  const [actualStart, setActualStart] = useState('08:00');
  const [actualEnd, setActualEnd] = useState('09:00');
  const [delayReason, setDelayReason] = useState('');

  useEffect(() => {
    if (task) {
      const now = new Date();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      setActualStart(task.actualStart || task.startTime);
      setActualEnd(task.actualEnd || currentHHMM);
      setDelayReason(task.delayReason || '');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const calculateDurationMinutes = (start: string, end: string): number => {
    const [h1, m1] = start.split(':').map((n) => parseInt(n, 10));
    const [h2, m2] = end.split(':').map((n) => parseInt(n, 10));
    const total1 = (h1 || 0) * 60 + (m1 || 0);
    const total2 = (h2 || 0) * 60 + (m2 || 0);
    return Math.max(0, total2 - total1);
  };

  const duration = calculateDurationMinutes(actualStart, actualEnd);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      actualStart,
      actualEnd,
      actualDuration: duration,
      delayReason: delayReason.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-6 rounded-3xl border border-pink-200 shadow-xl relative bg-white text-slate-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-pink-200 mb-4">
          <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-lg">
            <CheckCircle2 className="w-6 h-6" />
            <span>Ghi Nhận Thời Gian Thực Tế</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-pink-50 text-slate-500 hover:text-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-pink-900 font-semibold mb-4">
          Công việc: <strong className="text-pink-950 font-bold">{task.title}</strong> (Dự kiến: {task.startTime} - {task.endTime})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pink-900 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-pink-600" />
                <span>Bắt đầu thực tế</span>
              </label>
              <input
                type="time"
                value={actualStart}
                onChange={(e) => setActualStart(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 bg-white font-bold text-pink-950 border border-pink-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-pink-900 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-pink-600" />
                <span>Kết thúc thực tế</span>
              </label>
              <input
                type="time"
                value={actualEnd}
                onChange={(e) => setActualEnd(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 bg-white font-bold text-pink-950 border border-pink-200"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between font-bold">
            <span>Thời lượng thực tế:</span>
            <span className="font-mono text-sm text-emerald-700">{duration} phút</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-pink-900 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Lý do trì hoãn / Ghi chú thực tế (nếu có)</span>
            </label>
            <textarea
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              placeholder="Nhập lý do ví dụ: Kẹt xe, Họp kéo dài, Cần thêm tài liệu..."
              rows={3}
              className="w-full px-3 py-2.5 glass-input rounded-xl text-sm focus:ring-2 focus:ring-pink-500 font-semibold text-slate-800 border border-pink-200"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-pink-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 transition-all text-xs font-bold border border-pink-200"
            >
              Bỏ qua
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all text-xs active:scale-95 border-none"
            >
              Xác Nhận Hoàn Thành
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
