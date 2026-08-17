/**
 * ChronoPulse - Core Application Engine V3 (Dedicated 7-Day Horizontal Roll Carousel Week Planner)
 */

document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let currentProfile = StorageManager.getActiveProfile();
    let tasks = StorageManager.loadTasks(currentProfile);
    let settings = StorageManager.loadSettings();
    let currentView = 'timeline';
    let activeStatusFilter = 'all';
    let filterDate = '';
    let searchKeyword = '';
    let selectedCategory = 'work';
    let draggedTaskId = null;
    let notifiedTasks = new Set();
    let hourHeight = 200; // 200px per hour height!

    // Pomodoro State
    let pomodoroState = {
        timer: null,
        secondsLeft: 25 * 60,
        totalSeconds: 25 * 60,
        isRunning: false,
        activeTaskTitle: 'Chưa chọn công việc'
    };

    const categoryLabels = {
        work: '💼 Công việc',
        study: '📚 Học tập',
        fitness: '🏃 Thể thao',
        meals: '🥗 Ăn uống',
        leisure: '🎨 Giải trí',
        sleep: '🛌 Giấc ngủ'
    };

    // Initialize App
    initTheme();
    initProfileDropdown();
    initClockAndSky();
    renderTimelineGrid();
    renderTasks();
    renderTemplatesList();
    updateAnalytics();
    setupEventListeners();
    setupNotificationChecker();

    // -------------------------------------------------------------
    // Profile & Theme Setup
    // -------------------------------------------------------------
    function initProfileDropdown() {
        const select = document.getElementById('profileSelect');
        if (select) {
            select.value = currentProfile;
            select.addEventListener('change', (e) => {
                currentProfile = e.target.value;
                StorageManager.setActiveProfile(currentProfile);
                tasks = StorageManager.loadTasks(currentProfile);
                renderTasks();
                updateAnalytics();
                window.soundEngine.playPop(600);
            });
        }
    }

    function initTheme() {
        if (settings.theme === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('btnThemeToggle').innerText = '☀️';
        } else {
            document.body.classList.remove('light-theme');
            document.getElementById('btnThemeToggle').innerText = '🌙';
        }
        window.soundEngine.isMuted = !settings.soundEnabled;
        document.getElementById('btnSoundToggle').innerText = settings.soundEnabled ? '🔊' : '🔇';
    }

    function initClockAndSky() {
        updateClock();
        setInterval(updateClock, 1000);
    }

    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const liveClockEl = document.getElementById('liveClock');
        if (liveClockEl) liveClockEl.innerText = timeStr;

        const daysVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dateStr = `${daysVi[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        const liveDateEl = document.getElementById('liveDate');
        if (liveDateEl) liveDateEl.innerText = dateStr;

        const headerSky = document.getElementById('headerSky');
        const celestialBody = document.getElementById('celestialBody');

        let skyClass = 'day';
        let isSun = true;

        if (hours >= 4 && hours < 7) {
            skyClass = 'dawn';
        } else if (hours >= 7 && hours < 17) {
            skyClass = 'day';
        } else if (hours >= 17 && hours < 19) {
            skyClass = 'dusk';
        } else {
            skyClass = 'night';
            isSun = false;
        }

        if (headerSky) headerSky.className = `header-sky ${skyClass}`;
        if (celestialBody) {
            celestialBody.className = `celestial-body ${isSun ? 'sun' : 'moon'}`;
        }
    }

    // -------------------------------------------------------------
    // Reminders & Notifications
    // -------------------------------------------------------------
    function setupNotificationChecker() {
        setInterval(checkUpcomingTaskReminders, 30000);
    }

    function checkUpcomingTaskReminders() {
        if (!settings.notificationsEnabled) return;
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        tasks.forEach(t => {
            if (t.completed || notifiedTasks.has(t.id)) return;
            const startMins = ScheduleAnalyzer.timeToMinutes(t.startTime);
            const diff = startMins - currentMins;

            if (diff > 0 && diff <= 10) {
                notifiedTasks.add(t.id);
                window.soundEngine.playWarning();

                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("⏰ Sắp đến giờ công việc!", {
                        body: `"${t.title}" sẽ bắt đầu lúc ${t.startTime} (sau ${diff} phút nữa).`
                    });
                }
            }
        });
    }

    // -------------------------------------------------------------
    // Render 15-Minute Interval Timeline Grid at 200px/hour
    // -------------------------------------------------------------
    function renderTimelineGrid() {
        const grid = document.getElementById('timelineGrid');
        if (!grid) return;

        const slotHeight = hourHeight / 4;
        grid.style.minHeight = `${24 * hourHeight}px`;
        grid.innerHTML = '';

        for (let slot = 0; slot < 96; slot++) {
            const totalMins = slot * 15;
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

            const isFullHour = m === 0;
            const isHalfHour = m === 30;

            const slotRow = document.createElement('div');
            slotRow.className = `hour-row ${isFullHour ? 'full-hour' : ''} ${isHalfHour ? 'half-hour' : ''}`;
            slotRow.style.top = `${slot * slotHeight}px`;
            slotRow.style.height = `${slotHeight}px`;
            slotRow.dataset.mins = totalMins;
            slotRow.dataset.time = timeStr;

            const label = document.createElement('div');
            label.className = `hour-label ${isFullHour ? 'full-hour-label' : ''} ${isHalfHour ? 'half-hour-label' : ''}`;
            label.innerText = timeStr;

            slotRow.appendChild(label);
            
            slotRow.addEventListener('dragover', (e) => {
                e.preventDefault();
                slotRow.classList.add('drag-over');
            });

            slotRow.addEventListener('dragleave', () => {
                slotRow.classList.remove('drag-over');
            });

            slotRow.addEventListener('drop', (e) => {
                e.preventDefault();
                slotRow.classList.remove('drag-over');
                if (draggedTaskId) {
                    moveTaskToMinutes(draggedTaskId, totalMins);
                }
            });

            slotRow.addEventListener('click', (e) => {
                if (e.target === slotRow || e.target === label) {
                    openTaskModalForMinutes(totalMins);
                }
            });

            grid.appendChild(slotRow);
        }
    }

    function moveTaskToMinutes(taskId, newStartMins) {
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return;

        const task = tasks[idx];
        const oldDuration = ScheduleAnalyzer.getTaskDuration(task);
        const newEndMins = (newStartMins + oldDuration) % (24 * 60);

        task.startTime = ScheduleAnalyzer.minutesToTime(newStartMins);
        task.endTime = ScheduleAnalyzer.minutesToTime(newEndMins);

        StorageManager.saveTasks(tasks, currentProfile);
        renderTasks();
        updateAnalytics();
        window.soundEngine.playPop(750);
    }

    function computeParallelColumns(tasksList) {
        const sorted = [...tasksList].sort((a, b) => ScheduleAnalyzer.timeToMinutes(a.startTime) - ScheduleAnalyzer.timeToMinutes(b.startTime));
        
        sorted.forEach(t => {
            const start = ScheduleAnalyzer.timeToMinutes(t.startTime);
            let end = ScheduleAnalyzer.timeToMinutes(t.endTime);
            if (end <= start) end += 24 * 60;
            t._startMins = start;
            t._endMins = end;
        });

        const columns = [];
        sorted.forEach(task => {
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
                const lastInCol = columns[i][columns[i].length - 1];
                if (lastInCol._endMins <= task._startMins) {
                    columns[i].push(task);
                    task._colIndex = i;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                task._colIndex = columns.length;
                columns.push([task]);
            }
        });

        sorted.forEach(task => {
            const overlapping = sorted.filter(t => Math.max(t._startMins, task._startMins) < Math.min(t._endMins, task._endMins));
            const maxCol = Math.max(...overlapping.map(t => t._colIndex));
            task._maxCols = maxCol + 1;
        });

        return sorted;
    }

    function renderTasks() {
        const grid = document.getElementById('timelineGrid');
        if (!grid) return;

        const existingCards = grid.querySelectorAll('.timeline-task-card');
        existingCards.forEach(c => c.remove());

        const analysis = ScheduleAnalyzer.analyze(tasks);
        const overlappingIds = new Set(analysis.overlappingIds);

        const sortedTasks = computeParallelColumns(tasks);

        sortedTasks.forEach(task => {
            const duration = ScheduleAnalyzer.getTaskDuration(task);

            const card = document.createElement('div');
            
            const cardHeightCalc = (duration / 60) * hourHeight - 4;
            const isShortTask = cardHeightCalc < 45;
            card.className = `timeline-task-card category-${task.category} ${task.completed ? 'completed' : ''} ${isShortTask ? 'compact-mode' : ''} ${overlappingIds.has(task.id) ? 'overlap-warning' : ''}`;
            
            const topPx = (task._startMins / 60) * hourHeight;
            const heightPx = Math.max(36, cardHeightCalc);

            const colIdx = task._colIndex || 0;
            const totalCols = task._maxCols || 1;
            const widthPct = (100 / totalCols);
            
            const leftCalc = `calc(105px + (${colIdx * widthPct}% * 0.86))`;
            const widthCalc = `calc((${widthPct}% * 0.86) - 8px)`;

            card.style.top = `${topPx}px`;
            card.style.height = `${heightPx}px`;
            card.style.left = leftCalc;
            card.style.width = widthCalc;

            card.setAttribute('draggable', 'true');

            card.addEventListener('dragstart', (e) => {
                draggedTaskId = task.id;
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', task.id);
            });

            card.addEventListener('dragend', () => {
                draggedTaskId = null;
                card.classList.remove('dragging');
            });

            const isOverlap = overlappingIds.has(task.id);
            const overlapBadge = isOverlap ? '<span style="color:#ef4444; font-weight:800;" title="Trùng giờ!">⚠️</span>' : '';
            const timeRangeText = `⏰ ${task.startTime} đến ${task.endTime}`;

            if (isShortTask) {
                card.innerHTML = `
                    <div class="task-card-main">
                        <div class="task-checkbox" data-action="toggle" data-id="${task.id}">
                            ${task.completed ? '✓' : ''}
                        </div>
                        <span class="task-time-badge">${timeRangeText}</span>
                        <div class="task-title">${escapeHtml(task.title)}</div>
                        ${overlapBadge}
                    </div>
                    <div class="task-actions">
                        <button data-action="edit" data-id="${task.id}" title="Sửa">✏️</button>
                        <button data-action="delete" data-id="${task.id}" title="Xóa">🗑️</button>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="task-card-main">
                        <div class="task-checkbox" data-action="toggle" data-id="${task.id}">
                            ${task.completed ? '✓' : ''}
                        </div>
                        <div class="task-details">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom: 4px;">
                                <span class="task-time-badge">${timeRangeText}</span>
                                ${overlapBadge}
                            </div>
                            <div class="task-title">${escapeHtml(task.title)}</div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button data-action="pomodoro" data-id="${task.id}" title="Tập trung Pomodoro">⏱️</button>
                        <button data-action="edit" data-id="${task.id}" title="Sửa công việc">✏️</button>
                        <button data-action="delete" data-id="${task.id}" title="Xóa công việc">🗑️</button>
                    </div>
                `;
            }

            card.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('[data-action]');
                if (!actionBtn) return;
                handleTaskAction(actionBtn.dataset.action, actionBtn.dataset.id);
            });

            grid.appendChild(card);
        });

        renderCompactList(overlappingIds);
        renderWeekView();
        
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const scrollWrapper = document.getElementById('timelineViewContainer');
        if (scrollWrapper && !scrollWrapper.dataset.scrolled) {
            scrollWrapper.scrollTop = Math.max(0, (currentMins / 60) * hourHeight - 150);
            scrollWrapper.dataset.scrolled = 'true';
        }
    }

    // Render Dedicated 7-Day Horizontal Roll Carousel Week View
    function renderWeekView() {
        const track = document.getElementById('weekRollTrack');
        if (!track) return;

        const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
        track.innerHTML = '';

        days.forEach((dayName, i) => {
            const dayTasks = tasks.filter((t, idx) => idx % 7 === i || tasks.length < 5);
            dayTasks.sort((a, b) => ScheduleAnalyzer.timeToMinutes(a.startTime) - ScheduleAnalyzer.timeToMinutes(b.startTime));

            const dayCard = document.createElement('div');
            dayCard.className = 'week-day-roll-card';

            dayCard.innerHTML = `
                <div class="week-day-header">
                    <div class="week-day-name">📅 ${dayName}</div>
                    <span class="week-day-count-badge">${dayTasks.length} công việc</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; max-height: 520px; padding-right: 4px;">
                    ${dayTasks.length > 0 ? dayTasks.map(t => `
                        <div class="stat-pill category-${t.category}" style="padding: 12px 14px; background: rgba(30, 41, 59, 0.95); border-left: 5px solid var(--cat-${t.category}); border-radius: 10px; display: flex; flex-direction: column; gap: 4px; border: 1px solid var(--card-border);">
                            <div class="task-title" style="font-weight:800; color:#fff !important; font-size: 0.95rem;">${escapeHtml(t.title)}</div>
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <span class="task-time-badge" style="font-size: 0.76rem; padding: 2px 6px;">⏰ ${t.startTime} đến ${t.endTime}</span>
                                <span style="font-size: 0.75rem; color: var(--text-secondary); opacity:0.8;">${categoryLabels[t.category] || ''}</span>
                            </div>
                        </div>
                    `).join('') : '<div style="text-align:center; padding: 30px 10px; color: var(--text-muted); font-size:0.85rem;">Không có công việc nào</div>'}
                </div>
            `;

            track.appendChild(dayCard);
        });
    }

    // Render Compact List View with Date Picker & Combobox Status Filtering
    function renderCompactList() {
        const container = document.getElementById('compactTaskList');
        if (!container) return;
        container.innerHTML = '';

        let filtered = [...tasks];

        if (activeStatusFilter === 'pending') {
            filtered = filtered.filter(t => !t.completed);
        } else if (activeStatusFilter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        }

        if (filterDate.trim()) {
            filtered = filtered.filter(t => t.date === filterDate || !t.date);
        }

        if (searchKeyword.trim()) {
            const kw = searchKeyword.toLowerCase();
            filtered = filtered.filter(t => t.title.toLowerCase().includes(kw) || (t.notes && t.notes.toLowerCase().includes(kw)));
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding: 36px; color: var(--text-secondary); font-weight:700; font-size:1.05rem;">Không tìm thấy công việc phù hợp</div>';
            return;
        }

        filtered.forEach(task => {
            const item = document.createElement('div');
            item.className = `stat-pill category-${task.category} ${task.completed ? 'completed' : ''}`;
            item.style.justifyContent = 'space-between';
            item.style.cursor = 'pointer';
            item.style.padding = '14px 18px';
            item.style.background = '#1e293b';
            item.style.borderLeft = `5px solid var(--cat-${task.category})`;

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:14px;">
                    <div class="task-checkbox" data-action="toggle" data-id="${task.id}">
                        ${task.completed ? '✓' : ''}
                    </div>
                    <div>
                        <div class="task-title" style="font-weight:800; font-size:1.05rem; color:#fff !important;">${escapeHtml(task.title)}</div>
                        <div style="font-size:0.85rem; color:#38bdf8; font-weight:700; font-family: 'JetBrains Mono', monospace; margin-top:2px;">⏰ ${task.startTime} đến ${task.endTime} • ${categoryLabels[task.category] || ''}</div>
                    </div>
                </div>
                <div class="task-actions">
                    <button data-action="edit" data-id="${task.id}" title="Sửa">✏️</button>
                    <button data-action="delete" data-id="${task.id}" title="Xóa">🗑️</button>
                </div>
            `;

            item.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('[data-action]');
                if (!actionBtn) return;
                handleTaskAction(actionBtn.dataset.action, actionBtn.dataset.id);
            });

            container.appendChild(item);
        });
    }

    function handleTaskAction(action, taskId) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        window.soundEngine.playPop(action === 'delete' ? 300 : 700);

        if (action === 'toggle') {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            StorageManager.saveTasks(tasks, currentProfile);
            
            if (tasks[taskIndex].completed) {
                window.soundEngine.playCompleteChime();
                window.confettiEngine.fire();
            }

            renderTasks();
            updateAnalytics();
        } else if (action === 'delete') {
            if (confirm(`Bạn có chắc muốn xóa công việc "${tasks[taskIndex].title}"?`)) {
                tasks.splice(taskIndex, 1);
                StorageManager.saveTasks(tasks, currentProfile);
                renderTasks();
                updateAnalytics();
            }
        } else if (action === 'edit') {
            openTaskModalForEdit(tasks[taskIndex]);
        } else if (action === 'pomodoro') {
            openPomodoroForTask(tasks[taskIndex]);
        }
    }

    // -------------------------------------------------------------
    // Time Allocation Analytics
    // -------------------------------------------------------------
    function updateAnalytics() {
        const analysis = ScheduleAnalyzer.analyze(tasks);

        const completedCount = tasks.filter(t => t.completed).length;
        const totalCount = tasks.length;
        const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        const headerProgressValue = document.getElementById('headerProgressValue');
        if (headerProgressValue) {
            headerProgressValue.innerText = `${completedCount}/${totalCount} (${pct}%)`;
        }

        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const pendingTasks = tasks.filter(t => !t.completed);
        pendingTasks.sort((a, b) => ScheduleAnalyzer.timeToMinutes(a.startTime) - ScheduleAnalyzer.timeToMinutes(b.startTime));
        
        const nextTask = pendingTasks.find(t => ScheduleAnalyzer.timeToMinutes(t.startTime) >= currentMins);
        const headerNextTaskValue = document.getElementById('headerNextTaskValue');
        if (headerNextTaskValue) {
            if (nextTask) {
                headerNextTaskValue.innerText = `${nextTask.title} (${nextTask.startTime})`;
            } else {
                headerNextTaskValue.innerText = totalCount > 0 ? 'Đã xong hết task!' : 'Chưa có lịch';
            }
        }

        drawCategoryPieChart(analysis.breakdown);
    }

    function drawCategoryPieChart(breakdown) {
        const canvas = document.getElementById('categoryPieCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const colors = {
            work: '#818cf8',
            study: '#38bdf8',
            fitness: '#fbbf24',
            meals: '#34d399',
            leisure: '#f472b6',
            sleep: '#c084fc'
        };

        const labels = {
            work: 'Công việc',
            study: 'Học tập',
            fitness: 'Thể thao',
            meals: 'Ăn uống',
            leisure: 'Giải trí',
            sleep: 'Giấc ngủ'
        };

        let startAngle = -Math.PI / 2;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 75;

        let hasData = false;
        Object.entries(breakdown).forEach(([cat, pct]) => {
            if (pct > 0) hasData = true;
            const sliceAngle = (pct / 100) * Math.PI * 2;
            if (sliceAngle > 0) {
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = colors[cat] || '#94a3b8';
                ctx.fill();
                startAngle += sliceAngle;
            }
        });

        if (!hasData) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        const legend = document.getElementById('categoryLegend');
        if (legend) {
            legend.innerHTML = Object.entries(breakdown).map(([cat, pct]) => {
                return `<div style="display:flex; align-items:center; gap:6px;">
                    <span style="width:10px; height:10px; border-radius:50%; background:${colors[cat]};"></span>
                    <span style="color:var(--text-secondary); font-weight:600;">${labels[cat]}: <b>${pct}%</b></span>
                </div>`;
            }).join('');
        }
    }

    // -------------------------------------------------------------
    // Task Modal Handlers
    // -------------------------------------------------------------
    function openTaskModalForMinutes(startMins) {
        document.getElementById('modalTitleText').innerText = 'Thêm Công Việc Mới';
        document.getElementById('taskIdInput').value = '';
        document.getElementById('taskTitleInput').value = '';
        
        const startStr = ScheduleAnalyzer.minutesToTime(startMins);
        const endStr = ScheduleAnalyzer.minutesToTime((startMins + 45) % (24 * 60));

        document.getElementById('taskStartInput').value = startStr;
        document.getElementById('taskEndInput').value = endStr;
        document.getElementById('taskNotesInput').value = '';
        selectCategory('work');

        document.getElementById('taskModal').classList.add('active');
    }

    function openTaskModalForHour(hour) {
        openTaskModalForMinutes(hour * 60);
    }

    function openTaskModalForEdit(task) {
        document.getElementById('modalTitleText').innerText = 'Chỉnh Sửa Công Việc';
        document.getElementById('taskIdInput').value = task.id;
        document.getElementById('taskTitleInput').value = task.title;
        document.getElementById('taskStartInput').value = task.startTime;
        document.getElementById('taskEndInput').value = task.endTime;
        document.getElementById('taskPriorityInput').value = task.priority || 'medium';
        document.getElementById('taskNotesInput').value = task.notes || '';
        selectCategory(task.category || 'work');

        document.getElementById('taskModal').classList.add('active');
    }

    function selectCategory(cat) {
        selectedCategory = cat;
        const options = document.querySelectorAll('.category-option');
        options.forEach(opt => {
            if (opt.dataset.cat === cat) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    // -------------------------------------------------------------
    // Preset Templates Handler
    // -------------------------------------------------------------
    function renderTemplatesList() {
        const container = document.getElementById('templatesContainer');
        if (!container || !window.PRESET_TEMPLATES) return;

        container.innerHTML = window.PRESET_TEMPLATES.map(tpl => `
            <div class="template-card" data-tpl-id="${tpl.id}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <div style="font-weight:800; font-size:1.05rem;">${tpl.name}</div>
                    <span style="font-size:0.75rem; background:rgba(99,102,241,0.25); color:#a5b4fc; padding:2px 8px; border-radius:10px; font-weight:700;">${tpl.badge}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">${tpl.description}</div>
                <button class="btn btn-secondary btn-apply-tpl" data-tpl-id="${tpl.id}" style="width:100%; justify-content:center;">Áp Dụng Mẫu Này</button>
            </div>
        `).join('');

        container.querySelectorAll('.btn-apply-tpl').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tplId = e.target.dataset.tplId;
                applyPresetTemplate(tplId);
            });
        });
    }

    function applyPresetTemplate(tplId) {
        const tpl = window.PRESET_TEMPLATES.find(t => t.id === tplId);
        if (!tpl) return;

        if (confirm(`Bạn có chắc muốn áp dụng mẫu "${tpl.name}"? Lịch trình hiện tại sẽ được cập nhật.`)) {
            tasks = tpl.tasks.map((t, idx) => ({
                id: 'task_v2_' + Date.now() + '_' + idx,
                ...t
            }));
            StorageManager.saveTasks(tasks, currentProfile);
            renderTasks();
            updateAnalytics();
            document.getElementById('templatesModal').classList.remove('active');
            window.soundEngine.playCompleteChime();
        }
    }

    // -------------------------------------------------------------
    // Pomodoro Timer Handler
    // -------------------------------------------------------------
    function openPomodoroForTask(task) {
        pomodoroState.activeTaskTitle = task ? task.title : 'Tập trung công việc';
        document.getElementById('pomodoroTaskName').innerHTML = `Đang tập trung cho: <b>${escapeHtml(pomodoroState.activeTaskTitle)}</b>`;
        document.getElementById('pomodoroModal').classList.add('active');
    }

    function updatePomodoroDisplay() {
        const m = Math.floor(pomodoroState.secondsLeft / 60);
        const s = pomodoroState.secondsLeft % 60;
        const text = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        const el = document.getElementById('pomodoroTimeText');
        if (el) el.innerText = text;
    }

    function startPomodoro() {
        if (pomodoroState.isRunning) return;
        pomodoroState.isRunning = true;
        window.soundEngine.playPop(800);

        pomodoroState.timer = setInterval(() => {
            if (pomodoroState.secondsLeft > 0) {
                pomodoroState.secondsLeft--;
                updatePomodoroDisplay();
            } else {
                clearInterval(pomodoroState.timer);
                pomodoroState.isRunning = false;
                window.soundEngine.playCompleteChime();
                window.confettiEngine.fire();
                alert('🎉 Hết giờ Pomodoro! Hãy dành 5 phút nghỉ ngơi thư giãn!');
            }
        }, 1000);
    }

    function pausePomodoro() {
        if (pomodoroState.timer) {
            clearInterval(pomodoroState.timer);
            pomodoroState.isRunning = false;
            window.soundEngine.playPop(500);
        }
    }

    function resetPomodoro() {
        pausePomodoro();
        pomodoroState.secondsLeft = pomodoroState.totalSeconds;
        updatePomodoroDisplay();
    }

    // -------------------------------------------------------------
    // Event Listeners Setup
    // -------------------------------------------------------------
    function setupEventListeners() {
        document.getElementById('btnAddTask').addEventListener('click', () => openTaskModalForHour(new Date().getHours()));
        document.getElementById('btnTemplates').addEventListener('click', () => document.getElementById('templatesModal').classList.add('active'));
        document.getElementById('btnPomodoro').addEventListener('click', () => openPomodoroForTask(null));

        document.querySelectorAll('.close-modal-btn, #btnCancelTaskForm').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            });
        });

        document.querySelectorAll('.category-option').forEach(opt => {
            opt.addEventListener('click', () => {
                selectCategory(opt.dataset.cat);
                window.soundEngine.playPop(650);
            });
        });

        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('taskIdInput').value;
            const title = document.getElementById('taskTitleInput').value.trim();
            const startTime = document.getElementById('taskStartInput').value;
            const endTime = document.getElementById('taskEndInput').value;
            const priority = document.getElementById('taskPriorityInput').value;
            const notes = document.getElementById('taskNotesInput').value.trim();

            if (!title || !startTime || !endTime) return;

            if (id) {
                const idx = tasks.findIndex(t => t.id === id);
                if (idx !== -1) {
                    tasks[idx] = { ...tasks[idx], title, startTime, endTime, category: selectedCategory, priority, notes };
                }
            } else {
                const newTask = {
                    id: 'task_v2_' + Date.now(),
                    title,
                    startTime,
                    endTime,
                    category: selectedCategory,
                    priority,
                    notes,
                    completed: false
                };
                tasks.push(newTask);
            }

            StorageManager.saveTasks(tasks, currentProfile);
            renderTasks();
            updateAnalytics();
            document.getElementById('taskModal').classList.remove('active');
            window.soundEngine.playPop(900);
        });

        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                currentView = e.target.dataset.view;

                document.getElementById('timelineViewContainer').style.display = currentView === 'timeline' ? 'block' : 'none';
                document.getElementById('weekViewContainer').style.display = currentView === 'week' ? 'block' : 'none';
                document.getElementById('listViewContainer').style.display = currentView === 'list' ? 'block' : 'none';
                window.soundEngine.playPop(600);
            });
        });

        // Horizontal Roll Scroll Controls for Week View
        const rollTrack = document.getElementById('weekRollTrack');
        const btnRollLeft = document.getElementById('btnRollWeekLeft');
        const btnRollRight = document.getElementById('btnRollWeekRight');

        if (btnRollLeft && rollTrack) {
            btnRollLeft.addEventListener('click', () => {
                rollTrack.scrollBy({ left: -340, behavior: 'smooth' });
                window.soundEngine.playPop(600);
            });
        }
        if (btnRollRight && rollTrack) {
            btnRollRight.addEventListener('click', () => {
                rollTrack.scrollBy({ left: 340, behavior: 'smooth' });
                window.soundEngine.playPop(600);
            });
        }

        // Quick List View Filters
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchKeyword = e.target.value;
                renderCompactList();
            });
        }

        const dateInput = document.getElementById('filterDateInput');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                filterDate = e.target.value;
                renderCompactList();
            });
        }

        const statusSelect = document.getElementById('statusFilterSelect');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                activeStatusFilter = e.target.value;
                renderCompactList();
                window.soundEngine.playPop(600);
            });
        }

        document.getElementById('btnThemeToggle').addEventListener('click', () => {
            settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
            StorageManager.saveSettings(settings);
            initTheme();
            window.soundEngine.playPop(750);
        });

        document.getElementById('btnSoundToggle').addEventListener('click', () => {
            settings.soundEnabled = !settings.soundEnabled;
            StorageManager.saveSettings(settings);
            initTheme();
        });

        const btnNotify = document.getElementById('btnNotificationToggle');
        if (btnNotify) {
            btnNotify.addEventListener('click', () => {
                if ("Notification" in window) {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            settings.notificationsEnabled = true;
                            StorageManager.saveSettings(settings);
                            alert("🔔 Đã bật thông báo nhắc nhở trước 10 phút!");
                        } else {
                            alert("⚠️ Vui lòng cấp quyền Notification trong trình duyệt!");
                        }
                    });
                }
            });
        }

        document.getElementById('btnStartPomodoro').addEventListener('click', startPomodoro);
        document.getElementById('btnPausePomodoro').addEventListener('click', pausePomodoro);
        document.getElementById('btnResetPomodoro').addEventListener('click', resetPomodoro);

        document.querySelectorAll('.ambient-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.ambient-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const type = e.target.dataset.ambient;
                window.soundEngine.startAmbient(type);
            });
        });

        document.getElementById('ambientVolRange').addEventListener('input', (e) => {
            window.soundEngine.setAmbientVolume(parseFloat(e.target.value));
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }
});
