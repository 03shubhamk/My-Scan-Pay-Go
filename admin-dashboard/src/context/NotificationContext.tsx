import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  socketService,
  SocketStatus,
  NewOrderPayload,
  PaymentCompletedPayload,
  LowInventoryPayload,
  ExitVerifiedPayload,
} from '../services/socketService';

export type NotificationType = 'order' | 'payment' | 'inventory' | 'exit';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
  data?: any;
}

export interface ToastAlert {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  timestamp: string;
}

interface NotificationContextValue {
  notifications: AdminNotification[];
  toasts: ToastAlert[];
  unreadCount: number;
  socketStatus: SocketStatus;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeToast: (id: string) => void;
  triggerMockEvent: (type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const STORAGE_KEY = 'scan_pay_go_admin_notifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return [];
  });

  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected');

  // Save to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
    } catch (_) {}
  }, [notifications]);

  // Push new toast with 6-second auto dismiss
  const pushToast = useCallback((toast: Omit<ToastAlert, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastAlert = {
      ...toast,
      id,
      timestamp: new Date().toISOString(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 3)]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: AdminNotification = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 99)]);
    pushToast({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
    });
  }, [pushToast]);

  // Connect to Socket.IO and listen to live events
  useEffect(() => {
    socketService.connect();

    const unsubStatus = socketService.onStatusChange((status) => {
      setSocketStatus(status);
    });

    // 1. New Order Event
    const unsubOrder = socketService.onNewOrder((data: NewOrderPayload) => {
      const orderNum = data.orderNumber || `ORD-${data.orderId.substring(0, 8).toUpperCase()}`;
      addNotification({
        type: 'order',
        title: '🛍️ New Order Placed',
        message: `${orderNum} created for ₹${data.totalAmount.toFixed(2)} (${data.itemsCount} items).`,
        link: '/orders',
        data,
      });
    });

    // 2. Payment Completed Event
    const unsubPayment = socketService.onPaymentCompleted((data: PaymentCompletedPayload) => {
      const orderNum = data.orderNumber || `ORD-${data.orderId.substring(0, 8).toUpperCase()}`;
      addNotification({
        type: 'payment',
        title: '💳 Payment Received',
        message: `₹${data.amount.toFixed(2)} captured for ${orderNum} via Razorpay.`,
        link: '/payments',
        data,
      });
    });

    // 3. Low Inventory Event
    const unsubInventory = socketService.onLowInventory((data: LowInventoryPayload) => {
      addNotification({
        type: 'inventory',
        title: '⚠️ Low Stock Warning',
        message: `"${data.productName}" has only ${data.stockQuantity} units remaining (Threshold: ${data.lowStockThreshold}).`,
        link: '/inventory',
        data,
      });
    });

    // 4. Exit Verified Event
    const unsubExit = socketService.onExitVerified((data: ExitVerifiedPayload) => {
      const orderNum = data.orderNumber || `ORD-${data.orderId.substring(0, 8).toUpperCase()}`;
      addNotification({
        type: 'exit',
        title: '🚪 Turnstile Exit Cleared',
        message: `${orderNum} validated and passed through ${data.verifierNode || 'Exit Gate'}.`,
        link: '/exit-verifier',
        data,
      });
    });

    return () => {
      unsubStatus();
      unsubOrder();
      unsubPayment();
      unsubInventory();
      unsubExit();
    };
  }, [addNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const triggerMockEvent = useCallback((type: NotificationType) => {
    const mockOrderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    switch (type) {
      case 'order':
        addNotification({
          type: 'order',
          title: '🛍️ New Order Placed',
          message: `${mockOrderNum} created for ₹${(Math.random() * 500 + 50).toFixed(2)} (3 items).`,
          link: '/orders',
        });
        break;
      case 'payment':
        addNotification({
          type: 'payment',
          title: '💳 Payment Received',
          message: `₹249.00 captured for ${mockOrderNum} via Razorpay.`,
          link: '/payments',
        });
        break;
      case 'inventory':
        addNotification({
          type: 'inventory',
          title: '⚠️ Low Stock Warning',
          message: '"Amul Taaza Milk (500ml)" stock is critically low (4 units left).',
          link: '/inventory',
        });
        break;
      case 'exit':
        addNotification({
          type: 'exit',
          title: '🚪 Turnstile Exit Cleared',
          message: `${mockOrderNum} successfully verified at Main Turnstile #1.`,
          link: '/exit-verifier',
        });
        break;
    }
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        socketStatus,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeToast,
        triggerMockEvent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
