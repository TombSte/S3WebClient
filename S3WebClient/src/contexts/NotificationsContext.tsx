import { createContext, useContext, useState } from "react";

export interface NotificationItem {
  id: number;
  message: string;
  date: Date;
  read?: boolean;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (message: string) => void;
  clearAll: () => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => undefined,
  clearAll: () => undefined,
  markAllRead: () => undefined,
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification: NotificationsContextValue["addNotification"] = (message) => {
    setNotifications((prev) => [{ id: Date.now(), message, date: new Date(), read: false }, ...prev]);
  };

  const clearAll: NotificationsContextValue["clearAll"] = () => {
    setNotifications([]);
  };

  const markAllRead: NotificationsContextValue["markAllRead"] = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, clearAll, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
