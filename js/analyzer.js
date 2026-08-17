/**
 * Schedule Health Analyzer & Overlap Detector
 * Analyzes schedule balance, sleep, focus, fitness, and time conflicts.
 */

const ScheduleAnalyzer = {
    timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + (m || 0);
    },

    minutesToTime(mins) {
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    },

    // Get duration in minutes handling overnight tasks (e.g. 23:00 to 06:00 = 7 hours)
    getTaskDuration(task) {
        const start = this.timeToMinutes(task.startTime);
        let end = this.timeToMinutes(task.endTime);
        if (end <= start) {
            end += 24 * 60; // Overnight task
        }
        return end - start;
    },

    // Find all overlapping task pairs
    detectOverlaps(tasks) {
        const overlaps = new Set();
        for (let i = 0; i < tasks.length; i++) {
            const t1 = tasks[i];
            const s1 = this.timeToMinutes(t1.startTime);
            let e1 = this.timeToMinutes(t1.endTime);
            if (e1 <= s1) e1 += 24 * 60;

            for (let j = i + 1; j < tasks.length; j++) {
                const t2 = tasks[j];
                const s2 = this.timeToMinutes(t2.startTime);
                let e2 = this.timeToMinutes(t2.endTime);
                if (e2 <= s2) e2 += 24 * 60;

                // Check overlap
                if (Math.max(s1, s2) < Math.min(e1, e2)) {
                    overlaps.add(t1.id);
                    overlaps.add(t2.id);
                }
            }
        }
        return Array.from(overlaps);
    },

    // Analyze schedule health score (0-100) and provide feedback
    analyze(tasks) {
        if (!tasks || tasks.length === 0) {
            return {
                score: 0,
                rating: 'Chưa có lịch trình',
                color: '#94a3b8',
                breakdown: {},
                advice: ['Hãy thêm công việc hoặc chọn một lịch trình mẫu để bắt đầu ngày mới!']
            };
        }

        const categoryMinutes = {
            work: 0,
            study: 0,
            fitness: 0,
            meals: 0,
            leisure: 0,
            sleep: 0
        };

        let totalTrackedMinutes = 0;
        tasks.forEach(task => {
            const duration = this.getTaskDuration(task);
            const cat = task.category || 'work';
            if (categoryMinutes[cat] !== undefined) {
                categoryMinutes[cat] += duration;
            } else {
                categoryMinutes.work += duration;
            }
            totalTrackedMinutes += duration;
        });

        // Convert to hours
        const sleepHours = categoryMinutes.sleep / 60;
        const workHours = (categoryMinutes.work + categoryMinutes.study) / 60;
        const fitnessMins = categoryMinutes.fitness;
        const mealsMins = categoryMinutes.meals;

        let score = 100;
        const advice = [];

        // Check Overlaps
        const overlappingIds = this.detectOverlaps(tasks);
        if (overlappingIds.length > 0) {
            const conflictCount = overlappingIds.length / 2;
            score -= Math.min(30, conflictCount * 15);
            advice.push(`⚠️ Có ${overlappingIds.length} khung giờ trùng lặp! Hãy điều chỉnh lại để tránh chồng chéo.`);
        }

        // 1. Sleep evaluation (Ideal: 7 - 9 hours)
        if (sleepHours < 6) {
            score -= 20;
            advice.push(`🛌 Giấc ngủ hiện tại (${sleepHours.toFixed(1)}h) quá ngắn! Thiếu ngủ làm giảm 40% khả năng tập trung.`);
        } else if (sleepHours > 9.5) {
            score -= 10;
            advice.push(`🛌 Giấc ngủ hơi dài (${sleepHours.toFixed(1)}h). Hãy thử duy trì 7.5h - 8h để tràn đầy năng lượng hơn.`);
        } else {
            advice.push(`✅ Giấc ngủ (${sleepHours.toFixed(1)}h) rất hợp lý và đạt chuẩn y khoa!`);
        }

        // 2. Work/Study evaluation (Ideal: 4 - 9 hours)
        if (workHours > 10) {
            score -= 15;
            advice.push(`💼 Thời gian làm việc/học tập (${workHours.toFixed(1)}h) quá tải! Cực kỳ dễ dẫn tới Burnout.`);
        } else if (workHours >= 4 && workHours <= 9) {
            advice.push(`🎯 Cường độ làm việc/học tập (${workHours.toFixed(1)}h) cân bằng & hiệu quả.`);
        } else if (workHours < 3) {
            advice.push(`💡 Ngày làm việc khá thong thả (${workHours.toFixed(1)}h). Thích hợp cho ngày nghỉ hoặc Relax.`);
        }

        // 3. Fitness evaluation (Ideal: 30 - 90 mins)
        if (fitnessMins === 0) {
            score -= 15;
            advice.push(`🏃 Bạn chưa xếp lịch tập thể thao! Chỉ cần 30 phút rèn luyện để tiết Endorphin giảm stress.`);
        } else if (fitnessMins >= 30 && fitnessMins <= 90) {
            score += 5; // Bonus
            advice.push(`🔥 Tuyệt vời! Bạn dành ${fitnessMins} phút tập luyện giúp cơ thể khỏe mạnh.`);
        }

        // 4. Meals & Rest evaluation (Ideal: >= 90 mins)
        if (mealsMins < 60) {
            score -= 10;
            advice.push(`🥗 Thời gian ăn uống & nghỉ ngơi quá gấp gáp (${mealsMins} phút). Hạn chế vừa ăn vừa làm.`);
        }

        // Ensure score bounds
        score = Math.max(10, Math.min(100, Math.round(score)));

        let rating = 'Xuất Sắc 🌟';
        let color = '#10b981'; // green

        if (score >= 85) {
            rating = 'Cực Kỳ Cân Bằng 🌟';
            color = '#10b981';
        } else if (score >= 70) {
            rating = 'Rất Hợp Lý 🟢';
            color = '#3b82f6';
        } else if (score >= 50) {
            rating = 'Khá Tốt 🟡';
            color = '#f59e0b';
        } else {
            rating = 'Cần Cải Thiện ⚠️';
            color = '#ef4444';
        }

        // Percentages for chart
        const total = totalTrackedMinutes || 1;
        const breakdown = {
            work: Math.round((categoryMinutes.work / total) * 100),
            study: Math.round((categoryMinutes.study / total) * 100),
            fitness: Math.round((categoryMinutes.fitness / total) * 100),
            meals: Math.round((categoryMinutes.meals / total) * 100),
            leisure: Math.round((categoryMinutes.leisure / total) * 100),
            sleep: Math.round((categoryMinutes.sleep / total) * 100)
        };

        return {
            score,
            rating,
            color,
            breakdown,
            categoryMinutes,
            advice,
            overlappingIds
        };
    }
};

window.ScheduleAnalyzer = ScheduleAnalyzer;
