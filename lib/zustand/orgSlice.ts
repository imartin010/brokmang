/**
 * Organization Slice - Multi-tenant organization management
 * Brokmang. v1.1
 */

import { StateCreator } from 'zustand';
import type { Organization, OrganizationWithMembership } from '../types';

export interface OrgSlice {
  // Organizations state
  organizations: OrganizationWithMembership[];
  currentOrg: Organization | null;
  orgLoading: boolean;
  
  // Actions
  setOrganizations: (orgs: OrganizationWithMembership[]) => void;
  setCurrentOrgData: (org: Organization | null) => void;
  addOrganization: (org: OrganizationWithMembership) => void;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => void;
  removeOrganization: (orgId: string) => void;
  setOrgLoading: (loading: boolean) => void;
  
  // Computed
  getOrgById: (orgId: string) => OrganizationWithMembership | undefined;
  getOrgsByRole: (role: string) => OrganizationWithMembership[];
}

export const createOrgSlice: StateCreator<OrgSlice> = (set, get) => ({
  // Initial state
  organizations: [],
  currentOrg: null,
  orgLoading: false,
  
  // Actions
  setOrganizations: (orgs) => set({ organizations: orgs }),
  
  setCurrentOrgData: (org) => set({ currentOrg: org }),
  
  addOrganization: (org) => {
    set((state) => ({
      organizations: [...state.organizations, org],
    }));
  },
  
  updateOrganization: (orgId, updates) => {
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === orgId ? { ...org, ...updates } : org
      ),
      currentOrg: state.currentOrg?.id === orgId
        ? { ...state.currentOrg, ...updates }
        : state.currentOrg,
    }));
  },
  
  removeOrganization: (orgId) => {
    set((state) => ({
      organizations: state.organizations.filter((org) => org.id !== orgId),
      currentOrg: state.currentOrg?.id === orgId ? null : state.currentOrg,
    }));
  },
  
  setOrgLoading: (loading) => set({ orgLoading: loading }),
  
  // Computed
  getOrgById: (orgId) => {
    return get().organizations.find((org) => org.id === orgId);
  },
  
  getOrgsByRole: (role) => {
    return get().organizations.filter((org) => org.membership.role === role);
  },
});

