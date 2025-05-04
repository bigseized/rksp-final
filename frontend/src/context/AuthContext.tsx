import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { websocketService } from '../services/websocketService';
import { chatService } from '../services/chatService';

export interface User {
  id: number;
  email: string;
  username: string;
  displayUsername: string;
  authorities: { authority: string }[];
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token);
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      const response = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Auth check response:', response.data);
      
      if (response.data) {
        setUser(response.data);
        chatService.clearChats();
        await chatService.getChats();
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      chatService.clearChats();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      await checkAuth();
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const response = await axios.post('/auth/register', {
        email,
        password,
        username
      });
      localStorage.setItem('token', response.data.token);
      await checkAuth();
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    // Очищаем localStorage
    localStorage.clear();
    
    // Очищаем sessionStorage
    sessionStorage.clear();
    
    // Очищаем cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Очищаем кэш сервиса
    chatService.clearChats();
    
    // Отключаем WebSocket
    websocketService.disconnect();
    
    // Сбрасываем состояние
    setUser(null);
    
    // Принудительно очищаем кэш браузера
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
    
    // Перезагружаем страницу для полной очистки
    window.location.href = '/';
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 