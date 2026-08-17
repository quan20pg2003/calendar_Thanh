# Yêu Cầu Phát Triển Tính Năng Từ Google NotebookLM

Đây là file mẫu ghi chú yêu cầu được xuất từ Google NotebookLM hoặc lưu trực tiếp vào thư mục `notebooks/`.

## 📌 Tổng Quan Dự Án
Thêm tính năng **Ghi chú cá nhân (Personal Quick Notes)** và **Thông báo đẩy trên trình duyệt (Browser Push Notifications)** cho ứng dụng ChronoPulse.

## 🎯 Danh Sách Yêu Cầu Cần Thực Thi (Actionable Tasks)
- [ ] 1. Thêm nút bấm "Bật Thông Báo Đẩy" (Browser Push Notifications API) trong giao diện chính.
- [ ] 2. Cho phép người dùng lưu Ghi chú nhanh (Quick Notes) bên dưới danh sách công việc.
- [ ] 3. Tự động hiển thị notification thông báo khi tới giờ hẹn của công việc tiếp theo trong lịch 24h.
- [ ] 4. Lưu lại danh sách ghi chú vào `localStorage` theo từng profile (Cá nhân / Công việc / Học tập).

## 📝 Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- Người dùng có thể nhận thông báo trình duyệt khi có công việc mới bắt đầu.
- Ghi chú không bị mất khi làm mới (refresh) trình duyệt.
