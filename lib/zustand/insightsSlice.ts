/**
 * Insights Slice - Smart analytics and insights
 * Brokmang. v1.1
 */

import { StateCreator } from 'zustand';
import type { Insight, InsightType } from '../types';

export interface InsightsSlice {
  // State
  insights: Insight[];
  loading: boolean;
  lastRefresh: number | null;
  
  // Actions
  setInsights: (insights: Insight[]) => void;
  addInsight: (insight: Insight) => void;
  clearInsights: () => void;
  setLoading: (loading: boolean) => void;
  refreshInsights: () => void;
  
  // Computed
  getInsightsByType: (type: InsightType) => Insight[];
  getHighConfidenceInsights: (minConfidence?: number) => Insight[];
  shouldRefresh: () => boolean;
}

export const createInsightsSlice: StateCreator<InsightsSlice> = (set, get) => ({
  // Initial state
  insights: [],
  loading: false,
  lastRefresh: null,
  
  // Actions
  setInsights: (insights) => {
    set({ 
      insights,
      lastRefresh: Date.now(),
    });
  },
  
  addInsight: (insight) => {
    set((state) => ({
      insights: [insight, ...state.insights],
    }));
  },
  
  clearInsights: () => {
    set({ insights: [], lastRefresh: null });
  },
  
  setLoading: (loading) => set({ loading }),
  
  refreshInsights: () => {
    set({ lastRefresh: Date.now() });
  },
  
  // Computed
  getInsightsByType: (type) => {
    return get().insights.filter(i => i.type === type);
  },
  
  getHighConfidenceInsights: (minConfidence = 70) => {
    return get().insights.filter(i => i.confidence >= minConfidence);
  },
  
  shouldRefresh: () => {
    const { lastRefresh } = get();
    if (!lastRefresh) return true;
    
    // Refresh if older than 24 hours
    const hoursSinceRefresh = (Date.now() - lastRefresh) / (1000 * 60 * 60);
    return hoursSinceRefresh >= 24;
  },
});

