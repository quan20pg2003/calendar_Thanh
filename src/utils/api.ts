import { Task, User } from '../types';

// Dynamic API URL for Localhost & Production Render Backend
const metaEnv = (import.meta as any).env || {};
const API_BASE_URL =
  metaEnv.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001/api'
    : 'https://chronopulse-backend.onrender.com/api');

export const api = {
  // Login Authentication (Module I)
  login: async (username: string, passwordHash: string): Promise<User> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: passwordHash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi đăng nhập');
      return data.user;
    } catch (err) {
      console.warn('API Offline, using local fallback:', err);
      throw err;
    }
  },

  // Get Tasks for User & Date (Module II & VII)
  getTasks: async (username: string, date: string): Promise<Task[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks?username=${username}&date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return await res.json();
    } catch (err) {
      console.warn('API Offline, using local fallback:', err);
      return [];
    }
  },

  // Create Task (Module II, III, IV)
  createTask: async (task: Omit<Task, 'id'> & { id?: string; userUsername: string }): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
    } catch (err) {
      console.warn('API Offline:', err);
    }
  },

  // Reschedule Task via Drag & Drop with Reason (Module V)
  rescheduleTask: async (taskId: string, newStart: string, newEnd: string, reason: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStart, newEnd, reason }),
      });
    } catch (err) {
      console.warn('API Offline:', err);
    }
  },

  // Track Actual Time & Complete Task (Module VIII)
  completeTask: async (
    taskId: string,
    actualStart: string,
    actualEnd: string,
    delayReason?: string
  ): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualStart, actualEnd, delayReason }),
      });
    } catch (err) {
      console.warn('API Offline:', err);
    }
  },

  // Log Pomodoro Focus Session (Module VI)
  logPomodoro: async (username: string, durationMinutes: number = 25): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/pomodoro/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, durationMinutes }),
      });
    } catch (err) {
      console.warn('API Offline:', err);
    }
  },

  // Delete Task
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API Offline:', err);
    }
  },
};
