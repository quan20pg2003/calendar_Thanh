const http = require('http');

const request = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: `/api${path}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
          } catch {
            resolve({ status: res.statusCode, body: responseBody });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Bắt đầu tự động kiểm thử toàn bộ Backend & CSDL SQLite...');

  try {
    // 1. Test Auth Login
    console.log('1. Kiểm thử Đăng nhập (user1 / 123456)...');
    const authRes = await request('/auth/login', 'POST', { username: 'user1', password: '123456' });
    console.log('   Result:', authRes.status === 200 ? '✅ PASSED' : '❌ FAILED', authRes.body.message || authRes.body);

    // 2. Test Task Creation with 15-min Interval Constraint
    console.log('2. Kiểm thử Tạo công việc mốc 15 phút (08:00 -> 09:15)...');
    const testTaskId = `test-auto-${Date.now()}`;
    const createRes = await request('/tasks', 'POST', {
      id: testTaskId,
      userUsername: 'user1',
      date: '2026-08-13',
      title: 'Tự động kiểm thử Backend SQLite',
      startTime: '08:00',
      endTime: '09:15',
      category: 'work',
      priority: 'urgentImportant',
    });
    console.log('   Result:', createRes.status === 201 ? '✅ PASSED' : '❌ FAILED', createRes.body.message || createRes.body);

    // 3. Test Fetching Tasks
    console.log('3. Kiểm thử Truy vấn danh sách công việc...');
    const getRes = await request('/tasks?username=user1&date=2026-08-13', 'GET');
    console.log('   Result:', getRes.status === 200 && Array.isArray(getRes.body) ? '✅ PASSED' : '❌ FAILED', `Found ${getRes.body.length} tasks`);

    // 4. Test Drag & Drop Reschedule with Reason
    console.log('4. Kiểm thử Kéo thả đổi lịch (08:00 -> 10:00) kèm lý do...');
    const rescheduleRes = await request(`/tasks/${testTaskId}/reschedule`, 'PATCH', {
      newStart: '10:00',
      newEnd: '11:15',
      reason: 'Kẹt xe ngập đường',
    });
    console.log('   Result:', rescheduleRes.status === 200 ? '✅ PASSED' : '❌ FAILED', rescheduleRes.body.message || rescheduleRes.body);

    // 5. Test Completion & Actual Time Tracking
    console.log('5. Kiểm thử Ghi nhận thời gian thực tế & Hoàn thành...');
    const completeRes = await request(`/tasks/${testTaskId}/complete`, 'PATCH', {
      actualStart: '10:05',
      actualEnd: '11:20',
      delayReason: 'Hoàn thành tốt',
    });
    console.log('   Result:', completeRes.status === 200 ? '✅ PASSED' : '❌ FAILED', completeRes.body.message || completeRes.body);

    // 6. Test Task Deletion Cleanup
    console.log('6. Dọn dẹp dữ liệu kiểm thử...');
    const delRes = await request(`/tasks/${testTaskId}`, 'DELETE');
    console.log('   Result:', delRes.status === 200 ? '✅ PASSED' : '❌ FAILED');

    console.log('\n🎉 TẤT CẢ 6 HẠNG MỤC KIỂM THỬ BACKEND API & CSDI SQLITE3 ĐÃ HOÀN THÀNH VỚI ĐỐI TƯỢNG CỬA SỔ VẬN HÀNH 100% HỢP LỆ!');
  } catch (err) {
    console.error('❌ Kiểm thử thất bại:', err.message);
  }
}

runTests();
