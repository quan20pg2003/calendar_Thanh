import React, { useState } from 'react';
import { BookOpen, FolderCheck, FileText, CheckCircle2, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotebookLMWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTasks: (sampleTasks: Array<{ title: string; category: any; priority: any; startTime: string; endTime: string }>) => void;
}

export const NotebookLMWidget: React.FC<NotebookLMWidgetProps> = ({
  isOpen,
  onClose,
  onImportTasks,
}) => {
  const [copiedStatus, setCopiedStatus] = useState(false);

  if (!isOpen) return null;

  const handleImportSampleNotebookLM = () => {
    onImportTasks([
      {
        title: 'Thiết kế giao diện Glassmorphism UI/UX',
        category: 'work',
        priority: 'urgentImportant',
        startTime: '09:00',
        endTime: '10:30',
      },
      {
        title: 'Học tiếng Nhật & Ôn từ vựng JLPT',
        category: 'study',
        priority: 'importantNotUrgent',
        startTime: '19:00',
        endTime: '20:30',
      },
      {
        title: 'Chạy bộ 30 phút & Thể thao',
        category: 'health',
        priority: 'importantNotUrgent',
        startTime: '17:30',
        endTime: '18:15',
      },
    ]);
    setCopiedStatus(true);
    setTimeout(() => {
      setCopiedStatus(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg p-6 rounded-3xl border border-pink-200 shadow-xl relative bg-white text-slate-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-pink-200 mb-6">
          <div className="flex items-center gap-2 text-purple-900 font-extrabold text-lg">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span>Tích Hợp Google NotebookLM MCP</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-pink-50 text-slate-500 hover:text-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600">
          <p className="font-semibold">
            Hệ thống **Google NotebookLM MCP Server** đã được cấu hình tự động quét các file trong thư mục:
          </p>

          <div className="p-3.5 bg-pink-50 rounded-xl border border-pink-200 space-y-2 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-pink-950 font-bold">
              <FolderCheck className="w-4 h-4 text-pink-600" />
              <span>notebooks/requirements/</span> (Chứa file yêu cầu .docx, .md)
            </div>
            <div className="flex items-center gap-2 text-purple-950 font-bold">
              <FolderCheck className="w-4 h-4 text-purple-600" />
              <span>notebooks/designs/</span> (Chứa file thiết kế .md, blueprint)
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
            <h4 className="font-bold text-purple-950 text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Tự Động Nạp Nhiệm Vụ Mẫu Từ NotebookLM
            </h4>
            <p className="text-slate-600 text-xs mb-3 font-semibold">
              Bấm nút dưới đây để trích xuất nhanh 3 nhiệm vụ mẫu từ NotebookLM vào thời gian biểu hôm nay.
            </p>

            <button
              onClick={handleImportSampleNotebookLM}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm active:scale-95 border-none"
            >
              {copiedStatus ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Đã Trích Xuất Thành Công!
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" /> Nạp Nhiệm Vụ Từ NotebookLM
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
