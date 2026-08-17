/**
 * Preset Schedule Templates (Mẫu thời gian biểu chuẩn)
 */
const PRESET_TEMPLATES = [
    {
        id: 'office_worker',
        name: '💼 Dân Văn Phòng Năng Động',
        description: 'Cân bằng giữa 8h làm việc công sở, tập thể thao chiều và nghỉ ngơi gia đình.',
        badge: 'Phổ biến nhất',
        tasks: [
            { title: 'Dậy sớm & Vệ sinh cá nhân', startTime: '06:00', endTime: '06:30', category: 'sleep', priority: 'medium', completed: true, notes: 'Uống 1 ly nước ấm' },
            { title: 'Tập thể dục nhẹ / Jogging', startTime: '06:30', endTime: '07:15', category: 'fitness', priority: 'high', completed: true, notes: 'Chạy bộ 3km hoặc tập Yoga' },
            { title: 'Ăn sáng & Thưởng thức Cafe', startTime: '07:15', endTime: '08:00', category: 'meals', priority: 'medium', completed: true, notes: 'Ăn sáng nhẹ, chuẩn bị đi làm' },
            { title: 'Di chuyển & Kiểm tra Email', startTime: '08:00', endTime: '08:30', category: 'work', priority: 'low', completed: true, notes: 'Xem qua công việc cần ưu tiên trong ngày' },
            { title: 'Deep Work: Giải quyết Task quan trọng', startTime: '08:30', endTime: '11:30', category: 'work', priority: 'high', completed: false, notes: 'Tắt thông báo, tập trung tối đa' },
            { title: 'Ăn trưa & Chợp mắt 20 phút', startTime: '11:30', endTime: '13:00', category: 'meals', priority: 'high', completed: false, notes: 'Nghỉ ngơi tái tạo năng lượng' },
            { title: 'Họp đội ngũ & Xử lý công văn', startTime: '13:00', endTime: '15:30', category: 'work', priority: 'medium', completed: false, notes: 'Thảo luận tiến độ dự án' },
            { title: 'Xử lý tồn đọng & Báo cáo ngày', startTime: '15:30', endTime: '17:30', category: 'work', priority: 'medium', completed: false, notes: 'Hoàn thiện nốt task còn dở' },
            { title: 'Tập Gym / Cầu lông / Swimming', startTime: '18:00', endTime: '19:15', category: 'fitness', priority: 'high', completed: false, notes: 'Xả stress sau giờ làm' },
            { title: 'Ăn tối cùng gia đình', startTime: '19:30', endTime: '20:30', category: 'meals', priority: 'medium', completed: false, notes: 'Tắt máy tính, trò chuyện' },
            { title: 'Đọc sách & Học kỹ năng mới', startTime: '20:30', endTime: '21:30', category: 'study', priority: 'medium', completed: false, notes: 'Đọc 20 trang sách hoặc học ngoại ngữ' },
            { title: 'Thư giãn & Chuẩn bị đi ngủ', startTime: '21:30', endTime: '22:30', category: 'leisure', priority: 'low', completed: false, notes: 'Nghe nhạc nhẹ, skin care' },
            { title: 'Giấc ngủ đêm chất lượng', startTime: '22:30', endTime: '06:00', category: 'sleep', priority: 'high', completed: false, notes: 'Ngủ đủ 7.5 tiếng' }
        ]
    },
    {
        id: 'student_pro',
        name: '🎓 Học Sinh / Sinh Viên Chăm Chỉ',
        description: 'Lịch trình tối ưu cho việc học trên lớp, tự học Pomodoro và hoạt động ngoại khóa.',
        badge: 'Khuyên dùng cho học tập',
        tasks: [
            { title: 'Thức dậy & Ăn sáng đầy đủ', startTime: '06:15', endTime: '07:00', category: 'meals', priority: 'high', completed: true, notes: 'Ăn đủ chất cho não bộ' },
            { title: 'Lên lớp học buổi sáng', startTime: '07:15', endTime: '11:45', category: 'study', priority: 'high', completed: true, notes: 'Ghi chép bài đầy đủ' },
            { title: 'Ăn trưa & Nghỉ trưa', startTime: '11:45', endTime: '13:30', category: 'meals', priority: 'medium', completed: false, notes: 'Nghỉ ngơi 30 phút' },
            { title: 'Thực hành / Học ca chiều hoặc CLB', startTime: '13:30', endTime: '16:30', category: 'study', priority: 'medium', completed: false, notes: 'Tham gia thảo luận nhóm' },
            { title: 'Tập thể thao / Chơi bóng rổ', startTime: '17:00', endTime: '18:15', category: 'fitness', priority: 'high', completed: false, notes: 'Vận động thể chất' },
            { title: 'Vệ sinh & Ăn tối', startTime: '18:30', endTime: '19:30', category: 'meals', priority: 'medium', completed: false, notes: 'Nghỉ ngơi nhẹ' },
            { title: 'Tự học & Làm bài tập Pomodoro (Ca 1)', startTime: '19:30', endTime: '21:00', category: 'study', priority: 'high', completed: false, notes: 'Giải quyết bài tập về nhà' },
            { title: 'Tự học / Ôn thi & Đọc tài liệu (Ca 2)', startTime: '21:15', endTime: '22:30', category: 'study', priority: 'medium', completed: false, notes: 'Xem lại lý thuyết' },
            { title: 'Giải trí / Chat với bạn bè', startTime: '22:30', endTime: '23:15', category: 'leisure', priority: 'low', completed: false, notes: 'Xem video hoặc chơi game' },
            { title: 'Giấc ngủ phục hồi', startTime: '23:15', endTime: '06:15', category: 'sleep', priority: 'high', completed: false, notes: 'Ngủ 7 tiếng' }
        ]
    },
    {
        id: 'freelancer_flow',
        name: '🚀 Freelancer & Sáng Tạo (Deep Work)',
        description: 'Tối đa hóa các khoảng thời gian tập trung cao độ (Deep Work) và tự do linh hoạt.',
        badge: 'Sáng tạo cao',
        tasks: [
            { title: 'Thức dậy thong thả & Thiền 15p', startTime: '07:00', endTime: '07:45', category: 'sleep', priority: 'medium', completed: true, notes: 'Thiền chánh niệm' },
            { title: 'Cà phê & Lên Kế Hoạch Ngày', startTime: '07:45', endTime: '08:30', category: 'leisure', priority: 'high', completed: true, notes: 'Xem Notion / Trello board' },
            { title: 'Deep Work Shift #1 (Đỉnh cao sáng tạo)', startTime: '08:30', endTime: '11:30', category: 'work', priority: 'high', completed: false, notes: 'Tập trung viết code / thiết kế / content' },
            { title: 'Nấu ăn & Nghỉ trưa dài', startTime: '11:30', endTime: '13:30', category: 'meals', priority: 'medium', completed: false, notes: 'Nghỉ ngơi tùy thích' },
            { title: 'Trả lời Email, Họp Client & Administrative', startTime: '13:30', endTime: '15:00', category: 'work', priority: 'medium', completed: false, notes: 'Xử lý các task giao tiếp' },
            { title: 'Deep Work Shift #2 (Hoàn thiện Dự án)', startTime: '15:15', endTime: '17:45', category: 'work', priority: 'high', completed: false, notes: 'Sprint làm việc tập trung' },
            { title: 'Chạy bộ ngoài trời / Đạp xe', startTime: '18:00', endTime: '19:15', category: 'fitness', priority: 'high', completed: false, notes: 'Hít thở không khí tự nhiên' },
            { title: 'Ăn tối & Gặp gỡ bạn bè', startTime: '19:30', endTime: '21:30', category: 'leisure', priority: 'medium', completed: false, notes: 'Kết nối xã hội' },
            { title: 'Nghiên cứu xu hướng & Học hỏi', startTime: '21:30', endTime: '22:45', category: 'study', priority: 'low', completed: false, notes: 'Đọc blog, thử công cụ AI mới' },
            { title: 'Đi ngủ', startTime: '23:00', endTime: '07:00', category: 'sleep', priority: 'high', completed: false, notes: 'Nghỉ ngơi' }
        ]
    },
    {
        id: 'early_riser_5am',
        name: '🌅 Lối Sống Dậy Sớm 5:00 AM',
        description: 'Tận dụng 2 giờ vàng đầu ngày khi thế giới còn đang ngủ để bứt phá bản thân.',
        badge: 'Kỷ luật cao',
        tasks: [
            { title: 'Thức dậy 5:00 AM & Uống nước', startTime: '05:00', endTime: '05:15', category: 'sleep', priority: 'high', completed: true, notes: 'Rửa mặt nước lạnh' },
            { title: 'Tập thể dục năng lượng & Vươn vai', startTime: '05:15', endTime: '06:00', category: 'fitness', priority: 'high', completed: true, notes: 'Tập Cardio hoặc Yoga' },
            { title: 'Đọc sách & Viết Nhật ký (Journaling)', startTime: '06:00', endTime: '06:45', category: 'study', priority: 'high', completed: true, notes: 'Phát triển bản thân' },
            { title: 'Ăn sáng dinh dưỡng & Cafe', startTime: '06:45', endTime: '07:30', category: 'meals', priority: 'medium', completed: true, notes: 'Năng lượng cho buổi sáng' },
            { title: 'Khởi động công việc quan trọng nhất', startTime: '07:30', endTime: '11:30', category: 'work', priority: 'high', completed: false, notes: 'Eat That Frog - Xử lý việc khó nhất' },
            { title: 'Ăn trưa & Chợp mắt 25 phút', startTime: '11:30', endTime: '13:00', category: 'meals', priority: 'medium', completed: false, notes: 'Phục hồi sức lực' },
            { title: 'Làm việc buổi chiều & Xử lý task phụ', startTime: '13:00', endTime: '16:30', category: 'work', priority: 'medium', completed: false, notes: 'Duy trì tiến độ' },
            { title: 'Đi dạo nhẹ nhàng & Thư giãn', startTime: '16:45', endTime: '17:45', category: 'fitness', priority: 'low', completed: false, notes: 'Giải tỏa căng thẳng' },
            { title: 'Ăn tối & Dành thời gian gia đình', startTime: '18:00', endTime: '19:30', category: 'meals', priority: 'medium', completed: false, notes: 'Cùng chuẩn bị bữa tối' },
            { title: 'Tắt màn hình điện thoại & Đọc sách nhẹ', startTime: '20:00', endTime: '21:30', category: 'leisure', priority: 'medium', completed: false, notes: 'Đèn vàng ấm, ngắt kết nối' },
            { title: 'Chìm vào giấc ngủ sớm', startTime: '21:30', endTime: '05:00', category: 'sleep', priority: 'high', completed: false, notes: 'Đảm bảo ngủ đủ 7.5 tiếng' }
        ]
    }
];

window.PRESET_TEMPLATES = PRESET_TEMPLATES;
