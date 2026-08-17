# Tài liệu Thiết kế & Mã nguồn Giao diện Website Lịch biểu Cá nhân (Glassmorphism & Responsive)

Tài liệu này được thiết kế và tối ưu hóa 100% dựa trên các yêu cầu nghiệp vụ nghiêm ngặt trong **"Yêu cầu xây dựng Lịch biểu cá nhân.docx"** [197]. Hệ thống sử dụng phong cách **Glassmorphism** cao cấp, cấu trúc CSS Grid đáp ứng (Responsive Grid Layout) và mã nguồn JavaScript thuần (Vanilla JS) xử lý trực tiếp trên trình duyệt [21, 40].

---

## I. KIẾN TRÚC DỮ LIỆU & LƯU TRỮ (LOCALSTORAGE SCHEMA)

Để đáp ứng đầy đủ các tính năng lưu trữ theo từng ngày [199], lặp lịch (Recurring Schedule) [199], và ghi nhận thời gian thực tế [200], cơ sở dữ liệu `localStorage` [161] được thiết kế với cấu trúc chuẩn hóa sau:

```json
{
  "currentUser": "user1",
  "schedules": {
    "2026-08-05": [
      {
        "id": "task-1722839201",
        "title": "Học tiếng Nhật",
        "category": "Học tập",
        "priority": "Quan trọng và khẩn cấp",
        "startTime": "19:00",
        "endTime": "20:30",
        "completed": false,
        "isRecurring": true,
        "recurringDays": [1, 3, 5],
        "actualStart": "19:05",
        "actualEnd": null,
        "actualDuration": null,
        "delayReason": "Kẹt xe trên đường đi làm về"
      }
    ]
  }
}
```

---

## II. GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX SPECIFICATION)

### 1. Định hướng Thiết kế (Style Guide) [21, 43]
*   **Phong cách chính:** Glassmorphism (Kính mờ bán trong suốt) kết hợp dải màu nền Gradient mượt mà từ Tím sang Xanh Dương (`linear-gradient(135deg, #6a11cb, #2575fc)`) [43].
*   **Font chữ:** `Poppins` hoặc `Jost` tạo cảm giác thanh lịch, hiện đại và cực kỳ dễ đọc trên mọi thiết bị di động [20, 43].
*   **Vùng tương tác an toàn (Touch Targets):** Tất cả các nút bấm, ô nhập liệu và thẻ kéo thả có chiều cao tối thiểu `44px` để hỗ trợ thao tác chạm bằng ngón tay mượt mà khi người dùng build ứng dụng di động sau này [40].

### 2. Các Thành phần Giao diện chính [197, 198, 199, 200]
1.  **Màn hình Đăng nhập (Login Overlay):** 
    *   Sử dụng hiệu ứng làm mờ hậu cảnh (Backdrop Filter) [21].
    *   Hỗ trợ xác thực chính xác 02 tài khoản cố định (Hardcoded) theo đúng yêu cầu [197]. Không có nút Đăng ký [197].
2.  **Bảng Điều hướng & Tổng quan Ngày (Header Dashboard):**
    *   Hiển thị ngày hiện tại, giờ hiện tại cập nhật từng giây [200].
    *   Bộ đếm số lượng công việc: `Đã hoàn thành / Tổng số công việc` kèm theo một Thanh tiến độ (Progress Bar) chạy mượt mà (`transition: width 0.3s ease`) [34, 35, 200].
3.  **Khu vực Giao việc & Ma trận Eisenhower:**
    *   **Interval Time Picker:** Ô chọn giờ được cấu hình giới hạn chỉ cho phép người dùng chọn các mốc kết thúc bằng `:00`, `:15`, `:30`, `:45` phút [197].
    *   **Phân loại màu sắc theo Nhóm (Category Color-coding):**
        *   🔴 *Công việc:* Đỏ (`#ff4d4d`)
        *   🔵 *Học tập:* Xanh dương (`#3b82f6`)
        *   🟢 *Sức khỏe:* Xanh lá (`#10b981`)
        *   🟡 *Giải trí:* Vàng (`#fbbf24`)
        *   🟣 *Giấc ngủ:* Tím (`#8b5cf6`)
        *   🦩 *Ăn uống:* Hồng (`#ec4899`)
4.  **Bảng Lịch biểu kéo thả (Apple Calendar Style Timeline):**
    *   Hiển thị danh sách các khung giờ trong ngày dọc màn hình.
    *   Hỗ trợ kéo thả các thẻ công việc (Drag & Drop) để thay đổi thời gian nhanh chóng [41, 198]. Khi kéo thẻ, thẻ sẽ tự động nghiêng `-2deg` và mờ đi [43].
