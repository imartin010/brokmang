/**
 * Reports Slice - Report generation and history
 * Brokmang. v1.1
 */

import { StateCreator } from 'zustand';
import type { ReportMetadata, ReportTemplate } from '../types';

export interface ReportsSlice {
  // State
  reports: ReportMetadata[];
  generating: boolean;
  currentTemplate: ReportTemplate | null;
  
  // Actions
  setReports: (reports: ReportMetadata[]) => void;
  addReport: (report: ReportMetadata) => void;
  setGenerating: (generating: boolean) => void;
  setCurrentTemplate: (template: ReportTemplate | null) => void;
  
  // Computed
  getReportsByTemplate: (template: ReportTemplate) => ReportMetadata[];
  getRecentReports: (limit?: number) => ReportMetadata[];
  getReportByMonth: (month: string, template: ReportTemplate) => ReportMetadata | undefined;
}

export const createReportsSlice: StateCreator<ReportsSlice> = (set, get) => ({
  // Initial state
  reports: [],
  generating: false,
  currentTemplate: null,
  
  // Actions
  setReports: (reports) => set({ reports }),
  
  addReport: (report) => {
    set((state) => ({
      reports: [report, ...state.reports],
    }));
  },
  
  setGenerating: (generating) => set({ generating }),
  
  setCurrentTemplate: (template) => set({ currentTemplate: template }),
  
  // Computed
  getReportsByTemplate: (template) => {
    return get().reports.filter(r => r.template === template);
  },
  
  getRecentReports: (limit = 10) => {
    return get().reports.slice(0, limit);
  },
  
  getReportByMonth: (month, template) => {
    return get().reports.find(r => r.month === month && r.template === template);
  },
});

