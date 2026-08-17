const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Constraint helper: Valid 15-minute interval check
const VALID_MINUTES = ['00', '15', '30', '45'];
const isValid15MinInterval = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return false;
  return VALID_MINUTES.includes(parts[1]);
};

// Calculate duration in minutes between HH:mm times
const calculateMinutes = (start, end) => {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  const t1 = h1 * 60 + m1;
  const t2 = h2 * 60 + m2;
  return Math.max(0, t2 - t1);
};

// ----------------------------------------------------
// MODULE I: AUTHENTICATION (Hardcoded Accounts)
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng cung cấp username và mật khẩu!' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username.trim()], (err, user) => {
    if (err) return res.status(500).json({ error: 'Lỗi máy chủ database!' });
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
    }

    res.json({
      message: 'Đăng nhập thành công!',
      user: {
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    });
  });
});

// ----------------------------------------------------
// MODULE II & VII: GET TASKS (Including Recurring)
// ----------------------------------------------------
app.get('/api/tasks', (req, res) => {
  const { username, date } = req.query;
  if (!username || !date) {
    return res.status(400).json({ error: 'Thiếu username hoặc date!' });
  }

  const dateObj = new Date(date + 'T00:00:00');
  const dayIndex = dateObj.getDay();

  db.all(
    'SELECT * FROM tasks WHERE user_username = ? AND (date = ? OR recurring_days LIKE ?)',
    [username, date, `%${dayIndex}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Lỗi truy vấn danh sách công việc!' });

      const tasks = rows.map((r) => ({
        id: r.id,
        user_username: r.user_username,
        date: r.date,
        title: r.title,
        startTime: r.start_time,
        endTime: r.end_time,
        category: r.category,
        priority: r.priority,
        completed: Boolean(r.completed),
        recurringDays: r.recurring_days ? JSON.parse(r.recurring_days) : [],
        actualStart: r.actual_start,
        actualEnd: r.actual_end,
        actualDuration: r.actual_duration,
        delayReason: r.delay_reason,
      }));

      res.json(tasks);
    }
  );
});

// ----------------------------------------------------
// MODULE II & III & IV: CREATE TASK (Enforces 15-min interval)
// ----------------------------------------------------
app.post('/api/tasks', (req, res) => {
  const {
    id,
    userUsername,
    date,
    title,
    startTime,
    endTime,
    category,
    priority,
    recurringDays,
  } = req.body;

  if (!userUsername || !date || !title || !startTime || !endTime) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin công việc!' });
  }

  if (!isValid15MinInterval(startTime) || !isValid15MinInterval(endTime)) {
    return res.status(400).json({
      error: 'Thời gian chỉ cho phép chọn mốc: 00, 15, 30 và 45 phút!',
    });
  }

  if (startTime >= endTime) {
    return res.status(400).json({ error: 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!' });
  }

  const taskId = id || `task-${Date.now()}`;
  const recurringStr = recurringDays && recurringDays.length > 0 ? JSON.stringify(recurringDays) : null;

  db.run(
    `INSERT INTO tasks (id, user_username, date, title, start_time, end_time, category, priority, recurring_days)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taskId,
      userUsername,
      date,
      title.trim(),
      startTime,
      endTime,
      category || 'work',
      priority || 'urgentImportant',
      recurringStr,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi tạo công việc mới!' });
      res.status(201).json({ message: 'Tạo công việc thành công!', taskId });
    }
  );
});

