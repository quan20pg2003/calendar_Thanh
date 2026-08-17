const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite Database:', err.message);
  } else {
    console.log('✅ Connected to SQLite Database at:', dbPath);
  }
});

// Initialize Database Tables Schema
db.serialize(() => {
  // 1. Users Table (Hardcoded user1 / user2)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);

  // 2. Tasks Table (Stores all scheduled tasks with 15-min interval constraints, category, priority, recurring, actual time)
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_username TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      recurring_days TEXT,
      actual_start TEXT,
      actual_end TEXT,
      actual_duration INTEGER DEFAULT 0,
      delay_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_username) REFERENCES users(username)
    )
  `);

  // 3. Reschedule Logs Table (Tracks history of drag & drop reschedules with delay reasons)
  db.run(`
    CREATE TABLE IF NOT EXISTS reschedule_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      user_username TEXT NOT NULL,
      old_start_time TEXT NOT NULL,
      old_end_time TEXT NOT NULL,
      new_start_time TEXT NOT NULL,
      new_end_time TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);

  // 4. Pomodoro Focus Sessions Log Table
  db.run(`
    CREATE TABLE IF NOT EXISTS pomodoro_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_username TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 25,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default hardcoded accounts (user1 & user2)
  const stmt = db.prepare(`INSERT OR IGNORE INTO users (username, password_hash, name, avatar, role) VALUES (?, ?, ?, ?, ?)`);
  stmt.run('user1', '123456', 'Nguyễn Văn A', '🏠', 'Personal');
  stmt.run('user2', '123456', 'Trần Thị B', '💼', 'Work');
  stmt.finalize();

  console.log('✅ Database Tables & Initial Users Initialized!');
});

module.exports = db;
