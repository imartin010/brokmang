/**
 * Onboarding Slice - Wizard state management
 * Brokmang. v1.1
 */

import { StateCreator } from 'zustand';
import type { OnboardingData } from '../types';

export type OnboardingStep = 
  | 'organization'
  | 'branches'
  | 'teams'
  | 'agents'
  | 'kpi_settings'
  | 'finance_settings'
  | 'review';

const STEP_ORDER: OnboardingStep[] = [
  'organization',
  'branches',
  'teams',
  'agents',
  'kpi_settings',
  'finance_settings',
  'review',
];

export interface OnboardingSlice {
  // State
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: OnboardingData;
  isComplete: boolean;
  
  // Actions
  setCurrentStep: (step: OnboardingStep) => void;
  completeStep: (step: OnboardingStep) => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  resetOnboarding: () => void;
  markComplete: () => void;
  
  // Persistence
  saveDraft: () => void;
  loadDraft: () => void;
  
  // Computed
  getProgress: () => number;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  getCurrentStepIndex: () => number;
}

const INITIAL_DATA: OnboardingData = {
  organization: undefined,
  branches: [],
  teams: [],
  agents: [],
  kpiSettings: undefined,
  financeSettings: undefined,
};

export const createOnboardingSlice: StateCreator<OnboardingSlice> = (set, get) => ({
  // Initial state
  currentStep: 'organization',
  completedSteps: [],
  data: INITIAL_DATA,
  isComplete: false,
  
  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  
  completeStep: (step) => {
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    }));
    get().saveDraft();
  },
  
  updateData: (updates) => {
    set((state) => ({
      data: { ...state.data, ...updates },
    }));
    get().saveDraft();
  },
  
  nextStep: () => {
    const currentIndex = get().getCurrentStepIndex();
    if (currentIndex < STEP_ORDER.length - 1) {
      get().completeStep(get().currentStep);
      set({ currentStep: STEP_ORDER[currentIndex + 1] });
    }
  },
  
  previousStep: () => {
    const currentIndex = get().getCurrentStepIndex();
    if (currentIndex > 0) {
      set({ currentStep: STEP_ORDER[currentIndex - 1] });
    }
  },
  
  goToStep: (step) => {
    const targetIndex = STEP_ORDER.indexOf(step);
    const currentIndex = get().getCurrentStepIndex();
    
    // Can only go to completed steps or next step
    if (targetIndex <= currentIndex || targetIndex === currentIndex + 1) {
      set({ currentStep: step });
    }
  },
  
  resetOnboarding: () => {
    set({
      currentStep: 'organization',
      completedSteps: [],
      data: INITIAL_DATA,
      isComplete: false,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brokmang_onboarding_draft');
    }
  },
  
  markComplete: () => {
    set({ isComplete: true });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brokmang_onboarding_draft');
    }
  },
  
  // Persistence
  saveDraft: () => {
    if (typeof window !== 'undefined') {
      const state = {
        currentStep: get().currentStep,
        completedSteps: get().completedSteps,
        data: get().data,
        timestamp: Date.now(),
      };
      localStorage.setItem('brokmang_onboarding_draft', JSON.stringify(state));
    }
  },
  
  loadDraft: () => {
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem('brokmang_onboarding_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          // Only load if draft is less than 7 days old
          const isRecent = Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000;
          if (isRecent) {
            set({
              currentStep: parsed.currentStep,
              completedSteps: parsed.completedSteps,
              data: parsed.data,
            });
          }
        } catch (error) {
          console.error('Failed to load onboarding draft:', error);
        }
      }
    }
  },
  
  // Computed
  getProgress: () => {
    const completed = get().completedSteps.length;
    const total = STEP_ORDER.length;
    return Math.round((completed / total) * 100);
  },
  
  canGoNext: () => {
    const currentIndex = get().getCurrentStepIndex();
    return currentIndex < STEP_ORDER.length - 1;
  },
  
  canGoPrevious: () => {
    return get().getCurrentStepIndex() > 0;
  },
  
  getCurrentStepIndex: () => {
    return STEP_ORDER.indexOf(get().currentStep);
  },
});

