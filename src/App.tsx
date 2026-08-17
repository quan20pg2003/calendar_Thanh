import React, { useState, useEffect } from 'react';
import { User, ViewMode, FilterMode, Task } from './types';
import { getStoredUser, setStoredUser, getTasksForDate, saveTasksForDate } from './utils/storage';
import { Header } from './components/Header';
import { TimelineView } from './components/TimelineView';
import { WeekView } from './components/WeekView';
import { ListView } from './components/ListView';
import { LoginModal } from './components/LoginModal';
import { TaskModal } from './components/TaskModal';
import { ActualTimeModal } from './components/ActualTimeModal';
import { PomodoroModal } from './components/PomodoroModal';
import { NotebookLMWidget } from './components/NotebookLMWidget';
import confetti from 'canvas-confetti';

export function App() {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [tasks, setTasks] = useState<Task[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isActualTimeModalOpen, setIsActualTimeModalOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);

  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isNotebookLMOpen, setIsNotebookLMOpen] = useState(false);

  // Load tasks when user or selectedDate changes
  useEffect(() => {
    if (user) {
      const loaded = getTasksForDate(user.username, selectedDate);
      setTasks(loaded);
    }
  }, [user, selectedDate]);

  // Save tasks helper
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    if (user) {
      saveTasksForDate(user.username, selectedDate, newTasks);
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setStoredUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setStoredUser(null);
  };

  // Filter tasks based on filterMode
  const filteredTasks = tasks.filter((task) => {
    if (filterMode === 'completed') return task.completed;
    if (filterMode === 'incomplete') return !task.completed;
    return true;
  });

  // Task Handlers
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      const updated = tasks.filter((t) => t.id !== taskId);
      updateTasks(updated);
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'date'>, taskId?: string) => {
    if (taskId) {
      // Edit existing task
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...taskData } : t));
      updateTasks(updated);
    } else {
      // Add new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        date: selectedDate,
        ...taskData,
      };
      const updated = [...tasks, newTask];
      updateTasks(updated);
    }
  };

  const handleToggleComplete = (task: Task) => {
    if (!task.completed) {
      // Prompt actual time modal before marking completed (Requirement VIII)
      setCompletingTask(task);
      setIsActualTimeModalOpen(true);
    } else {
      // Mark incomplete
      const updated = tasks.map((t) =>
        t.id === task.id ? { ...t, completed: false } : t
      );
      updateTasks(updated);
    }
  };

  const handleConfirmActualTime = (actualData: {
    actualStart: string;
    actualEnd: string;
    actualDuration: number;
    delayReason?: string;
  }) => {
    if (!completingTask) return;

    const updated = tasks.map((t) =>
      t.id === completingTask.id
        ? {
            ...t,
            completed: true,
            ...actualData,
          }
        : t
    );
    updateTasks(updated);
    setCompletingTask(null);

    // Confetti celebration
    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  const handleTaskDropUpdate = (taskId: string, newStart: string, newEnd: string, delayReason?: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            startTime: newStart,
            endTime: newEnd,
            delayReason: delayReason || t.delayReason,
          }
        : t
    );
    updateTasks(updated);
  };

  const handleImportNotebookLMTasks = (
    sampleTasks: Array<{ title: string; category: any; priority: any; startTime: string; endTime: string }>
  ) => {
    const newTasks: Task[] = sampleTasks.map((st, idx) => ({
      id: `task-notebooklm-${Date.now()}-${idx}`,
      title: st.title,
      startTime: st.startTime,
      endTime: st.endTime,
      category: st.category,
      priority: st.priority,
      completed: false,
      date: selectedDate,
    }));
    updateTasks([...tasks, ...newTasks]);
  };

  return (
    <div className="min-h-screen bg-[#f0f8fd] p-4 md:p-8 text-slate-800 font-jakarta selection:bg-[#cbe8fa] selection:text-[#0b4d75]">
      {/* Show Login Overlay if not logged in */}
      {!user ? (
        <LoginModal onLoginSuccess={handleLogin} />
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Daily Header */}
          <Header
            user={user}
            onLogout={handleLogout}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            tasks={tasks}
            onOpenAddTask={handleOpenAddTask}
            onOpenPomodoro={() => setIsPomodoroOpen(true)}
            onOpenNotebookLM={() => setIsNotebookLMOpen(true)}
          />

          {/* View Switcher Content */}
          <main>
            {viewMode === 'timeline' && (
              <TimelineView
                tasks={filteredTasks}
                onEditTask={handleOpenEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onTaskDropUpdate={handleTaskDropUpdate}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                tasks={filteredTasks}
                onEditTask={handleOpenEditTask}
                onToggleComplete={handleToggleComplete}
              />
            )}

            {viewMode === 'list' && (
              <ListView
                tasks={filteredTasks}
                onEditTask={handleOpenEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
              />
            )}
          </main>

          {/* Modals */}
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSave={handleSaveTask}
            initialTask={editingTask}
            selectedDate={selectedDate}
          />

          <ActualTimeModal
            isOpen={isActualTimeModalOpen}
            onClose={() => setIsActualTimeModalOpen(false)}
            onConfirm={handleConfirmActualTime}
            task={completingTask}
          />

          <PomodoroModal
            isOpen={isPomodoroOpen}
            onClose={() => setIsPomodoroOpen(false)}
          />

          <NotebookLMWidget
            isOpen={isNotebookLMOpen}
            onClose={() => setIsNotebookLMOpen(false)}
            onImportTasks={handleImportNotebookLMTasks}
          />
        </div>
      )}
    </div>
  );
}

export default App;