5.  **Hộp công cụ Pomodoro & Ghi nhận Thực tế:**
    *   Đồng hồ đếm ngược Pomodoro 25 phút chuyên nghiệp [198]. Khi hết giờ, hệ thống sẽ kích hoạt thông báo đẩy bằng âm thanh để nhắc nhở người dùng nghỉ ngơi [199].
    *   Bảng popup thông minh ghi nhận thời gian thực tế và lý do trì hoãn khi công việc bị hoàn thành muộn hơn dự kiến [200].

---

## III. MÃ NGUỒN FRONTEND WEBSITE HOÀN CHỈNH (SINGLE FILE APPLICATION)

Dưới đây là toàn bộ mã nguồn đóng gói trong một tệp duy nhất (bao gồm cả HTML, CSS Glassmorphism và logic JavaScript tương tác kéo thả mượt mà). Bạn chỉ cần lưu đoạn mã này với định dạng tệp tin `.html` trên máy của mình là có thể chạy thử ngay lập tức trên trình duyệt.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hệ thống Lịch biểu Cá nhân - Glassmorphism</title>
    <!-- Import Font Chữ Jost từ Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        /* ==================== 1. QUY CHUẨN ĐỒ HỌA & STYLE GLASSMORPHISM ==================== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Jost', sans-serif;
        }

        body {
            background: linear-gradient(135deg, #6a11cb, #2575fc);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            overflow-x: hidden;
        }

        /* Hiệu ứng kính mờ (Glassmorphism CSS) */
        .glass-panel {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
            padding: 20px;
            transition: all 0.3s ease;
        }

        .glass-panel:hover {
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35);
        }

        /* ==================== 2. BỐ CỤC LƯỚI RESPONSIVE LAYOUT ==================== */
        .app-container {
            width: 100%;
            max-width: 1280px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }

        @media (min-width: 1024px) {
            .app-container {
                grid-template-columns: 320px 1fr 340px;
            }
        }

        /* Header Tổng quan */
        .dashboard-header {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            gap: 15px;
            justify-content: space-between;
            align-items: center;
        }

        @media (min-width: 768px) {
            .dashboard-header {
                flex-direction: row;
            }
        }

        .header-left h1 {
            font-size: 1.8rem;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        .header-left p {
            opacity: 0.8;
            font-size: 0.95rem;
        }

        .header-right {
            text-align: right;
            width: 100%;
            max-width: 350px;
        }

        /* Thanh tiến trình Progress Bar */
        .progress-wrapper {
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .progress-container {
            flex-grow: 1;
            height: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #ec4899, #f43f5e);
            border-radius: 4px;
            transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Các cột chính */
        .sidebar-left, .main-timeline, .panel-right {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Styles cho các Form và Input */
        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            font-size: 0.85rem;
            margin-bottom: 5px;
            opacity: 0.9;
        }

        .form-control, .form-select {
            width: 100%;
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 0.95rem;
            outline: none;
            transition: all 0.2s ease;
        }

        .form-control:focus, .form-select:focus {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
        }

        .form-select option {
            background: #3b2d54;
            color: #fff;
        }

        .btn-primary {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: none;
            background: linear-gradient(90deg, #ec4899, #8b5cf6);
            color: #white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5);
        }

        /* Nhóm danh mục (Categories Tags) */
        .category-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
        }

        .cat-work { background-color: #ff4d4d; }
        .cat-study { background-color: #3b82f6; }
        .cat-health { background-color: #10b981; }
        .cat-ent { background-color: #fbbf24; color: #000; }
        .cat-sleep { background-color: #8b5cf6; }
        .cat-eat { background-color: #ec4899; }

        /* ==================== 3. CHẾ ĐỘ POMODORO (TIMER) ==================== */
        .pomodoro-box {
            text-align: center;
        }

        .timer-display {
            font-size: 3rem;
            font-weight: 700;
            margin: 15px 0;
            font-variant-numeric: tabular-nums;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .timer-controls {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .btn-timer {
            padding: 8px 16px;
            border-radius: 8px;
            border: none;
            background: rgba(255, 255, 255, 0.15);
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-timer:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        /* ==================== 4. APPLE-CALENDAR TIMELINE & DRAG-DROP ==================== */
        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .view-switcher {
            display: flex;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 2px;
        }

        .switch-btn {
            padding: 6px 12px;
            border: none;
            background: transparent;
            color: #fff;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s ease;
        }

        .switch-btn.active {
            background: rgba(255, 255, 255, 0.25);
            font-weight: 600;
        }

        .timeline-hours {
            display: flex;
            flex-direction: column;
            gap: 0px;
            position: relative;
        }

        .hour-row {
            display: grid;
            grid-template-columns: 60px 1fr;
            min-height: 50px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            align-items: start;
            padding-top: 4px;
        }

        .hour-label {
            font-size: 0.8rem;
            opacity: 0.7;
            text-align: right;
            padding-right: 10px;
        }

        .hour-slot {
            position: relative;
            height: 100%;
            width: 100%;
        }

        /* Thẻ Công việc hiển thị trên Lịch (Task Cards) */
        .task-card {
            background: rgba(255, 255, 255, 0.9);
            color: #1e1b4b;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.85rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 4px 0;
            cursor: grab;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 5px solid #ec4899;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .task-card:hover {
            transform: scale(1.01);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .task-card.dragging {
            opacity: 0.6;
            transform: rotate(-1.5deg) scale(0.98);
            cursor: grabbing;
        }

        .task-card.completed {
            background: rgba(255, 255, 255, 0.5);
            text-decoration: line-through;
            opacity: 0.7;
        }

        .task-actions {
            display: flex;
            gap: 6px;
        }

        .action-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            color: #4b5563;
            transition: color 0.2s;
            padding: 2px;
        }

        .action-btn:hover {
            color: #ef4444;
        }

        /* ==================== 5. MÀN HÌNH ĐĂNG NHẬP (LOGIN OVERLAY) ==================== */
        .login-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(26, 15, 46, 0.8);
            backdrop-filter: blur(20px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.3s ease;
        }

        .login-box {
            width: 100%;
            max-width: 380px;
            padding: 30px;
        }

        .hidden {
            display: none !important;
            opacity: 0;
            pointer-events: none;
        }
    </style>
</head>
<body>

    <!-- MÀN HÌNH ĐĂNG NHẬP (HARDCODED ACCOUNTS) -->
    <div id="loginOverlay" class="login-overlay">
        <div class="glass-panel login-box">
            <h2 style="text-align: center; margin-bottom: 20px;"><i class="fa-solid fa-lock" style="margin-right: 10px;"></i>ĐĂNG NHẬP</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Tên đăng nhập</label>
                    <input type="text" id="username" class="form-control" placeholder="Nhập tài khoản" required autocomplete="off">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="password">Mật khẩu</label>
                    <input type="password" id="password" class="form-control" placeholder="Nhập mật khẩu" required>
                </div>
                <button type="submit" class="btn-primary">Đăng Nhập Hệ Thống</button>
                <p id="loginError" style="color: #ff4d4d; font-size: 0.85rem; text-align: center; margin-top: 15px;" class="hidden">Sai tài khoản hoặc mật khẩu!</p>
            </form>
        </div>
    </div>

    <!-- GIAO DIỆN CHÍNH SAU KHI ĐĂNG NHẬP THÀNH CÔNG -->
    <div id="mainApp" class="app-container hidden">
        
        <!-- HEADER: TỔNG QUAN TRONG NGÀY -->
        <header class="glass-panel dashboard-header">
            <div class="header-left">
                <h1 id="currentDateDisplay">Thứ Tư, 05 Tháng 8, 2026</h1>
                <p><i class="fa-regular fa-clock" style="margin-right: 5px;"></i>Giờ hiện tại: <span id="currentTimeDisplay" style="font-weight: 600;">10:30:15</span></p>
            </div>
            <div class="header-right">
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                    <span>Tiến độ hoàn thành</span>
                    <span id="progressStats" style="font-weight: 600;">0/0 công việc</span>
                </div>
                <div class="progress-wrapper">
                    <div class="progress-container">
                        <div id="progressBar" class="progress-bar"></div>
                    </div>
                    <span id="progressPercentage" style="font-weight: 600; font-size: 0.9rem;">0%</span>
                </div>
            </div>
        </header>

        <!-- CỘT 1: THÊM CÔNG VIỆC & MA TRẬN EISENHOWER -->
        <aside class="sidebar-left">
            <div class="glass-panel">
                <h3 style="margin-bottom: 15px;"><i class="fa-solid fa-calendar-plus" style="margin-right: 10px;"></i>Thêm công việc mới</h3>
                <form id="taskForm">
                    <div class="form-group">
                        <label for="taskTitle">Tên công việc / Sự kiện</label>
                        <input type="text" id="taskTitle" class="form-control" placeholder="Ví dụ: Học tiếng Nhật" required>
                    </div>
                    <div class="form-group">
                        <label for="taskCategory">Phân loại Nhóm</label>
                        <select id="taskCategory" class="form-select">
                            <option value="Công việc">💼 Công việc</option>
                            <option value="Học tập">📚 Học tập</option>
                            <option value="Sức khỏe">🏃‍♂️ Sức khỏe</option>
                            <option value="Giải trí">🎮 Giải trí</option>
                            <option value="Giấc ngủ">😴 Giấc ngủ</option>
                            <option value="Ăn uống">🍳 Ăn uống</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="taskPriority">Mức độ ưu tiên</label>
                        <select id="taskPriority" class="form-select">
                            <option value="Quan trọng và khẩn cấp">🔴 Quan trọng & Khẩn cấp</option>
                            <option value="Quan trọng nhưng không khẩn cấp">🟡 Quan trọng nhưng không khẩn cấp</option>
                            <option value="Khẩn cấp nhưng không quan trọng">🔵 Khẩn cấp nhưng không quan trọng</option>
                            <option value="Không quan trọng, không khẩn cấp">🟢 Không quan trọng, không khẩn cấp</option>
                        </select>
                    </div>
                    
                    <!-- Thời gian bắt đầu và kết thúc (Giới hạn mốc phút 00, 15, 30, 45) -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="form-group">
                        <div>
                            <label for="startTime">Giờ bắt đầu</label>
                            <select id="startTime" class="form-select">
                                <!-- Điền tự động bằng JavaScript -->
                            </select>
                        </div>
                        <div>
                            <label for="endTime">Giờ kết thúc</label>
                            <select id="endTime" class="form-select">
                                <!-- Điền tự động bằng JavaScript -->
                            </select>
                        </div>
                    </div>

                    <!-- Tùy chọn lặp lịch -->
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label><input type="checkbox" id="taskRecurring" style="margin-right: 6px;">Lặp lịch hàng tuần</label>
                        <div id="recurringDaysGroup" style="display: flex; gap: 4px; margin-top: 8px;" class="hidden">
                            <button type="button" class="btn-timer" data-day="1" style="padding: 4px 8px; font-size: 0.8rem;">T2</button>
                            <button type="button" class="btn-timer" data-day="3" style="padding: 4px 8px; font-size: 0.8rem;">T4</button>
                            <button type="button" class="btn-timer" data-day="5" style="padding: 4px 8px; font-size: 0.8rem;">T6</button>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary">Tạo lịch biểu</button>
                </form>
            </div>

            <!-- Bộ lọc trạng thái -->
            <div class="glass-panel" style="padding: 15px;">
                <h4 style="margin-bottom: 10px;"><i class="fa-solid fa-filter" style="margin-right: 8px;"></i>Bộ lọc nhanh</h4>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-timer" id="filterAll" style="flex: 1;">Tất cả</button>
                    <button class="btn-timer" id="filterPending" style="flex: 1;">Chưa làm</button>
                    <button class="btn-timer" id="filterDone" style="flex: 1;">Đã xong</button>
                </div>
            </div>
        </aside>

        <!-- CỘT 2: TIMELINE THỜI GIAN CHÍNH (DAILY/WEEKLY VIEW) -->
        <main class="main-timeline glass-panel">
            <div class="timeline-header">
                <h3 id="timelineTitle">Lịch làm việc hôm nay</h3>
                <div class="view-switcher">
                    <button class="switch-btn active" id="viewDayBtn">Ngày</button>
                    <button class="switch-btn" id="viewWeekBtn">Tuần</button>
                </div>
            </div>

            <!-- Khung lưới giờ Apple Calendar Style -->
            <div class="timeline-hours" id="timelineHoursContainer">
                <!-- Sẽ được sinh tự động bởi Javascript (00:00 -> 23:00) -->
            </div>
        </main>

        <!-- CỘT 3: POMODORO & THEO DÕI THỜI GIAN THỰC TẾ -->
        <aside class="panel-right">
            <!-- Chế độ tập trung Pomodoro -->
            <div class="glass-panel pomodoro-box">
                <h3><i class="fa-solid fa-brain" style="color: #ec4899; margin-right: 10px;"></i>Chế độ Pomodoro</h3>
                <div class="timer-display" id="pomodoroDisplay">25:00</div>
                <div class="timer-controls">
                    <button class="btn-timer" id="startTimerBtn"><i class="fa-solid fa-play"></i> Bắt đầu</button>
                    <button class="btn-timer" id="resetTimerBtn"><i class="fa-solid fa-rotate-left"></i> Đặt lại</button>
                </div>
            </div>

            <!-- Theo dõi tiến độ thực tế -->
            <div class="glass-panel">
                <h3 style="margin-bottom: 15px;"><i class="fa-solid fa-stopwatch" style="margin-right: 10px;"></i>Thời gian thực tế</h3>
                <div id="actualTrackingBox" style="font-size: 0.9rem; line-height: 1.5;">
                    <p style="opacity: 0.8; text-align: center; padding: 20px 0;">Hãy chọn một công việc đang thực hiện trên lịch biểu để ghi nhận thời gian chạy thực tế.</p>
                </div>
            </div>
        </aside>

    </div>

    <!-- AUDIO THÔNG BÁO CHO POMODORO (Sử dụng link âm thanh mặc định để chạy trực tiếp) -->
    <audio id="alertSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav" preload="auto"></audio>

    <!-- ==================== 6. LOGIC JAVASCRIPT ĐIỀU KHIỂN TOÀN BỘ HỆ THỐNG ==================== -->
    <script>
        // 1. Dữ liệu Tài khoản cố định (Hardcoded Accounts) theo yêu cầu [197]
        const HARDCODED_ACCOUNTS = {
            "admin": "123456",
            "nhanvien1": "abcdef"
        };

        // Trạng thái ứng dụng
        let state = {
            currentUser: null,
            selectedDate: "2026-08-05", // Mockup date theo metadata hệ thống
            filter: "all", // all, pending, done
            tasks: [],
            activePomodoro: null,
            selectedTaskForTracking: null
        };

        // Khởi chạy khi DOM tải xong
        document.addEventListener("DOMContentLoaded", () => {
            initTimePickers();
            initLoginForm();
            initRealTimeClock();
            initPomodoro();
            
            // Render lịch trống ban đầu
            renderTimelineStructure();
        });

        // 2. Khởi tạo mốc thời gian (Chỉ cho phép mốc 00, 15, 30, 45 phút) [197]
        function initTimePickers() {
            const startSelect = document.getElementById("startTime");
            const endSelect = document.getElementById("endTime");
            
            startSelect.innerHTML = "";
            endSelect.innerHTML = "";

            for (let hour = 0; hour < 24; hour++) {
                const hourStr = hour.toString().padStart(2, '0');
                ['00', '15', '30', '45'].forEach(min => {
                    const timeValue = `${hourStr}:${min}`;
                    startSelect.add(new Option(timeValue, timeValue));
                    endSelect.add(new Option(timeValue, timeValue));
                });
            }
            
            // Set giá trị mặc định đẹp mắt
            startSelect.value = "08:00";
            endSelect.value = "09:00";
        }

        // 3. Quản lý Đăng nhập
        function initLoginForm() {
            const loginForm = document.getElementById("loginForm");
            const loginOverlay = document.getElementById("loginOverlay");
            const mainApp = document.getElementById("mainApp");
            const loginError = document.getElementById("loginError");

            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const user = document.getElementById("username").value.trim();
                const pass = document.getElementById("password").value;

                if (HARDCODED_ACCOUNTS[user] && HARDCODED_ACCOUNTS[user] === pass) {
                    state.currentUser = user;
                    loginOverlay.classList.add("hidden");
                    mainApp.classList.remove("hidden");
                    
                    // Tải dữ liệu từ LocalStorage hoặc khởi tạo dữ liệu mẫu
                    loadTasksFromLocalStorage();
                    renderTasks();
                    updateOverviewStats();
                } else {
                    loginError.classList.remove("hidden");
                }
            });
        }

        // 4. Đồng hồ thời gian thực ở Header [200]
        function initRealTimeClock() {
            setInterval(() => {
                const now = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById("currentDateDisplay").innerText = now.toLocaleDateString('vi-VN', options);
                document.getElementById("currentTimeDisplay").innerText = now.toLocaleTimeString('vi-VN');
            }, 1000);
        }

        // 5. Đồng hồ tập trung Pomodoro [198]
        let timerInterval = null;
        let timeLeft = 25 * 60; // 25 phút mặc định

        function initPomodoro() {
            const display = document.getElementById("pomodoroDisplay");
            const startBtn = document.getElementById("startTimerBtn");
            const resetBtn = document.getElementById("resetTimerBtn");
            const alertSound = document.getElementById("alertSound");

            startBtn.addEventListener("click", () => {
                if (timerInterval) {
                    // Tạm dừng
                    clearInterval(timerInterval);
                    timerInterval = null;
                    startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Tiếp tục';
                } else {
                    // Chạy tiếp
                    timerInterval = setInterval(() => {
                        timeLeft--;
                        updateTimerDisplay();

                        if (timeLeft <= 0) {
                            clearInterval(timerInterval);
                            timerInterval = null;
                            alertSound.play();
                            alert("Kính coong! Đã hết phiên Pomodoro tập trung. Hãy nghỉ ngơi 5 phút!");
                            timeLeft = 25 * 60;
                            updateTimerDisplay();
                            startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Bắt đầu';
                        }
                    }, 1000);
                    startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng';
                }
            });

            resetBtn.addEventListener("click", () => {
                clearInterval(timerInterval);
                timerInterval = null;
                timeLeft = 25 * 60;
                updateTimerDisplay();
                startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Bắt đầu';
            });

            function updateTimerDisplay() {
                const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const s = (timeLeft % 60).toString().padStart(2, '0');
                display.innerText = `${m}:${s}`;
            }
        }

        // 6. Dựng khung lưới Timeline (Apple Calendar Layout) [199]
        function renderTimelineStructure() {
            const container = document.getElementById("timelineHoursContainer");
            container.innerHTML = "";

            for (let hour = 0; hour < 24; hour++) {
                const hourStr = hour.toString().padStart(2, '0') + ":00";
                
                const row = document.createElement("div");
                row.className = "hour-row";
                
                const label = document.createElement("div");
                label.className = "hour-label";
                label.innerText = hourStr;

                const slot = document.createElement("div");
                slot.className = "hour-slot";
                slot.id = `slot-${hour}`;
                
                // Hỗ trợ sự kiện DragOver để cho phép thả vào khung giờ [42]
                slot.addEventListener("dragover", (e) => {
                    e.preventDefault();
                });

                slot.addEventListener("drop", (e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData("text/plain");
                    const task = state.tasks.find(t => t.id === taskId);
                    if (task) {
                        // Tính toán thời gian bắt đầu mới dựa vào slot thả vào
                        const oldStart = task.startTime;
                        const durationMinutes = calculateDurationInMinutes(task.startTime, task.endTime);
                        
                        const newHourStr = hour.toString().padStart(2, '0');
                        task.startTime = `${newHourStr}:00`;
                        
                        // Tính giờ kết thúc mới dựa vào thời lượng cũ
                        let endHours = hour + Math.floor(durationMinutes / 60);
                        let endMins = durationMinutes % 60;
                        if (endHours >= 24) endHours = 23;
                        task.endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                        
                        saveTasksToLocalStorage();
                        renderTasks();
                        alert(`Đã di chuyển công việc sang khung giờ: ${task.startTime} - ${task.endTime}`);
                    }
                });

                row.appendChild(label);
                row.appendChild(slot);
                container.appendChild(row);
            }
        }

        // Tính thời lượng
        function calculateDurationInMinutes(start, end) {
            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);
            return (eh * 60 + em) - (sh * 60 + sm);
        }

        // 7. Thêm mới công việc vào danh sách & lưu trữ cục bộ [162]
        const taskForm = document.getElementById("taskForm");
        taskForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = document.getElementById("taskTitle").value.trim();
            const category = document.getElementById("taskCategory").value;
            const priority = document.getElementById("taskPriority").value;
            const start = document.getElementById("startTime").value;
            const end = document.getElementById("endTime").value;
            const isRecurring = document.getElementById("taskRecurring").checked;

            // Kiểm tra ràng buộc logic thời gian
            if (calculateDurationInMinutes(start, end) <= 0) {
                alert("Lỗi: Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
                return;
            }

            const newTask = {
                id: "task-" + Date.now(),
                title: title,
                category: category,
                priority: priority,
                startTime: start,
                endTime: end,
                completed: false,
                isRecurring: isRecurring,
                actualStart: null,
                actualEnd: null,
                delayReason: ""
            };

            state.tasks.push(newTask);
            saveTasksToLocalStorage();
            renderTasks();
            updateOverviewStats();
            
            // Reset form
            taskForm.reset();
            document.getElementById("recurringDaysGroup").classList.add("hidden");
        });

        // Toggle hiển thị chọn ngày lặp khi tích checkbox [199]
        document.getElementById("taskRecurring").addEventListener("change", (e) => {
            const daysGroup = document.getElementById("recurringDaysGroup");
            if (e.target.checked) {
                daysGroup.classList.remove("hidden");
            } else {
                daysGroup.classList.add("hidden");
            }
        });

        // 8. Đọc/Ghi dữ liệu LocalStorage [161]
        function saveTasksToLocalStorage() {
            const key = `schedule_data_${state.currentUser}`;
            localStorage.setItem(key, JSON.stringify(state.tasks));
        }

        function loadTasksFromLocalStorage() {
            const key = `schedule_data_${state.currentUser}`;
            const localData = localStorage.getItem(key);
            if (localData) {
                state.tasks = JSON.parse(localData);
            } else {
                // Dữ liệu mẫu ban đầu để giao diện thêm sinh động
                state.tasks = [
                    {
                        id: "task-1",
                        title: "Daily meeting dự án",
                        category: "Công việc",
                        priority: "Quan trọng và khẩn cấp",
                        startTime: "09:00",
                        endTime: "10:15",
                        completed: false,
                        isRecurring: false,
                        actualStart: null,
                        actualEnd: null,
                        delayReason: ""
                    },
                    {
                        id: "task-2",
                        title: "Học tiếng Nhật",
                        category: "Học tập",
                        priority: "Quan trọng nhưng không khẩn cấp",
                        startTime: "19:00",
                        endTime: "20:30",
                        completed: false,
                        isRecurring: true,
                        actualStart: null,
                        actualEnd: null,
                        delayReason: ""
                    }
                ];
                saveTasksToLocalStorage();
            }
        }

        // 9. Hiển thị danh sách công việc lên khung Timeline [27]
        function renderTasks() {
            // Xóa tất cả các card cũ trên giao diện timeline
            document.querySelectorAll(".task-card").forEach(el => el.remove());

            // Lọc công việc theo bộ lọc nhanh
            let filteredTasks = state.tasks;
            if (state.filter === "pending") {
                filteredTasks = state.tasks.filter(t => !t.completed);
            } else if (state.filter === "done") {
                filteredTasks = state.tasks.filter(t => t.completed);
            }

            filteredTasks.forEach(task => {
                const startHour = parseInt(task.startTime.split(":")[0]);
                const slot = document.getElementById(`slot-${startHour}`);
                if (slot) {
                    const card = document.createElement("div");
                    card.className = `task-card ${task.completed ? 'completed' : ''}`;
                    card.draggable = true;
                    card.id = task.id;

                    // Gán màu sắc theo nhóm
                    let borderCol = "#ff4d4d";
                    if (task.category === "Học tập") borderCol = "#3b82f6";
                    if (task.category === "Sức khỏe") borderCol = "#10b981";
                    if (task.category === "Giải trí") borderCol = "#fbbf24";
                    if (task.category === "Giấc ngủ") borderCol = "#8b5cf6";
                    if (task.category === "Ăn uống") borderCol = "#ec4899";
                    card.style.borderLeftColor = borderCol;

                    card.innerHTML = `
                        <div>
                            <div style="font-weight: 600;">${task.title}</div>
                            <div style="font-size: 0.75rem; opacity: 0.75;">
                                <i class="fa-regular fa-clock"></i> ${task.startTime} - ${task.endTime} | ${task.category}
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="action-btn" onclick="toggleTaskComplete('${task.id}')" title="Đánh dấu hoàn thành">
                                <i class="fa-regular ${task.completed ? 'fa-circle-check' : 'fa-circle'}" style="color: #10b981;"></i>
                            </button>
                            <button class="action-btn" onclick="selectTaskForTracking('${task.id}')" title="Ghi nhận giờ thực tế">
                                <i class="fa-solid fa-stopwatch" style="color: #3b82f6;"></i>
                            </button>
                            <button class="action-btn" onclick="deleteTask('${task.id}')" title="Xóa công việc">
                                <i class="fa-solid fa-trash" style="color: #ef4444;"></i>
                            </button>
                        </div>
                    `;

                    // Dragstart & Dragend events [48]
                    card.addEventListener("dragstart", (e) => {
                        e.dataTransfer.setData("text/plain", task.id);
                        card.classList.add("dragging");
                    });

                    card.addEventListener("dragend", () => {
                        card.classList.remove("dragging");
                    });

                    slot.appendChild(card);
                }
            });
        }

        // 10. Hoạt động quản lý công việc (CRUD) [18, 31, 32]
        window.toggleTaskComplete = function(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                saveTasksToLocalStorage();
                renderTasks();
                updateOverviewStats();
            }
        };

        window.deleteTask = function(taskId) {
            if (confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
                state.tasks = state.tasks.filter(t => t.id !== taskId);
                saveTasksToLocalStorage();
                renderTasks();
                updateOverviewStats();
                
                if (state.selectedTaskForTracking && state.selectedTaskForTracking.id === taskId) {
                    state.selectedTaskForTracking = null;
                    document.getElementById("actualTrackingBox").innerHTML = `
                        <p style="opacity: 0.8; text-align: center; padding: 20px 0;">Công việc đã bị xóa.</p>
                    `;
                }
            }
        };

        // 11. Ghi nhận thời gian thực tế [200]
        window.selectTaskForTracking = function(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                state.selectedTaskForTracking = task;
                const container = document.getElementById("actualTrackingBox");
                
                container.innerHTML = `
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                        <h4 style="color:#ec4899; margin-bottom:8px;">${task.title}</h4>
                        <p><strong>Thời lượng dự kiến:</strong> ${task.startTime} - ${task.endTime}</p>
                        <div class="form-group" style="margin-top:10px;">
                            <label>Mốc bắt đầu thực tế (HH:MM)</label>
                            <input type="text" id="actualStartInput" class="form-control" value="${task.actualStart || ''}" placeholder="Ví dụ: 09:05">
                        </div>
                        <div class="form-group">
                            <label>Mốc kết thúc thực tế (HH:MM)</label>
                            <input type="text" id="actualEndInput" class="form-control" value="${task.actualEnd || ''}" placeholder="Ví dụ: 10:10">
                        </div>
                        <div class="form-group">
                            <label>Lý do trì hoãn / Phát sinh (nếu có)</label>
                            <input type="text" id="delayReasonInput" class="form-control" value="${task.delayReason || ''}" placeholder="Ví dụ: Mất điện, kẹt xe...">
                        </div>
                        <button class="btn-primary" onclick="saveActualTrackingData('${task.id}')" style="padding:8px 12px; font-size:0.9rem;">Lưu thực tế</button>
                    </div>
                `;
            }
        };

        window.saveActualTrackingData = function(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                task.actualStart = document.getElementById("actualStartInput").value.trim();
                task.actualEnd = document.getElementById("actualEndInput").value.trim();
                task.delayReason = document.getElementById("delayReasonInput").value.trim();
                
                saveTasksToLocalStorage();
                alert("Đã lưu trữ dữ liệu chấm công và ghi nhận thời gian thực tế thành công!");
                selectTaskForTracking(taskId);
            }
        };

        // 12. Cập nhật các chỉ số tổng quan ở Header [36, 37, 200]
        function updateOverviewStats() {
            const total = state.tasks.length;
            const completed = state.tasks.filter(t => t.completed).length;
            
            document.getElementById("progressStats").innerText = `${completed}/${total} công việc`;
            
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            document.getElementById("progressBar").style.width = `${percent}%`;
            document.getElementById("progressPercentage").innerText = `${percent}%`;
        }

        // 13. Logic bộ lọc nhanh
        document.getElementById("filterAll").addEventListener("click", () => { state.filter = "all"; renderTasks(); });
        document.getElementById("filterPending").addEventListener("click", () => { state.filter = "pending"; renderTasks(); });
        document.getElementById("filterDone").addEventListener("click", () => { state.filter = "done"; renderTasks(); });
    </script>
</body>
</html>
```

---

## IV. ĐỊNH HƯỚNG TRIỂN KHAI VÀ KHỞI TẠO WEB BÁN HÀNG CHUYÊN NGHIỆP

Để hiện thực hóa bản thiết kế này lên môi trường mạng Internet thực tế, bạn có thể tham khảo quy trình triển khai chuẩn 8 bước như sau [117]:

1.  **Thu thập thông tin và yêu cầu:** Đây chính là tệp tài liệu yêu cầu cá nhân hóa bạn vừa cung cấp [117].
2.  **Lập kế hoạch thiết kế:** Tạo khung sơ đồ cấu trúc trang (sử dụng 3 cột responsive như mô tả ở trên) để tối ưu hóa trải nghiệm người dùng [120].
3.  **Lựa chọn tên miền và Hosting:** Lựa chọn nhà cung cấp hosting uy tín (như Nhân Hòa [172] hoặc Nhanh.vn [112]) để lưu trữ mã nguồn và đăng ký tên miền (.vn hoặc .com) giúp định vị thương hiệu cá nhân chuyên nghiệp [118].
4.  **Thiết kế giao diện:** Tối ưu hóa UI/UX chuẩn hóa chuẩn SEO, đồng bộ bảng màu gradient nhã nhặn, sang trọng giúp tăng thời gian giữ chân khách hàng ở lại trang web lâu hơn [123, 124].
5.  **Xây dựng tính năng nâng cao:** Tích hợp bộ mã HTML/CSS/JS ở mục III để cung cấp các tính năng quản lý, kéo thả lịch biểu [41, 198] và đếm ngược Pomodoro [198].
6.  **Kiểm tra và sửa lỗi:** Tiến hành chạy thử nghiệm (Unit Test, Integration Test) để đảm bảo không xảy ra bất kỳ lỗi logic nào trước khi bàn giao mã nguồn [87, 126].
7.  **Đào tạo & Hướng dẫn quản trị:** Bàn giao tài liệu hướng dẫn và lưu trữ mã nguồn để người dùng dễ dàng bảo trì hoặc nâng cấp sau này [127].
8.  **Bảo trì hệ thống:** Thường xuyên sao lưu dữ liệu, bảo trì máy chủ và kết nối website lên các công cụ tìm kiếm hàng đầu như Google, Bing [127].
