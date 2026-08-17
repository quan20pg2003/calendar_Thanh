import React, { useState } from 'react';
import { HARDCODED_USERS } from '../utils/storage';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const account = HARDCODED_USERS[username.trim()];
    if (!account || account.passwordHash !== password) {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
      return;
    }

    onLoginSuccess(account.user);
  };

  const handleQuickLogin = (uname: string) => {
    setUsername(uname);
    setPassword('123456');
    const account = HARDCODED_USERS[uname];
    if (account) {
      onLoginSuccess(account.user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs font-vietnam">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl border border-[#cce7f8] shadow-lg relative overflow-hidden bg-white text-slate-800"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1b98e0] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold border border-[#1582c2] shadow-sm">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng Nhập ChronoPulse</h2>
          <p className="text-sm text-[#0c6296] font-semibold mt-1">Lịch Biểu Cá Nhân • Tone Màu Xanh & Trắng</p>
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
                placeholder="Nhập username (e.g. user1)"
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
                placeholder="Nhập mật khẩu (123456)"
                required
                className="w-full pl-12 pr-4 py-3 glass-input rounded-xl text-sm focus:ring-2 focus:ring-[#1b98e0] transition-all font-semibold text-slate-900 border border-[#b8e1f7]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1b98e0] hover:bg-[#1585c5] text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm border-none mt-2"
          >
            <span>Vào Hệ Thống</span>
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        {/* Quick selection of hardcoded accounts */}
        <div className="mt-8 pt-6 border-t border-[#cce7f8] text-center">
          <p className="text-xs text-[#0c6296] mb-3 font-semibold">Chọn nhanh tài khoản dùng thử:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('user1')}
              className="p-3 bg-[#f0f8fd] hover:bg-[#e0f2fe] rounded-xl transition-all text-left flex items-center gap-3 border border-[#b8e1f7] group"
            >
              <span className="text-lg">🏠</span>
              <div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#1b98e0] transition-colors">user1</div>
                <div className="text-[11px] text-[#0c6296] font-semibold">Lịch Cá Nhân</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('user2')}
              className="p-3 bg-[#f0f8fd] hover:bg-[#e0f2fe] rounded-xl transition-all text-left flex items-center gap-3 border border-[#b8e1f7] group"
            >
              <span className="text-lg">💼</span>
              <div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#1b98e0] transition-colors">user2</div>
                <div className="text-[11px] text-[#0c6296] font-semibold">Lịch Công Việc</div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
