/**
 * Zustand Store - Combined state management
 * Brokmang. v1.1
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './authSlice';
import { OnboardingSlice, createOnboardingSlice } from './onboardingSlice';
import { NotificationsSlice, createNotificationsSlice } from './notificationsSlice';
import { ReportsSlice, createReportsSlice } from './reportsSlice';
import { InsightsSlice, createInsightsSlice } from './insightsSlice';

// Combined store type
export type BrokmangStore = AuthSlice & 
  OnboardingSlice & 
  NotificationsSlice & 
  ReportsSlice & 
  InsightsSlice;

// Create the store with persistence
export const useBrokmangStore = create<BrokmangStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createOnboardingSlice(...a),
      ...createNotificationsSlice(...a),
      ...createReportsSlice(...a),
      ...createInsightsSlice(...a),
    }),
    {
      name: 'brokmang-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these keys (no organization data)
      }),
    }
  )
);

// Selector hooks for better performance
export const useAuth = () => useBrokmangStore((state) => ({
  user: state.user,
  loading: state.loading,
  userAccountType: state.userAccountType,
  setUser: state.setUser,
  setLoading: state.setLoading,
  setUserAccountType: state.setUserAccountType,
  signOut: state.signOut,
  isAuthenticated: state.isAuthenticated,
  isCEO: state.isCEO,
  isTeamLeader: state.isTeamLeader,
  hasFinancialAccess: state.hasFinancialAccess,
}));

export const useOnboarding = () => useBrokmangStore((state) => ({
  currentStep: state.currentStep,
  completedSteps: state.completedSteps,
  data: state.data,
  isComplete: state.isComplete,
  setCurrentStep: state.setCurrentStep,
  completeStep: state.completeStep,
  updateData: state.updateData,
  nextStep: state.nextStep,
  previousStep: state.previousStep,
  goToStep: state.goToStep,
  resetOnboarding: state.resetOnboarding,
  markComplete: state.markComplete,
  saveDraft: state.saveDraft,
  loadDraft: state.loadDraft,
  getProgress: state.getProgress,
  canGoNext: state.canGoNext,
  canGoPrevious: state.canGoPrevious,
  getCurrentStepIndex: state.getCurrentStepIndex,
}));

export const useNotifications = () => useBrokmangStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  loading: state.loading,
  filter: state.filter,
  setNotifications: state.setNotifications,
  addNotification: state.addNotification,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  deleteNotification: state.deleteNotification,
  setFilter: state.setFilter,
  getUnreadNotifications: state.getUnreadNotifications,
  getFilteredNotifications: state.getFilteredNotifications,
  getNotificationById: state.getNotificationById,
}));

export const useReports = () => useBrokmangStore((state) => ({
  reports: state.reports,
  generating: state.generating,
  currentTemplate: state.currentTemplate,
  setReports: state.setReports,
  addReport: state.addReport,
  setGenerating: state.setGenerating,
  setCurrentTemplate: state.setCurrentTemplate,
  getReportsByTemplate: state.getReportsByTemplate,
  getRecentReports: state.getRecentReports,
  getReportByMonth: state.getReportByMonth,
}));

export const useInsights = () => useBrokmangStore((state) => ({
  insights: state.insights,
  loading: state.loading,
  lastRefresh: state.lastRefresh,
  setInsights: state.setInsights,
  addInsight: state.addInsight,
  clearInsights: state.clearInsights,
  setLoading: state.setLoading,
  refreshInsights: state.refreshInsights,
  getInsightsByType: state.getInsightsByType,
  getHighConfidenceInsights: state.getHighConfidenceInsights,
  shouldRefresh: state.shouldRefresh,
}));

