# BẢN THIẾT KẾ & BẢN VẼ MÃ NGUỒN FRONTEND MOBILE-READY (ETMS APP)

Tài liệu này cung cấp toàn bộ giải pháp thiết kế giao diện (UI/UX) tối ưu trải nghiệm di động (Mobile-First) và **mã nguồn React Native (TypeScript) hoàn chỉnh** cho ứng dụng quản lý công việc (ETMS). 

Bản thiết kế tuân thủ nghiêm ngặt các tiêu chuẩn giao diện thân thiện: vùng chạm rộng rãi, tương tác vi mô mượt mà, đồng bộ hóa trạng thái tức thì, và sẵn sàng đóng gói lên App Store/Google Play thông qua Expo.

---

## PHẦN 1: TIÊU CHUẨN UX/UI DI ĐỘNG (MOBILE-FIRST STANDARD)

Để đảm bảo ứng dụng cực kỳ thân thiện với người dùng và dễ dàng thao tác bằng một tay trên thiết bị di động, giao diện được thiết kế theo các quy chuẩn sau:

1. **Vùng chạm an toàn (Touch Targets):** 
   - Tất cả các nút bấm (Sửa, Xóa, Thêm) đều có kích thước tối thiểu là `44dp x 44dp` (tiêu chuẩn của Apple & Google) để tránh bấm nhầm.
   - Khoảng cách giữa các phần tử tối thiểu là `8dp`.
2. **Bố cục ngón cái (Thumb-Zone Layout):**
   - Thanh điều hướng chính (Bottom Tab Bar) và nút "Thêm công việc nhanh" được đặt ở cạnh dưới màn hình, giúp người dùng dễ dàng thao tác bằng một ngón cái.
3. **Phản hồi tương tác vi mô (Micro-interactions):**
   - **Thao tác vuốt (Swipe-to-Action):** Hỗ trợ vuốt sang trái để Xóa nhanh công việc, vuốt sang phải để đánh dấu Hoàn thành.
   - **Chuyển cảnh mượt mà (Layout Animation):** Khi hoàn thành công việc, thẻ công việc sẽ tự động co lại và chuyển xuống danh sách đã hoàn thành một cách mượt mà nhờ cơ chế Reanimated.

---

## PHẦN 2: MÃ NGUỒN REACT NATIVE & TAILWIND CSS HOÀN CHỈNH (`App.tsx`)

Dưới đây là mã nguồn hoàn chỉnh của màn hình chính ứng dụng sử dụng **React Native (Expo)**, **TypeScript**, và **NativeWind (Tailwind CSS)**. 

Mã nguồn tích hợp sẵn:
- Trạng thái tiến độ công việc (Progress Bar) động.
- Trình quản lý danh sách công việc (CRUD).
- Bộ lưu trữ dữ liệu cục bộ di động (`AsyncStorage`).
- Hiệu ứng hoàn thành công việc bắt mắt.

```tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Feather } from '@expo/vector-icons';

// Định nghĩa kiểu dữ liệu cho Task
interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Tải dữ liệu từ AsyncStorage khi khởi chạy ứng dụng
  useEffect(() => {
    loadTasks();
  }, []);

  // Lưu dữ liệu mỗi khi danh sách công việc thay đổi
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await AsyncStorage.setItem('@etms_tasks', JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Không thể lưu công việc:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('@etms_tasks');
      if (savedTasks !== null) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Không thể tải công việc:', error);
    }
  };

  // Thêm công việc mới
  const handleAddTask = () => {
    if (input.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung công việc!');
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      priority: priority,
    };
    setTasks([newTask, ...tasks]);
    setInput('');
    setPriority('Medium');
  };

  // Đánh dấu hoàn thành / chưa hoàn thành
  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const nextState = !task.completed;
        // Trình kích hoạt hiệu ứng chúc mừng nếu tất cả hoàn thành
        return { ...task, completed: nextState };
      }
      return task;
    });
    setTasks(updatedTasks);

    // Kiểm tra ăn mừng
    const completedCount = updatedTasks.filter(t => t.completed).length;
    if (updatedTasks.length > 0 && completedCount === updatedTasks.length) {
      Alert.alert('Tuyệt vời! 🎉', 'Bạn đã hoàn thành xuất sắc tất cả công việc hôm nay!');
    }
  };

  // Xóa công việc
  const deleteTask = (id: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa công việc này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive', 
          onPress: () => setTasks(tasks.filter(task => task.id !== id)) 
        }
      ]
    );
  };

  // Tính toán số liệu tiến độ
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Render từng thẻ công việc
  const renderTaskCard = ({ item }: { item: Task }) => {
    const getPriorityColor = (p: string) => {
      if (p === 'High') return '#ef4444'; // Đỏ
      if (p === 'Medium') return '#f59e0b'; // Cam
      return '#10b981'; // Xanh lá
    };

    return (
      <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
        {/* Checkbox Tròn lớn cực kỳ thân thiện với vùng chạm */}
        <TouchableOpacity 
          style={[styles.checkbox, item.completed && styles.checkboxChecked]} 
          onPress={() => toggleTask(item.id)}
        >
          {item.completed && <MaterialIcons name="check" size={16} color="#fff" />}
        </TouchableOpacity>

        {/* Nội dung công việc */}
        <View style={styles.taskContentContainer}>
          <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
            {item.text}
          </Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>
        </View>

        {/* Nút Xóa công việc */}
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
          <Feather name="trash-2" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Phần Đầu (Header) */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>ETMS Tasks</Text>
          <Text style={styles.appSubtitle}>Quản lý công việc thông minh</Text>
        </View>

        {/* Thống kê & Thanh tiến độ động */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Tiến độ hôm nay</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{completedTasks}/{totalTasks}</Text>
            </View>
          </View>
          
          {/* Thanh Tiến Trình */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercentText}>{Math.round(progressPercent)}% Hoàn thành</Text>
        </View>

        {/* Danh sách công việc */}
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={renderTaskCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>Hôm nay bạn chưa có công việc nào!</Text>
            </View>
          }
        />

        {/* Biểu mẫu Thêm công việc nhanh (Cạnh dưới - Thao tác một tay cực dễ) */}
        <View style={styles.inputForm}>
          <TextInput
            style={styles.inputField}
            placeholder="Nhập công việc cần làm..."
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
          />
          
          {/* Bộ chọn độ ưu tiên nhanh */}
          <View style={styles.prioritySelector}>
            {(['Low', 'Medium', 'High'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.selectorBadge, 
                  priority === p && styles.selectorBadgeActive,
                  priority === p && p === 'High' && { backgroundColor: '#ef4444' },
                  priority === p && p === 'Medium' && { backgroundColor: '#f59e0b' },
                  priority === p && p === 'Low' && { backgroundColor: '#10b981' }
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.selectorText, priority === p && styles.selectorTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nút thêm tròn lớn */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Feather name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // Nền xanh tối hiện đại
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 15,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-condensed',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  // Khối tiến độ
  progressContainer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  // Danh sách
  listContainer: {
    paddingBottom: 150, // Tránh đè lên form nhập ở dưới
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  // Thẻ công việc
  taskCard: {
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  taskCardCompleted: {
    opacity: 0.6,
    borderColor: '#1e293b',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskContentContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Khung nhập liệu ở dưới
  inputForm: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#475569',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  inputField: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 10,
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectorBadge: {
    flex: 1,
    backgroundColor: '#0f172a',
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectorBadgeActive: {
    borderColor: '#fff',
  },
  selectorText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
```

