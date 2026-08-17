import { Task, User } from '../types';

export const HARDCODED_USERS: Record<string, { user: User; passwordHash: string }> = {
  user1: {
    user: { username: 'user1', name: 'Nguyễn Văn A (Lịch Cá Nhân)', avatar: '🏠', role: 'Personal' },
    passwordHash: '123456',
  },
  user2: {
    user: { username: 'user2', name: 'Trần Thị B (Lịch Công Việc)', avatar: '💼', role: 'Work' },
    passwordHash: '123456',
  },
};

const CURRENT_USER_KEY = 'chronopulse_current_user';
const SCHEDULES_KEY_PREFIX = 'chronopulse_schedules_';

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function snapTo15Minutes(timeStr: string): string {
  if (!timeStr) return '08:00';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr || '0', 10);
  let m = parseInt(mStr || '0', 10);

  if (m < 8) m = 0;
  else if (m < 23) m = 15;
  else if (m < 38) m = 30;
  else if (m < 53) m = 45;
  else {
    m = 0;
    h = (h + 1) % 24;
  }

  const formattedH = h.toString().padStart(2, '0');
  const formattedM = m.toString().padStart(2, '0');
  return `${formattedH}:${formattedM}`;
}

export function getTasksForDate(username: string, dateStr: string): Task[] {
  try {
    const key = `${SCHEDULES_KEY_PREFIX}${username}_${dateStr}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    
    // Seed initial tasks if empty for today
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) {
      const defaultTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Học tiếng Nhật',
          startTime: '08:00',
          endTime: '09:30',
          category: 'study',
          priority: 'urgentImportant',
          completed: false,
          recurringDays: [1, 3, 5],
          date: dateStr,
        },
        {
          id: 'task-2',
          title: 'Tập thể dục buổi sáng',
          startTime: '06:30',
          endTime: '07:15',
          category: 'health',
          priority: 'importantNotUrgent',
          completed: true,
          actualStart: '06:30',
          actualEnd: '07:15',
          actualDuration: 45,
          date: dateStr,
        },
        {
          id: 'task-3',
          title: 'Họp nhóm định kỳ',
          startTime: '10:00',
          endTime: '11:30',
          category: 'work',
          priority: 'urgentImportant',
          completed: false,
          date: dateStr,
        },
        {
          id: 'task-4',
          title: 'Nghỉ trưa & Ăn uống',
          startTime: '12:00',
          endTime: '13:00',
          category: 'dining',
          priority: 'neither',
          completed: true,
          actualStart: '12:10',
          actualEnd: '13:05',
          actualDuration: 55,
          delayReason: 'Bữa trưa phục vụ chậm hơn dự kiến',
          date: dateStr,
        },
        {
          id: 'task-5',
          title: 'Giải trí & Đọc sách',
          startTime: '20:00',
          endTime: '21:30',
          category: 'entertainment',
          priority: 'importantNotUrgent',
          completed: false,
          date: dateStr,
        },
      ];
      localStorage.setItem(key, JSON.stringify(defaultTasks));
      return defaultTasks;
    }

    return [];
  } catch {
    return [];
  }
}

export function saveTasksForDate(username: string, dateStr: string, tasks: Task[]) {
  const key = `${SCHEDULES_KEY_PREFIX}${username}_${dateStr}`;
  localStorage.setItem(key, JSON.stringify(tasks));
}
