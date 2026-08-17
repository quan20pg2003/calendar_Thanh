/**
 * LocalStorage & Data Persistence Manager (V2 Clean Non-Overlapping Engine)
 */
const STORAGE_KEY_PREFIX = 'chrono_pulse_v2_profile_';
const ACTIVE_PROFILE_KEY = 'chrono_pulse_v2_active_profile';
const SETTINGS_KEY = 'chrono_pulse_v2_settings';

const StorageManager = {
    getActiveProfile() {
        return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'personal';
    },

    setActiveProfile(profileId) {
        localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    },

    getProfiles() {
        return [
            { id: 'personal', name: '🏠 Cá Nhân & Gia Đình', icon: '🏠' },
            { id: 'work', name: '💼 Công Việc & Dự Án', icon: '💼' },
            { id: 'study', name: '📚 Học Tập & Thi Cử', icon: '📚' }
        ];
    },

    loadTasks(profileId = this.getActiveProfile()) {
        try {
            const data = localStorage.getItem(STORAGE_KEY_PREFIX + profileId);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error('Failed to read tasks:', e);
        }

        // Clean non-overlapping default schedule template
        const defaultTemplate = window.PRESET_TEMPLATES ? window.PRESET_TEMPLATES[0] : null;
        if (defaultTemplate) {
            const tasksWithIds = defaultTemplate.tasks.map((t, idx) => ({
                id: 'task_v2_' + Date.now() + '_' + idx,
                ...t
            }));
            this.saveTasks(tasksWithIds, profileId);
            return tasksWithIds;
        }
        return [];
    },

    saveTasks(tasks, profileId = this.getActiveProfile()) {
        try {
            localStorage.setItem(STORAGE_KEY_PREFIX + profileId, JSON.stringify(tasks));
        } catch (e) {
            console.error('Failed to save tasks:', e);
        }
    },

    loadSettings() {
        try {
            const data = localStorage.getItem(SETTINGS_KEY);
            if (data) return JSON.parse(data);
        } catch (e) {}
        return {
            theme: 'dark',
            soundEnabled: true,
            notificationsEnabled: false,
            ambientVolume: 0.3,
            hourHeight: 100 // Default 100px per hour for maximum clarity
        };
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {}
    },

    exportData(tasks) {
        const payload = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            profile: this.getActiveProfile(),
            tasks: tasks
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `thoi_gian_bieu_${this.getActiveProfile()}_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    exportGoogleCalendar(tasks) {
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//ChronoPulse Daily Schedule//VN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];

        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        tasks.forEach(t => {
            const startClean = t.startTime.replace(':', '') + '00';
            const endClean = t.endTime.replace(':', '') + '00';

            icsContent.push('BEGIN:VEVENT');
            icsContent.push(`UID:${t.id}@chronopulse.local`);
            icsContent.push(`DTSTAMP:${todayStr}T000000Z`);
            icsContent.push(`DTSTART:${todayStr}T${startClean}`);
            icsContent.push(`DTEND:${todayStr}T${endClean}`);
            icsContent.push(`SUMMARY:${t.title}`);
            icsContent.push(`DESCRIPTION:${t.notes ? t.notes.replace(/\n/g, ' ') : 'ChronoPulse Task'}`);
            icsContent.push('END:VEVENT');
        });

        icsContent.push('END:VCALENDAR');

        const icsData = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent.join('\r\n'));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", icsData);
        downloadAnchor.setAttribute("download", `chronopulse_gcal_${todayStr}.ics`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    importData(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed && Array.isArray(parsed.tasks)) {
                    this.saveTasks(parsed.tasks);
                    callback(null, parsed.tasks);
                } else if (Array.isArray(parsed)) {
                    this.saveTasks(parsed);
                    callback(null, parsed);
                } else {
                    callback('Định dạng file JSON không hợp lệ!');
                }
            } catch (err) {
                callback('Không thể đọc file JSON này!');
            }
        };
        reader.readAsText(file);
    }
};

window.StorageManager = StorageManager;
