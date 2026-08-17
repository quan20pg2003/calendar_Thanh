import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Clock, AlertCircle, X, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface RescheduleReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  task: Task | null;
  proposedStart: string;
  proposedEnd: string;
}

export const RescheduleReasonModal: React.FC<RescheduleReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
  proposedStart,
  proposedEnd,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setReason('');
    setError('');
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do thay đổi thời gian!');
      return;
    }

    onConfirm(reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs font-jakarta">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg p-6 rounded-2xl border border-[#cce7f8] shadow-xl relative bg-white text-slate-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#cce7f8] mb-4">
          <div className="flex items-center gap-2 text-[#0c6296] font-extrabold text-lg">
            <Calendar className="w-5 h-5 text-[#1b98e0]" />
            <span>Lý Do Thay Đổi Thời Gian Công Việc</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#f0f8fd] text-slate-500 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#f0f8fd] rounded-xl border border-[#b8e1f7] mb-5 space-y-2 text-xs">
          <div className="font-bold text-slate-900 text-sm">{task.title}</div>
          <div className="flex items-center gap-4 text-slate-700 font-medium pt-1">
            <span className="line-through text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Cũ: {task.startTime} - {task.endTime}
            </span>
            <span className="text-[#0c6296] font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#1b98e0]" />
              Mới: {proposedStart} - {proposedEnd}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-[#1b98e0]" />
              <span>Lý do đổi lịch *</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do thay đổi thời gian (ví dụ: Kẹt xe, Họp đột xuất, Đổi lịch hẹn khách hàng...)"
              rows={3}
              required
              className="w-full px-4 py-3 glass-input rounded-xl text-sm focus:ring-2 focus:ring-[#1b98e0] font-semibold text-slate-800 border border-[#b8e1f7]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#cce7f8]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f0f8fd] hover:bg-[#e0f2fe] text-[#0c6296] transition-all text-xs font-bold border border-[#b8e1f7]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1b98e0] hover:bg-[#1585c5] text-white font-bold shadow-xs transition-all text-xs active:scale-95 border-none"
            >
              <span>Xác Nhận Đổi Lịch</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
