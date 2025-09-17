import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface UIState {
  isLoading: boolean;
  notifications: Notification[];
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  modals: {
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  isLoading: false,
  notifications: [],
  sidebarOpen: false,
  theme: 'light',
  modals: {},
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },

    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },

    toggleModal: (state, action: PayloadAction<string>) => {
      const modalKey = action.payload;
      state.modals[modalKey] = !state.modals[modalKey];
    },

    initializeTheme: (state) => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) {
        state.theme = savedTheme;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.theme = prefersDark ? 'dark' : 'light';
        localStorage.setItem('theme', state.theme);
      }
    },
  },
});

export const {
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  openModal,
  closeModal,
  toggleModal,
  initializeTheme,
} = uiSlice.actions;