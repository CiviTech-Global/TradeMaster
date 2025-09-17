import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Auth Selectors
export const selectAuth = (state: RootState) => state.auth;

export const selectUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuth],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuth],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuth],
  (auth) => auth.error
);

export const selectAuthToken = createSelector(
  [selectAuth],
  (auth) => auth.token
);

// UI Selectors
export const selectUI = (state: RootState) => state.ui;

export const selectUILoading = createSelector(
  [selectUI],
  (ui) => ui.isLoading
);

export const selectNotifications = createSelector(
  [selectUI],
  (ui) => ui.notifications
);

export const selectSidebarOpen = createSelector(
  [selectUI],
  (ui) => ui.sidebarOpen
);

export const selectTheme = createSelector(
  [selectUI],
  (ui) => ui.theme
);

export const selectModals = createSelector(
  [selectUI],
  (ui) => ui.modals
);

export const selectIsModalOpen = (modalKey: string) =>
  createSelector(
    [selectModals],
    (modals) => modals[modalKey] || false
  );

// Combined Selectors
export const selectIsAnyLoading = createSelector(
  [selectAuthLoading, selectUILoading],
  (authLoading, uiLoading) => authLoading || uiLoading
);