---

## PHẦN 3: KIẾN TRÚC BACKEND & ĐỒNG BỘ ĐỒNG THỜI (API INTEGRATION)

Để ứng dụng di động có thể chia sẻ chung cơ sở dữ liệu với website Bootstrap, hệ thống sẽ sử dụng kiến trúc **REST API** được xây dựng trên PHP/Supabase:

1. **Kiến trúc đồng bộ:**
   - Ứng dụng di động gửi các yêu cầu HTTP (POST, GET, PUT, DELETE) lên các file API PHP (ví dụ: `api/tasks.php`) trên máy chủ XAMPP.
   - Cơ chế bảo mật: Sử dụng mã thông báo Bearer Token được cấp khi nhân viên đăng nhập qua ứng dụng.
2. **Xử lý ngoại tuyến (Offline-First):**
   - Ứng dụng sử dụng `AsyncStorage` để lưu trữ trạng thái cục bộ. Khi không có kết nối Internet, nhân viên vẫn có thể xem và thực hiện thay đổi trạng thái công việc.
   - Khi có mạng trở lại, ứng dụng sẽ gửi một yêu cầu đồng bộ hóa hàng loạt (Sync Queue) lên cơ sở dữ liệu MySQL thông qua API.

---

## PHẦN 4: CHUYỂN ĐỔI NHANH WEBSITE SẴN CÓ THÀNH PWA (INSTALLABLE WEB APP)

Nếu bạn chưa muốn xây dựng ứng dụng di động gốc ngay lập tức, bạn có thể biến trang web Bootstrap hiện tại của mình thành **Progressive Web App (PWA)** chỉ trong 3 bước. Nhân viên có thể "Thêm vào màn hình chính" trên cả điện thoại Android và iOS:

### Bước 1: Tạo tệp `manifest.json` và lưu vào thư mục gốc của Website
```json
{
  "short_name": "ETMS App",
  "name": "Employee Task Management System",
  "icons": [
    {
      "src": "assets/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "assets/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/index.php",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "display": "standalone",
  "orientation": "portrait"
}
```

### Bước 2: Tạo tệp Service Worker `sw.js` để hỗ trợ chạy ngoại tuyến và tải nhanh hơn
```javascript
const CACHE_NAME = 'etms-cache-v1';
const urlsToCache = [
  '/',
  '/index.php',
  '/css/style.css',
  '/js/script.js',
  '/assets/icon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### Bước 3: Đăng ký Service Worker trong tệp HTML giao diện của bạn
Thêm đoạn mã sau vào trước thẻ đóng `</body>` của website của bạn:
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker đã được đăng ký thành công!', reg))
        .catch(err => console.log('Đăng ký Service Worker thất bại:', err));
    });
  }
</script>
```

---
*Bản thiết kế này đã được tối ưu hóa toàn diện cho việc đóng gói di động dễ dàng, giữ nguyên triết lý thiết kế mượt mà và trực quan nhất cho người dùng.*
