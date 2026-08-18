import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../utils/supabase';
import { User as UserIcon, Lock, KeyRound, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

const AVATAR_OPTIONS = ['👑', '🌸', '💼', '🏠', '🌿', '🎨', '⚡', '⭐', '🚀', '🐱', '☕', '🎯'];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Profile Update (Change Name & Avatar)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!name.trim()) {
        setError('Vui lòng nhập tên hiển thị!');
        setLoading(false);
        return;
      }

      // Update in Supabase Cloud DB
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          avatar: avatar,
        })
        .eq('username', currentUser.username);

      if (dbError) throw dbError;

      const updated = {
        ...currentUser,
        name: name.trim(),
        avatar: avatar,
      };

      onUpdateUser(updated);
      setSuccess('Cập nhật thông tin tài khoản thành công!');
    } catch (err: any) {
      setError(err.message || 'Lỗi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Update (Change Password)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Vui lòng điền đầy đủ các thông tin mật khẩu!');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Mật khẩu mới và xác nhận mật khẩu không khớp!');
        setLoading(false);
        return;
      }

      if (newPassword.length < 4) {
        setError('Mật khẩu mới phải có tối thiểu 4 ký tự!');
        setLoading(false);
        return;
      }

      // Check current password from Supabase
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', currentUser.username)
        .single();

      if (dbUser && dbUser.password_hash !== currentPassword) {
        setError('Mật khẩu hiện tại không chính xác!');
        setLoading(false);
        return;
      }

      // Update password in Supabase Cloud DB
      const { error: dbError } = await supabase
        .from('users')
        .update({
          password_hash: newPassword,
        })
        .eq('username', currentUser.username);

      if (dbError) throw dbError;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Đổi mật khẩu thành công! Mật khẩu mới của bạn đã có hiệu lực.');
    } catch (err: any) {
      setError(err.message || 'Lỗi cập nhật mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs font-jakarta">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg p-6 rounded-2xl border border-[#cce7f8] shadow-xl relative bg-white text-slate-800"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#cce7f8] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1b98e0] text-white flex items-center justify-center text-xl font-bold shadow-xs">
              {currentUser.avatar}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>Quản Lý Tài Khoản</span>
                <span className="text-[10px] bg-[#e0f2fe] text-[#0c6296] px-2 py-0.5 rounded font-bold border border-[#b8e1f7]">
                  @{currentUser.username}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Thay đổi tên hiển thị, ảnh đại diện hoặc đổi mật khẩu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#f0f8fd] text-slate-400 hover:text-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#f0f8fd] p-1 rounded-xl border border-[#cce7f8] mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#1b98e0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Thông Tin Cá Nhân (Đổi Tên)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('security');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'security'
                ? 'bg-[#1b98e0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Bảo Mật (Đổi Mật Khẩu)</span>
          </button>
        </div>

        {/* TAB 1: CHANGE NAME & AVATAR */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0c6296] mb-1">Tên đăng nhập (Username)</label>
              <input
                type="text"
                disabled
                value={currentUser.username}
                className="w-full px-4 py-2.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0c6296] mb-1">Tên hiển thị mới *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên hiển thị mới của bạn"
                required
                className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#b8e1f7] focus:ring-2 focus:ring-[#1b98e0] text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0c6296] mb-2">Chọn Biểu Tượng Đại Diện</label>
              <div className="flex flex-wrap gap-2 p-3 bg-[#f0f8fd] rounded-xl border border-[#b8e1f7]">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAvatar(opt)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      avatar === opt
                        ? 'bg-[#1b98e0] text-white scale-110 shadow-xs border border-[#1582c2]'
                        : 'bg-white hover:bg-[#e0f2fe] border border-[#cce7f8]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#cce7f8]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#f0f8fd] hover:bg-[#e0f2fe] text-[#0c6296] text-xs font-bold border border-[#b8e1f7]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-[#1b98e0] hover:bg-[#1585c5] text-white text-xs font-bold shadow-xs active:scale-95 border-none"
              >
                {loading ? 'Đang lưu...' : 'Cập Nhật Thông Tin'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0c6296] mb-1">Mật khẩu hiện tại *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                required
                className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#b8e1f7] focus:ring-2 focus:ring-[#1b98e0] text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0c6296] mb-1">Mật khẩu mới *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#b8e1f7] focus:ring-2 focus:ring-[#1b98e0] text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0c6296] mb-1">Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#b8e1f7] focus:ring-2 focus:ring-[#1b98e0] text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#cce7f8]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#f0f8fd] hover:bg-[#e0f2fe] text-[#0c6296] text-xs font-bold border border-[#b8e1f7]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-[#1b98e0] hover:bg-[#1585c5] text-white text-xs font-bold shadow-xs active:scale-95 border-none"
              >
                {loading ? 'Đang lưu...' : 'Lưu Mật Khẩu Mới'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
