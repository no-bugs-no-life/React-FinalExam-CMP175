import { create } from 'zustand';

// Mock dữ liệu ban đầu - bạn có thể xóa khi triển khai thực tế
const initialNotifications = [
    {
        id: 1,
        type: 'success',
        message: 'Category "Technology" has been added successfully',
        time: new Date(Date.now() - 1000 * 60 * 5), // 5 phút trước
        read: false
    },
    {
        id: 2,
        type: 'info',
        message: 'Category "Business" has been updated',
        time: new Date(Date.now() - 1000 * 60 * 30), // 30 phút trước
        read: false
    },
    {
        id: 3,
        type: 'error',
        message: 'Category "Sports" has been deleted',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 giờ trước
        read: true
    }
];

const useNotificationStore = create((set, get) => ({
    // Bắt đầu với một số thông báo mẫu
    notifications: initialNotifications,
    
    // Thêm thông báo mới
    addNotification: (message, type = 'info', link = null) => {
        const newNotification = {
            id: Date.now(),
            message,
            type, // 'success', 'info', 'error'
            time: new Date(),
            read: false,
            link // Optional link to navigate to
        };
        
        set(state => ({
            notifications: [newNotification, ...state.notifications]
        }));
        
        return newNotification.id;
    },
    
    // Đánh dấu tất cả là đã đọc
    markAllAsRead: () => {
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true }))
        }));
    },
    
    // Đánh dấu một thông báo là đã đọc
    markAsRead: (id) => {
        set(state => ({
            notifications: state.notifications.map(n => 
                n.id === id ? { ...n, read: true } : n
            )
        }));
    },
    
    // Xóa một thông báo
    removeNotification: (id) => {
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
        }));
    },
    
    // Lấy số lượng thông báo chưa đọc
    getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
    },
    
    // Xóa tất cả thông báo
    clearAll: () => {
        set({ notifications: [] });
    }
}));

export default useNotificationStore;