// ----------------------------------------------------
// MODULE V: RESCHEDULE / DRAG & DROP WITH REASON
// ----------------------------------------------------
app.patch('/api/tasks/:id/reschedule', (req, res) => {
  const taskId = req.params.id;
  const { newStart, newEnd, reason } = req.body;

  if (!newStart || !newEnd || !reason || !reason.trim()) {
    return res.status(400).json({ error: 'Bắt buộc phải nhập lý do khi đổi lịch công việc!' });
  }

  if (!isValid15MinInterval(newStart) || !isValid15MinInterval(newEnd)) {
    return res.status(400).json({ error: 'Thời gian chỉ cho phép mốc :00, :15, :30, :45!' });
  }

  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err || !task) return res.status(404).json({ error: 'Không tìm thấy công việc!' });
    if (task.completed) {
      return res.status(400).json({ error: 'Công việc đã hoàn thành không thể di chuyển vị trí!' });
    }

    db.run(
      `INSERT INTO reschedule_logs (task_id, user_username, old_start_time, old_end_time, new_start_time, new_end_time, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskId, task.user_username, task.start_time, task.end_time, newStart, newEnd, reason.trim()]
    );

    db.run(
      `UPDATE tasks SET start_time = ?, end_time = ?, delay_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStart, newEnd, reason.trim(), taskId],
      function (err) {
        if (err) return res.status(500).json({ error: 'Lỗi cập nhật thời gian đổi lịch!' });
        res.json({ message: 'Đổi lịch và ghi nhận lý do thành công!' });
      }
    );
  });
});

// ----------------------------------------------------
// MODULE VIII: ACTUAL TIME TRACKING & COMPLETION
// ----------------------------------------------------
app.patch('/api/tasks/:id/complete', (req, res) => {
  const taskId = req.params.id;
  const { actualStart, actualEnd, delayReason } = req.body;

  if (!actualStart || !actualEnd) {
    return res.status(400).json({ error: 'Vui lòng cung cấp thời gian thực tế bắt đầu và kết thúc!' });
  }

  const duration = calculateMinutes(actualStart, actualEnd);

  db.run(
    `UPDATE tasks SET completed = 1, actual_start = ?, actual_end = ?, actual_duration = ?, delay_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [actualStart, actualEnd, duration, delayReason ? delayReason.trim() : null, taskId],
    function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi ghi nhận hoàn thành công việc!' });
      res.json({ message: 'Ghi nhận thời gian thực tế & hoàn thành công việc thành công!', duration });
    }
  );
});

// ----------------------------------------------------
// UPDATE TASK DETAILS
// ----------------------------------------------------
app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, startTime, endTime, category, priority, recurringDays } = req.body;

  if (!title || !startTime || !endTime) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
  }

  const recurringStr = recurringDays && recurringDays.length > 0 ? JSON.stringify(recurringDays) : null;

  db.run(
    `UPDATE tasks SET title = ?, start_time = ?, end_time = ?, category = ?, priority = ?, recurring_days = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [title.trim(), startTime, endTime, category, priority, recurringStr, taskId],
    function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi cập nhật công việc!' });
      res.json({ message: 'Cập nhật công việc thành công!' });
    }
  );
});

// ----------------------------------------------------
// DELETE TASK
// ----------------------------------------------------
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.run('DELETE FROM tasks WHERE id = ?', [taskId], function (err) {
    if (err) return res.status(500).json({ error: 'Lỗi xóa công việc!' });
    res.json({ message: 'Xóa công việc thành công!' });
  });
});

// ----------------------------------------------------
// MODULE VI: POMODORO LOGS
// ----------------------------------------------------
app.post('/api/pomodoro/sessions', (req, res) => {
  const { username, durationMinutes } = req.body;
  if (!username) return res.status(400).json({ error: 'Thiếu username!' });

  db.run(
    'INSERT INTO pomodoro_logs (user_username, duration_minutes) VALUES (?, ?)',
    [username, durationMinutes || 25],
    function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi ghi nhận phiên Pomodoro!' });
      res.status(201).json({ message: 'Ghi nhận phiên tập trung Pomodoro 25m thành công!' });
    }
  );
});

// ----------------------------------------------------
// SERVE PRODUCTION FRONTEND STATIC FILES (SINGLE CONTAINER)
// ----------------------------------------------------
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API Endpoint không tồn tại!' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Backend Express Server
app.listen(PORT, () => {
  console.log(`🚀 ChronoPulse Server đang chạy tại http://localhost:${PORT}`);
});
