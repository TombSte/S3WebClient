import { createContext, useContext, useState } from "react";

export interface NotificationItem {
  id: number;
  message: string;
  date: Date;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  addNotification: (message: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  addNotification: () => undefined,
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification: NotificationsContextValue["addNotification"] = (message) => {
    setNotifications((prev) => [{ id: Date.now(), message, date: new Date() }, ...prev]);
  };

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
