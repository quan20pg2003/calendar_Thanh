import React, { useState, useEffect } from 'react';
import { User, Task, CATEGORY_CONFIG, PRIORITY_CONFIG } from '../types';
import { supabase } from '../utils/supabase';
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  BarChart3,
  Calendar,
  Search,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  selectedDate: string;
  onSelectUserFilter: (username: string) => void;
  activeUserFilter: string;
}

interface RescheduleLogItem {
  id: number;
  task_id: string;
  user_username: string;
  old_start_time: string;
  old_end_time: string;
  new_start_time: string;
  new_end_time: string;
  reason: string;
  created_at: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  selectedDate,
  onSelectUserFilter,
  activeUserFilter,
}) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [rescheduleLogs, setRescheduleLogs] = useState<RescheduleLogItem[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'usersList' | 'overview' | 'rescheduleLogs'>('usersList');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        setUsersList(
          usersData.map((u: any) => ({
            username: u.username,
            name: u.name,
            avatar: u.avatar,
            role: u.role,
          }))
        );
      } else {
        setUsersList([
          { username: 'thanhthanh', name: 'Thanh Thanh', avatar: '🌸', role: 'Personal' },
          { username: 'nhuyen', name: 'Nhuyên', avatar: '💼', role: 'Work' },
          { username: 'admin', name: 'Quản Trị Viên', avatar: '👑', role: 'Admin' },
          { username: 'user1', name: 'Nguyễn Văn A', avatar: '🏠', role: 'Personal' },
          { username: 'user2', name: 'Trần Thị B', avatar: '💼', role: 'Work' },
        ]);
      }

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('date', selectedDate);

      if (tasksData) {
        setAllTasks(
          tasksData.map((r: any) => ({
            id: r.id,
            user_username: r.user_username,
            date: r.date,
            title: r.title,
            startTime: r.start_time,
            endTime: r.end_time,
            category: r.category,
            priority: r.priority,
            completed: Boolean(r.completed),
            recurringDays: r.recurring_days || [],
            actualStart: r.actual_start,
            actualEnd: r.actual_end,
            actualDuration: r.actual_duration,
            delayReason: r.delay_reason,
          }))
        );
      }

      const { data: logsData } = await supabase
        .from('reschedule_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsData) {
        setRescheduleLogs(logsData);
      }
    } catch (err) {
      console.warn('Admin fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [selectedDate]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalRescheduleCount = rescheduleLogs.length;

  const filteredTasks = allTasks.filter((t) => {
    const matchesUser = activeUserFilter === 'all' || t.user_username === activeUserFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUser && matchesSearch;
  });

  const getUserDelayStatus = (username: string) => {
    const userTasks = allTasks.filter((t) => t.user_username === username);
    const userReschedules = rescheduleLogs.filter((l) => l.user_username === username);
    const userDelayTasks = userTasks.filter((t) => Boolean(t.delayReason));

    const totalDelays = userReschedules.length + userDelayTasks.length;

    if (totalDelays === 0) {
      return {
        level: 'good',
        label: '🟢 Đúng tiến độ - 0 lần trì hoãn',
        cardBg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        progressColor: 'bg-emerald-500',
        delayCount: 0,
      };
    } else if (totalDelays <= 2) {
      return {
        level: 'warning',
        label: `🟡 Cần lưu ý - ${totalDelays} lần trì hoãn`,
        cardBg: 'bg-amber-50/70 border-amber-200 text-amber-900',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        progressColor: 'bg-amber-500',
        delayCount: totalDelays,
      };
    } else {
      return {
        level: 'critical',
        label: `🔴 Trì hoãn nhiều - ${totalDelays} lần trì hoãn`,
        cardBg: 'bg-rose-50/70 border-rose-300 text-rose-900',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-400 font-extrabold shadow-xs',
        progressColor: 'bg-rose-600',
        delayCount: totalDelays,
      };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#cce7f8] p-6 shadow-sm mb-6 font-jakarta">
      {/* Admin Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#cce7f8] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1b98e0] text-white flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">Giám Sát Tài Khoản Và Mức Độ Trì Hoãn</h2>
              <span className="bg-[#e0f2fe] text-[#0c6296] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#b8e1f7]">
                Quyền Quản Trị
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Theo dõi toàn bộ công việc, tỷ lệ hoàn thành và lý do đổi lịch của tất cả các tài khoản hệ thống.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-3 py-2 bg-[#f0f8fd] hover:bg-[#e0f2fe] text-[#0c6296] rounded-xl text-xs font-bold border border-[#b8e1f7] flex items-center gap-1.5 transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-[#f0f8fd] border border-[#b8e1f7] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-[#b8e1f7] flex items-center justify-center text-[#1b98e0]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#0c6296] font-bold">Tổng Tài Khoản</div>
            <div className="text-xl font-extrabold text-slate-900">{usersList.length || 5}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#f0f8fd] border border-[#b8e1f7] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-[#b8e1f7] flex items-center justify-center text-[#1b98e0]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#0c6296] font-bold">Công Việc Hôm Nay</div>
            <div className="text-xl font-extrabold text-slate-900">{totalTasks}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-emerald-300 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-800 font-bold">Tỷ Lệ Hoàn Thành</div>
            <div className="text-xl font-extrabold text-emerald-900">{completionRate}% • {completedTasks} trên {totalTasks}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-rose-300 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-rose-800 font-bold">Tổng Số Lượt Trì Hoãn</div>
            <div className="text-xl font-extrabold text-rose-900">{totalRescheduleCount}</div>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#cce7f8] mb-6">
        <div className="flex items-center gap-2 bg-[#f0f8fd] p-1 rounded-xl border border-[#cce7f8]">
          <button
            onClick={() => setActiveTab('usersList')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'usersList'
                ? 'bg-[#1b98e0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            👥 Danh Sách Tài Khoản Và Mức Độ Trì Hoãn
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#1b98e0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            📊 Chi Tiết Công Việc Các Tài Khoản
          </button>
          <button
            onClick={() => setActiveTab('rescheduleLogs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rescheduleLogs'
                ? 'bg-[#1b98e0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            ⚠️ Nhật Ký Đổi Lịch • {totalRescheduleCount} lượt
          </button>
        </div>

        {/* User Account Filter Select */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1b98e0]" />
          <span className="text-xs font-bold text-[#0c6296]">Lọc tài khoản:</span>
          <select
            value={activeUserFilter}
            onChange={(e) => onSelectUserFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#b8e1f7] bg-[#f0f8fd] text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#1b98e0]"
          >
            <option value="all">🌐 Tất cả tài khoản • {allTasks.length} công việc</option>
            <option value="thanhthanh">🌸 thanhthanh • Thanh Thanh</option>
            <option value="nhuyen">💼 nhuyen • Nhuyên</option>
            <option value="admin">👑 admin • Quản Trị Viên</option>
            <option value="user1">🏠 user1 • Nguyễn Văn A</option>
            <option value="user2">💼 user2 • Trần Thị B</option>
          </select>
        </div>
      </div>

      {/* TAB 1: ACCOUNTS LIST WITH DYNAMIC DELAY COLOR STATUS */}
      {activeTab === 'usersList' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#f0f8fd] rounded-xl border border-[#b8e1f7] flex items-center justify-between gap-4 text-xs font-semibold text-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#0c6296]">Mức độ trì hoãn:</span>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                🟢 0 lần: Đúng tiến độ
              </span>
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                🟡 1 đến 2 lần: Cần chú ý
              </span>
              <span className="px-2 py-1 rounded bg-rose-100 text-rose-900 border border-rose-300 font-extrabold">
                🔴 Trên 3 lần: Trì hoãn nhiều
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {usersList.map((u) => {
              const userTasks = allTasks.filter((t) => t.user_username === u.username);
              const userDone = userTasks.filter((t) => t.completed).length;
              const pct = userTasks.length > 0 ? Math.round((userDone / userTasks.length) * 100) : 0;
              const status = getUserDelayStatus(u.username);

              return (
                <div
                  key={u.username}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${status.cardBg}`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{u.avatar}</span>
                        <div>
                          <div className="font-extrabold text-slate-900 text-base">{u.name}</div>
                          <div className="text-xs text-[#0c6296] font-mono font-bold">@{u.username}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-white border border-[#b8e1f7] text-[#0c6296] rounded font-bold">
                        {u.role}
                      </span>
                    </div>

                    <div className="mt-3 mb-4">
                      <span className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 w-fit ${status.badgeBg}`}>
                        <span>{status.label}</span>
                      </span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#cce7f8]">
                      <div className="flex justify-between text-xs text-slate-700 font-semibold">
                        <span>Số lượng công việc hôm nay:</span>
                        <span className="font-extrabold text-slate-900">{userTasks.length} công việc</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-700 font-semibold">
                        <span>Đã hoàn thành:</span>
                        <span className="font-bold text-emerald-700">{userDone} trên {userTasks.length} • {pct}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-700 font-semibold">
                        <span>Số lần trì hoãn hoặc đổi giờ:</span>
                        <span className={`font-bold ${status.delayCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {status.delayCount} lần
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#b8e1f7] mt-2">
                        <div
                          className={`h-full transition-all ${status.progressColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectUserFilter(u.username)}
                    className="w-full mt-5 py-2.5 bg-white hover:bg-[#e0f2fe] text-[#0c6296] font-bold text-xs rounded-xl border border-[#b8e1f7] transition-all text-center active:scale-95 shadow-xs"
                  >
                    Xem chi tiết lịch biểu của @{u.username}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW ALL USER TASKS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm công việc bất kỳ..."
                className="w-full pl-9 pr-4 py-2 bg-[#f0f8fd] border border-[#b8e1f7] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#1b98e0]"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Đang hiển thị {filteredTasks.length} trên tổng số {allTasks.length} công việc
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#cce7f8]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f8fd] text-[#0c6296] font-bold border-b border-[#cce7f8]">
                <tr>
                  <th className="p-3">Tài Khoản</th>
                  <th className="p-3">Tên Công Việc</th>
                  <th className="p-3">Khung Giờ Đăng Ký</th>
                  <th className="p-3">Nhóm Và Ưu Tiên</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3">Ghi Chú Và Lý Do Trì Hoãn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cce7f8]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      Chưa có công việc nào thuộc tiêu chí lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const cat = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.work;
                    const prio = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.neither;

                    return (
                      <tr key={t.id} className="hover:bg-[#f0f8fd]/50 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <span className="px-2 py-1 bg-white border border-[#b8e1f7] rounded font-mono text-[11px] text-[#0c6296]">
                            {t.user_username || 'hệ thống'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{t.title}</td>
                        <td className="p-3 font-mono font-semibold text-[#0c6296]">
                          {t.startTime} đến {t.endTime}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded ${cat.badgeBg}`}>
                              {cat.emoji} {cat.label}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${prio.badgeClass}`}>
                              {prio.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {t.completed ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px] flex items-center gap-1 w-fit border border-emerald-300">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Đã hoàn thành
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-md text-[11px]">
                              Đang thực hiện
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">
                          {t.delayReason ? (
                            <span className="text-amber-800 bg-amber-50 px-2 py-1 rounded text-[11px] border border-amber-200 block max-w-xs truncate">
                              ⚠️ Lý do: {t.delayReason}
                            </span>
                          ) : t.actualStart ? (
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-1 rounded text-[11px] border border-emerald-200">
                              ⏱️ Thực tế từ {t.actualStart} đến {t.actualEnd} • {t.actualDuration} phút
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Đang đúng tiến độ</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESCHEDULE AUDIT LOGS */}
      {activeTab === 'rescheduleLogs' && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-3 text-rose-900 text-xs font-semibold">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>
              Nhật ký ghi vết toàn bộ hành vi kéo thả thay đổi giờ công việc của người dùng trên lịch 24h kèm theo lý do bắt buộc.
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#cce7f8]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f8fd] text-[#0c6296] font-bold border-b border-[#cce7f8]">
                <tr>
                  <th className="p-3">Thời Gian Thao Tác</th>
                  <th className="p-3">Tài Khoản</th>
                  <th className="p-3">Giờ Ban Đầu Cũ</th>
                  <th className="p-3">Giờ Chuyển Sang Mới</th>
                  <th className="p-3">Lý Do Đổi Lịch Bắt Bắt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cce7f8]">
                {rescheduleLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                      Chưa có nhật ký kéo thả đổi lịch nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  rescheduleLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f0f8fd]/50 transition-colors">
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        <span className="px-2 py-1 bg-[#e0f2fe] text-[#0c6296] rounded font-mono font-bold">
                          {log.user_username}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 line-through">
                        {log.old_start_time} - {log.old_end_time}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#0c6296]">
                        {log.new_start_time} - {log.new_end_time}
                      </td>
                      <td className="p-3 font-semibold text-rose-700 bg-rose-50 rounded border border-rose-200">
                        ⚠️ {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
