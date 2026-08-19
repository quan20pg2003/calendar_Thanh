import { Task, User } from '../types';

export const HARDCODED_USERS: Record<string, { user: User; passwordHash: string }> = {
  admin: {
    user: { username: 'admin', name: 'Quản Trị Viên', avatar: '👑', role: 'Admin', status: 'active' },
    passwordHash: '123456',
  },
  thanhthanh: {
    user: { username: 'thanhthanh', name: 'Thanh Thanh', avatar: '🌸', role: 'Personal', status: 'active' },
    passwordHash: '123456',
  },
  nhuyen: {
    user: { username: 'nhuyen', name: 'Nhuyên', avatar: '💼', role: 'Work', status: 'active' },
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
    // Return clean empty array without injecting any mock data
    return [];
  } catch {
    return [];
  }
}

export function saveTasksForDate(username: string, dateStr: string, tasks: Task[]) {
  const key = `${SCHEDULES_KEY_PREFIX}${username}_${dateStr}`;
  localStorage.setItem(key, JSON.stringify(tasks));
}
