-- ============================================================
-- CHRONOPULSE SUPABASE CLOUD DATABASE SCHEMA MIGRATION
-- Project: vstftwxrjpxmomzskqmj
-- ============================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  role TEXT NOT NULL
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  recurring_days JSONB,
  actual_start TEXT,
  actual_end TEXT,
  actual_duration INT DEFAULT 0,
  delay_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Reschedule Logs Table
CREATE TABLE IF NOT EXISTS public.reschedule_logs (
  id BIGSERIAL PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_username TEXT NOT NULL,
  old_start_time TEXT NOT NULL,
  old_end_time TEXT NOT NULL,
  new_start_time TEXT NOT NULL,
  new_end_time TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Pomodoro Logs Table
CREATE TABLE IF NOT EXISTS public.pomodoro_logs (
  id BIGSERIAL PRIMARY KEY,
  user_username TEXT NOT NULL,
  duration_minutes INT DEFAULT 25,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Policies for App Access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedule_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tasks" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "Allow public insert reschedule_logs" ON public.reschedule_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select reschedule_logs" ON public.reschedule_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert pomodoro_logs" ON public.pomodoro_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select pomodoro_logs" ON public.pomodoro_logs FOR SELECT USING (true);

-- Seed Initial Accounts (admin, thanhthanh, nhuyen, user1, user2)
INSERT INTO public.users (username, password_hash, name, avatar, role)
VALUES 
  ('admin', '123456', 'Quản Trị Viên (Admin)', '👑', 'Admin'),
  ('thanhthanh', '123456', 'Thanh Thanh', '🌸', 'Personal'),
  ('nhuyen', '123456', 'Nhuyên', '💼', 'Work'),
  ('user1', '123456', 'Nguyễn Văn A', '🏠', 'Personal'),
  ('user2', '123456', 'Trần Thị B', '💼', 'Work')
ON CONFLICT (username) DO NOTHING;
