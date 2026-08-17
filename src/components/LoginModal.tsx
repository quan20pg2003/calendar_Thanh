import React, { useState } from 'react';
import { api } from '../utils/api';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate directly against Supabase Cloud Database!
      const loggedInUser = await api.login(username.trim(), password);
      onLoginSuccess(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs font-jakarta">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl border border-[#cce7f8] shadow-lg relative overflow-hidden bg-white text-slate-800"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#1b98e0] rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-bold border border-[#1582c2] shadow-sm">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng Nhập ChronoPulse</h2>
          <p className="text-sm text-[#0c6296] font-semibold mt-1">Lịch Biểu Cá Nhân • Hệ Thống Quản Lý Công Việc</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0c6296] uppercase tracking-wider mb-2">
              Tên đăng nhập
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1b98e0]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập của bạn"
                required
                className="w-full pl-12 pr-4 py-3 glass-input rounded-xl text-sm focus:ring-2 focus:ring-[#1b98e0] transition-all font-semibold text-slate-900 border border-[#b8e1f7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0c6296] uppercase tracking-wider mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1b98e0]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                className="w-full pl-12 pr-4 py-3 glass-input rounded-xl text-sm focus:ring-2 focus:ring-[#1b98e0] transition-all font-semibold text-slate-900 border border-[#b8e1f7]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1b98e0] hover:bg-[#1585c5] text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm border-none mt-4 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang kết nối Supabase Cloud DB...</span>
              </>
            ) : (
              <>
                <span>Vào Hệ Thống</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
