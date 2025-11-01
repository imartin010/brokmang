/**
 * Role-Based Access Control (RBAC) Utilities
 * Phase-2 v1.1 - Brokmang.
 * 
 * Role Hierarchy: OWNER > ADMIN > TEAM_LEADER > ACCOUNTANT > AGENT
 */

import { UserRole } from './types';

// Role hierarchy levels (higher = more permissions)
const ROLE_LEVELS: Record<UserRole, number> = {
  OWNER: 100,
  ADMIN: 80,
  TEAM_LEADER: 60,
  ACCOUNTANT: 40,
  AGENT: 20,
};

// Permission definitions
export type Permission = 
  // Organization
  | 'org:read'
  | 'org:update'
  | 'org:delete'
  | 'org:manage_members'
  | 'org:manage_branding'
  
  // Branches
  | 'branches:read'
  | 'branches:create'
  | 'branches:update'
  | 'branches:delete'
  
  // Teams
  | 'teams:read'
  | 'teams:create'
  | 'teams:update'
  | 'teams:delete'
  | 'teams:manage_own'
  
  // Agents
  | 'agents:read'
  | 'agents:create'
  | 'agents:update'
  | 'agents:delete'
  | 'agents:manage_own_team'
  
  // Daily Logs
  | 'logs:read'
  | 'logs:create'
  | 'logs:update'
  | 'logs:delete'
  | 'logs:create_own'
  | 'logs:read_own'
  
  // KPI Settings
  | 'kpi_settings:read'
  | 'kpi_settings:update'
  
  // Finance
  | 'finance:read'
  | 'finance:update'
  
  // Reports
  | 'reports:read'
  | 'reports:generate'
  | 'reports:export'
  
  // Notifications
  | 'notifications:read_own'
  | 'notifications:manage'
  
  // Audit Logs
  | 'audit:read'
  
  // API Tokens
  | 'api_tokens:read'
  | 'api_tokens:manage'
  
  // Subscriptions
  | 'subscriptions:validate';

// Role-to-permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    // All permissions
    'org:read',
    'org:update',
    'org:delete',
    'org:manage_members',
    'org:manage_branding',
    'branches:read',
    'branches:create',
    'branches:update',
    'branches:delete',
    'teams:read',
    'teams:create',
    'teams:update',
    'teams:delete',
    'agents:read',
    'agents:create',
    'agents:update',
    'agents:delete',
    'logs:read',
    'logs:create',
    'logs:update',
    'logs:delete',
    'kpi_settings:read',
    'kpi_settings:update',
    'finance:read',
    'finance:update',
    'reports:read',
    'reports:generate',
    'reports:export',
    'notifications:read_own',
    'notifications:manage',
    'audit:read',
    'api_tokens:read',
    'api_tokens:manage',
    'subscriptions:validate',
  ],
  
  ADMIN: [
    'org:read',
    'org:update',
    'org:manage_members',
    'branches:read',
    'branches:create',
    'branches:update',
    'branches:delete',
    'teams:read',
    'teams:create',
    'teams:update',
    'teams:delete',
    'agents:read',
    'agents:create',
    'agents:update',
    'agents:delete',
    'logs:read',
    'logs:create',
    'logs:update',
    'logs:delete',
    'kpi_settings:read',
    'kpi_settings:update',
    'finance:read',
    'finance:update',
    'reports:read',
    'reports:generate',
    'reports:export',
    'notifications:read_own',
    'audit:read',
    'api_tokens:read',
    'api_tokens:manage',
    'subscriptions:validate',
  ],
  
  TEAM_LEADER: [
    'org:read',
    'branches:read',
    'teams:read',
    'teams:manage_own',
    'agents:read',
    'agents:manage_own_team',
    'logs:read',
    'logs:create',
    'logs:update',
    'kpi_settings:read',
    'finance:read',
    'reports:read',
    'reports:generate',
    'notifications:read_own',
  ],
  
  ACCOUNTANT: [
    'org:read',
    'branches:read',
    'teams:read',
    'agents:read',
    'logs:read',
    'kpi_settings:read',
    'finance:read',
    'finance:update',
    'reports:read',
    'reports:generate',
    'reports:export',
    'notifications:read_own',
  ],
  
  AGENT: [
    'logs:create_own',
    'logs:read_own',
    'reports:read',
    'notifications:read_own',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Check if a role is at least as high as the required role
 */
export function hasRoleLevel(role: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[role] >= ROLE_LEVELS[requiredRole];
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if role can manage another role (for member management)
 * OWNER can manage all roles
 * ADMIN can manage TEAM_LEADER, ACCOUNTANT, AGENT
 * Others cannot manage roles
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  if (managerRole === 'OWNER') return true;
  if (managerRole === 'ADMIN') {
    return ['TEAM_LEADER', 'ACCOUNTANT', 'AGENT'].includes(targetRole);
  }
  return false;
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    OWNER: 'Owner',
    ADMIN: 'Administrator',
    TEAM_LEADER: 'Team Leader',
    ACCOUNTANT: 'Accountant',
    AGENT: 'Agent',
  };
  return names[role];
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    OWNER: 'from-purple-500 to-pink-500',
    ADMIN: 'from-blue-500 to-cyan-500',
    TEAM_LEADER: 'from-amber-500 to-orange-500',
    ACCOUNTANT: 'from-green-500 to-emerald-500',
    AGENT: 'from-gray-500 to-slate-500',
  };
  return colors[role];
}

/**
 * Get available roles for user to assign (based on their role)
 */
export function getAssignableRoles(managerRole: UserRole): UserRole[] {
  if (managerRole === 'OWNER') {
    return ['ADMIN', 'TEAM_LEADER', 'ACCOUNTANT', 'AGENT'];
  }
  if (managerRole === 'ADMIN') {
    return ['TEAM_LEADER', 'ACCOUNTANT', 'AGENT'];
  }
  return [];
}

/**
 * Validate that required permissions are met
 * Throws error if not authorized
 */
export function requirePermissions(
  role: UserRole,
  requiredPermissions: Permission[]
): void {
  const missingPermissions = requiredPermissions.filter(
    (perm) => !hasPermission(role, perm)
  );
  
  if (missingPermissions.length > 0) {
    throw new Error(
      `Unauthorized: Missing permissions - ${missingPermissions.join(', ')}`
    );
  }
}

/**
 * Validate that user has required role level
 * Throws error if not authorized
 */
export function requireRole(userRole: UserRole, requiredRole: UserRole): void {
  if (!hasRoleLevel(userRole, requiredRole)) {
    throw new Error(
      `Unauthorized: Requires ${requiredRole} role or higher`
    );
  }
}

// Middleware helper for API routes
export type RBACContext = {
  userId: string;
  orgId: string;
  role: UserRole;
};

/**
 * Create RBAC context from request (to be used in API routes)
 */
export function createRBACContext(
  userId: string,
  orgId: string,
  role: UserRole
): RBACContext {
  return { userId, orgId, role };
}

/**
 * Check if user can access resource based on context
 */
export function canAccessResource(
  context: RBACContext,
  resource: {
    orgId: string;
    userId?: string;
    teamId?: string;
  },
  permission: Permission
): boolean {
  // Check org isolation
  if (context.orgId !== resource.orgId) {
    return false;
  }
  
  // Check permission
  if (!hasPermission(context.role, permission)) {
    return false;
  }
  
  // Additional checks for specific roles
  if (context.role === 'AGENT') {
    // Agents can only access their own resources
    return resource.userId === context.userId;
  }
  
  // TEAM_LEADER can access their team's resources (requires team check)
  // This would need additional logic in actual implementation
  
  return true;
}

