import { Task, User } from '../types';
import { supabase } from './supabase';

export const api = {
  // Login Authentication via Supabase Cloud DB with Inactive Account Check
  login: async (username: string, passwordHash: string): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .single();

      if (error || !data) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
      }

      if (data.password_hash !== passwordHash) {
        throw new Error('Mật khẩu không chính xác!');
      }

      // Check account status active vs inactive
      if (data.status === 'inactive') {
        throw new Error('Tài khoản này đã bị khóa hoặc ngừng hoạt động! Vui lòng liên hệ Admin.');
      }

      return {
        username: data.username,
        name: data.name,
        avatar: data.avatar,
        role: data.role,
        status: data.status || 'active',
      };
    } catch (err: any) {
      console.warn('Supabase Cloud DB login notice:', err.message);
      throw err;
    }
  },

  // Update User Account Status (Active / Inactive) by Admin
  updateUserStatus: async (username: string, status: 'active' | 'inactive'): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('username', username);
      if (error) throw error;
    } catch (err: any) {
      console.warn('Supabase updateUserStatus error:', err.message);
    }
  },

  // Get Tasks for User & Date from Supabase Cloud DB
  getTasks: async (username: string, date: string): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_username', username)
        .eq('date', date);

      if (error) throw error;

      return (data || []).map((r: any) => ({
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
      }));
    } catch (err: any) {
      console.warn('Supabase Cloud DB fetch notice:', err.message);
      return [];
    }
  },

  // Create Task in Supabase Cloud DB
  createTask: async (task: Omit<Task, 'id'> & { id?: string; userUsername: string }): Promise<void> => {
    try {
      const taskId = task.id || `task-${Date.now()}`;
      const { error } = await supabase.from('tasks').insert([
        {
          id: taskId,
          user_username: task.userUsername,
          date: task.date,
          title: task.title,
          start_time: task.startTime,
          end_time: task.endTime,
          category: task.category,
          priority: task.priority,
          completed: false,
          recurring_days: task.recurringDays || [],
        },
      ]);
      if (error) console.error('Supabase createTask error:', error.message);
    } catch (err: any) {
      console.warn('Supabase createTask error:', err.message);
    }
  },

  // Reschedule Task via Drag & Drop with Reason in Supabase Cloud DB
  rescheduleTask: async (taskId: string, newStart: string, newEnd: string, reason: string): Promise<void> => {
    try {
      const { data: oldTask } = await supabase.from('tasks').select('*').eq('id', taskId).single();

      if (oldTask) {
        await supabase.from('reschedule_logs').insert([
          {
            task_id: taskId,
            user_username: oldTask.user_username,
            old_start_time: oldTask.start_time,
            old_end_time: oldTask.end_time,
            new_start_time: newStart,
            new_end_time: newEnd,
            reason: reason.trim(),
          },
        ]);
      }

      await supabase
        .from('tasks')
        .update({
          start_time: newStart,
          end_time: newEnd,
          delay_reason: reason.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);
    } catch (err: any) {
      console.warn('Supabase rescheduleTask error:', err.message);
    }
  },

  // Track Actual Time & Complete Task in Supabase Cloud DB
  completeTask: async (
    taskId: string,
    actualStart: string,
    actualEnd: string,
    delayReason?: string
  ): Promise<void> => {
    try {
      const [h1, m1] = actualStart.split(':').map(Number);
      const [h2, m2] = actualEnd.split(':').map(Number);
      const duration = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));

      await supabase
        .from('tasks')
        .update({
          completed: true,
          actual_start: actualStart,
          actual_end: actualEnd,
          actual_duration: duration,
          delay_reason: delayReason ? delayReason.trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);
    } catch (err: any) {
      console.warn('Supabase completeTask error:', err.message);
    }
  },

  // Log Pomodoro Focus Session in Supabase Cloud DB
  logPomodoro: async (username: string, durationMinutes: number = 25): Promise<void> => {
    try {
      await supabase.from('pomodoro_logs').insert([
        {
          user_username: username,
          duration_minutes: durationMinutes,
        },
      ]);
    } catch (err: any) {
      console.warn('Supabase logPomodoro error:', err.message);
    }
  },

  // Delete Task from Supabase Cloud DB
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
    } catch (err: any) {
      console.warn('Supabase deleteTask error:', err.message);
    }
  },
};
