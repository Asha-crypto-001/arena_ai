import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Notification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  learnerProfile: any;
  educatorProfile: any;
  isLoading: boolean;
  notifications: Notification[];
  unreadNotificationCount: number;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  activeRole: 'learner' | 'educator' | 'admin' | 'guest';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<any>(null);
  const [educatorProfile, setEducatorProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      const storedUserId = localStorage.getItem('iskilllink_user_id');
      if (!storedUserId) {
        setUser(null);
        setLearnerProfile(null);
        setEducatorProfile(null);
        setNotifications([]);
        return;
      }

      const data = await api.getMe(storedUserId);
      if (data && data.user) {
        setUser(data.user);
        setLearnerProfile(data.learnerProfile);
        setEducatorProfile(data.educatorProfile);
        const notifs = await api.getNotifications(data.user.id);
        setNotifications(notifs);
      } else {
        localStorage.removeItem('iskilllink_user_id');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      localStorage.removeItem('iskilllink_user_id');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      setLearnerProfile(data.learnerProfile);
      setEducatorProfile(data.educatorProfile);
      localStorage.setItem('iskilllink_user_id', data.user.id);
      
      const notifs = await api.getNotifications(data.user.id);
      setNotifications(notifs);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.register(formData);
      setUser(data.user);
      setLearnerProfile(data.learnerProfile);
      setEducatorProfile(data.educatorProfile);
      localStorage.setItem('iskilllink_user_id', data.user.id);

      const notifs = await api.getNotifications(data.user.id);
      setNotifications(notifs);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('iskilllink_user_id');
    setUser(null);
    setLearnerProfile(null);
    setEducatorProfile(null);
    setNotifications([]);
  };

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const notifs = await api.getNotifications(user.id);
      setNotifications(notifs);
    } catch (e) {
      console.error('Error refreshing notifications:', e);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        learnerProfile,
        educatorProfile,
        isLoading,
        notifications,
        unreadNotificationCount,
        login,
        register,
        logout,
        refreshNotifications,
        markNotificationAsRead,
        activeRole: user ? user.role : 'guest'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
