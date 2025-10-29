/**
 * RBAC Utility Tests
 * Brokmang. v1.1
 */

import {
  hasPermission,
  hasRoleLevel,
  canManageRole,
  getRolePermissions,
  getRoleDisplayName,
  getRoleBadgeColor,
  getAssignableRoles,
  requirePermissions,
  requireRole,
} from '@/lib/rbac';
import type { UserRole } from '@/lib/types';

describe('RBAC Utilities', () => {
  describe('hasPermission', () => {
    it('OWNER has all permissions', () => {
      expect(hasPermission('OWNER', 'org:delete')).toBe(true);
      expect(hasPermission('OWNER', 'agents:create')).toBe(true);
      expect(hasPermission('OWNER', 'finance:update')).toBe(true);
      expect(hasPermission('OWNER', 'audit:read')).toBe(true);
    });

    it('ADMIN has most permissions except org:delete and branding', () => {
      expect(hasPermission('ADMIN', 'org:read')).toBe(true);
      expect(hasPermission('ADMIN', 'org:update')).toBe(true);
      expect(hasPermission('ADMIN', 'org:delete')).toBe(false);
      expect(hasPermission('ADMIN', 'org:manage_branding')).toBe(false);
      expect(hasPermission('ADMIN', 'agents:create')).toBe(true);
    });

    it('TEAM_LEADER has team management permissions', () => {
      expect(hasPermission('TEAM_LEADER', 'teams:manage_own')).toBe(true);
      expect(hasPermission('TEAM_LEADER', 'agents:manage_own_team')).toBe(true);
      expect(hasPermission('TEAM_LEADER', 'teams:delete')).toBe(false);
      expect(hasPermission('TEAM_LEADER', 'finance:update')).toBe(false);
    });

    it('ACCOUNTANT has finance access', () => {
      expect(hasPermission('ACCOUNTANT', 'finance:read')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'finance:update')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'agents:create')).toBe(false);
      expect(hasPermission('ACCOUNTANT', 'reports:export')).toBe(true);
    });

    it('AGENT has minimal permissions', () => {
      expect(hasPermission('AGENT', 'logs:create_own')).toBe(true);
      expect(hasPermission('AGENT', 'logs:read_own')).toBe(true);
      expect(hasPermission('AGENT', 'logs:create')).toBe(false);
      expect(hasPermission('AGENT', 'agents:create')).toBe(false);
      expect(hasPermission('AGENT', 'org:read')).toBe(false);
    });
  });

  describe('hasRoleLevel', () => {
    it('returns true if role level is equal or higher', () => {
      expect(hasRoleLevel('OWNER', 'ADMIN')).toBe(true);
      expect(hasRoleLevel('ADMIN', 'TEAM_LEADER')).toBe(true);
      expect(hasRoleLevel('TEAM_LEADER', 'AGENT')).toBe(true);
      expect(hasRoleLevel('OWNER', 'OWNER')).toBe(true);
    });

    it('returns false if role level is lower', () => {
      expect(hasRoleLevel('ADMIN', 'OWNER')).toBe(false);
      expect(hasRoleLevel('AGENT', 'TEAM_LEADER')).toBe(false);
      expect(hasRoleLevel('ACCOUNTANT', 'ADMIN')).toBe(false);
    });
  });

  describe('canManageRole', () => {
    it('OWNER can manage all roles', () => {
      expect(canManageRole('OWNER', 'OWNER')).toBe(true);
      expect(canManageRole('OWNER', 'ADMIN')).toBe(true);
      expect(canManageRole('OWNER', 'TEAM_LEADER')).toBe(true);
      expect(canManageRole('OWNER', 'ACCOUNTANT')).toBe(true);
      expect(canManageRole('OWNER', 'AGENT')).toBe(true);
    });

    it('ADMIN cannot manage OWNER or ADMIN', () => {
      expect(canManageRole('ADMIN', 'OWNER')).toBe(false);
      expect(canManageRole('ADMIN', 'ADMIN')).toBe(false);
      expect(canManageRole('ADMIN', 'TEAM_LEADER')).toBe(true);
      expect(canManageRole('ADMIN', 'ACCOUNTANT')).toBe(true);
      expect(canManageRole('ADMIN', 'AGENT')).toBe(true);
    });

    it('TEAM_LEADER cannot manage any roles', () => {
      expect(canManageRole('TEAM_LEADER', 'OWNER')).toBe(false);
      expect(canManageRole('TEAM_LEADER', 'ADMIN')).toBe(false);
      expect(canManageRole('TEAM_LEADER', 'AGENT')).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('returns correct permissions for each role', () => {
      const ownerPerms = getRolePermissions('OWNER');
      const agentPerms = getRolePermissions('AGENT');
      
      expect(ownerPerms.length).toBeGreaterThan(agentPerms.length);
      expect(ownerPerms).toContain('org:delete');
      expect(agentPerms).toContain('logs:create_own');
      expect(agentPerms).not.toContain('org:delete');
    });
  });

  describe('getRoleDisplayName', () => {
    it('returns user-friendly role names', () => {
      expect(getRoleDisplayName('OWNER')).toBe('Owner');
      expect(getRoleDisplayName('ADMIN')).toBe('Administrator');
      expect(getRoleDisplayName('TEAM_LEADER')).toBe('Team Leader');
      expect(getRoleDisplayName('ACCOUNTANT')).toBe('Accountant');
      expect(getRoleDisplayName('AGENT')).toBe('Agent');
    });
  });

  describe('getRoleBadgeColor', () => {
    it('returns unique gradient for each role', () => {
      const colors = [
        getRoleBadgeColor('OWNER'),
        getRoleBadgeColor('ADMIN'),
        getRoleBadgeColor('TEAM_LEADER'),
        getRoleBadgeColor('ACCOUNTANT'),
        getRoleBadgeColor('AGENT'),
      ];
      
      // All should be different
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(5);
      
      // All should contain gradient classes
      colors.forEach(color => {
        expect(color).toContain('from-');
        expect(color).toContain('to-');
      });
    });
  });

  describe('getAssignableRoles', () => {
    it('OWNER can assign all roles except OWNER', () => {
      const roles = getAssignableRoles('OWNER');
      expect(roles).toContain('ADMIN');
      expect(roles).toContain('TEAM_LEADER');
      expect(roles).toContain('ACCOUNTANT');
      expect(roles).toContain('AGENT');
      expect(roles).not.toContain('OWNER');
    });

    it('ADMIN can assign limited roles', () => {
      const roles = getAssignableRoles('ADMIN');
      expect(roles).toContain('TEAM_LEADER');
      expect(roles).toContain('ACCOUNTANT');
      expect(roles).toContain('AGENT');
      expect(roles).not.toContain('OWNER');
      expect(roles).not.toContain('ADMIN');
    });

    it('TEAM_LEADER cannot assign any roles', () => {
      const roles = getAssignableRoles('TEAM_LEADER');
      expect(roles).toEqual([]);
    });
  });

  describe('requirePermissions', () => {
    it('does not throw if user has all required permissions', () => {
      expect(() => {
        requirePermissions('OWNER', ['agents:create', 'org:read']);
      }).not.toThrow();
    });

    it('throws if user is missing permissions', () => {
      expect(() => {
        requirePermissions('AGENT', ['agents:create']);
      }).toThrow('Unauthorized');
    });
  });

  describe('requireRole', () => {
    it('does not throw if user has required role level', () => {
      expect(() => {
        requireRole('OWNER', 'ADMIN');
      }).not.toThrow();
      
      expect(() => {
        requireRole('ADMIN', 'TEAM_LEADER');
      }).not.toThrow();
    });

    it('throws if user has insufficient role level', () => {
      expect(() => {
        requireRole('AGENT', 'ADMIN');
      }).toThrow('Unauthorized');
      
      expect(() => {
        requireRole('TEAM_LEADER', 'ADMIN');
      }).toThrow('Unauthorized');
    });
  });
});

