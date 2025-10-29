/**
 * Audit Logger - Immutable audit trail for all mutations
 * Brokmang. v1.1
 */

import { supabase } from './supabase-browser';

export type AuditAction =
  // Organization
  | 'ORG_CREATED'
  | 'ORG_UPDATED'
  | 'ORG_DELETED'
  | 'ORG_BRANDING_UPDATED'
  
  // Members
  | 'MEMBER_INVITED'
  | 'MEMBER_REMOVED'
  | 'ROLE_CHANGED'
  
  // Branches
  | 'BRANCH_CREATED'
  | 'BRANCH_UPDATED'
  | 'BRANCH_DELETED'
  
  // Teams
  | 'TEAM_CREATED'
  | 'TEAM_UPDATED'
  | 'TEAM_DELETED'
  
  // Agents
  | 'AGENT_CREATED'
  | 'AGENT_UPDATED'
  | 'AGENT_DELETED'
  | 'AGENT_ACTIVATED'
  | 'AGENT_DEACTIVATED'
  
  // Daily Logs
  | 'LOG_CREATED'
  | 'LOG_UPDATED'
  | 'LOG_DELETED'
  
  // KPI Settings
  | 'KPI_SETTINGS_UPDATED'
  | 'KPI_WEIGHTS_CHANGED'
  
  // Finance
  | 'FINANCE_SETTINGS_UPDATED'
  | 'BREAK_EVEN_CALCULATED'
  | 'SCENARIO_SAVED'
  | 'SCENARIO_DELETED'
  
  // Scores
  | 'MONTHLY_SCORES_CALCULATED'
  
  // API
  | 'API_TOKEN_CREATED'
  | 'API_TOKEN_REVOKED';

export interface AuditLogEntry {
  org_id: string;
  user_id?: string;
  action: AuditAction;
  entity?: string;
  entity_id?: string;
  diff?: {
    before?: any;
    after?: any;
  };
  metadata?: Record<string, any>;
}

/**
 * Log an audit entry
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Capture client info
    const metadata = {
      ...entry.metadata,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    };
    
    // Insert via API route (which uses service role)
    const response = await fetch('/api/internal/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...entry,
        metadata,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to log audit entry:', await response.text());
    }
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit failures shouldn't block operations
  }
}

/**
 * Wrap an async operation with automatic audit logging
 */
export async function withAudit<T>(
  action: AuditAction,
  entity: string,
  entityId: string,
  operation: () => Promise<T>,
  options?: {
    orgId: string;
    userId?: string;
    before?: any;
    metadata?: Record<string, any>;
  }
): Promise<T> {
  const before = options?.before;
  
  try {
    // Execute the operation
    const result = await operation();
    
    // Log the audit entry
    await auditLog({
      org_id: options?.orgId || '',
      user_id: options?.userId,
      action,
      entity,
      entity_id: entityId,
      diff: {
        before,
        after: result,
      },
      metadata: options?.metadata,
    });
    
    return result;
  } catch (error) {
    // Log failed attempts too
    await auditLog({
      org_id: options?.orgId || '',
      user_id: options?.userId,
      action,
      entity,
      entity_id: entityId,
      diff: { before },
      metadata: {
        ...options?.metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed',
      },
    });
    
    throw error;
  }
}

/**
 * Log a simple action without wrapping
 */
export async function logAction(
  action: AuditAction,
  orgId: string,
  options?: {
    userId?: string;
    entity?: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  await auditLog({
    org_id: orgId,
    user_id: options?.userId,
    action,
    entity: options?.entity,
    entity_id: options?.entityId,
    metadata: options?.metadata,
  });
}

/**
 * Create a diff object for audit logs
 */
export function createDiff<T extends Record<string, any>>(
  before: T,
  after: T
): { before: Partial<T>; after: Partial<T> } {
  const diff: { before: Partial<T>; after: Partial<T> } = {
    before: {},
    after: {},
  };
  
  // Find changed fields
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  
  for (const key of allKeys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff.before[key as keyof T] = before[key];
      diff.after[key as keyof T] = after[key];
    }
  }
  
  return diff;
}

/**
 * Get audit log display info
 */
export function getAuditActionDisplay(action: AuditAction): {
  label: string;
  color: string;
  icon: string;
} {
  const displays: Record<string, { label: string; color: string; icon: string }> = {
    // Organization
    ORG_CREATED: { label: 'Organization Created', color: 'green', icon: 'Building2' },
    ORG_UPDATED: { label: 'Organization Updated', color: 'blue', icon: 'Building2' },
    ORG_DELETED: { label: 'Organization Deleted', color: 'red', icon: 'Building2' },
    ORG_BRANDING_UPDATED: { label: 'Branding Updated', color: 'purple', icon: 'Palette' },
    
    // Members
    MEMBER_INVITED: { label: 'Member Invited', color: 'green', icon: 'UserPlus' },
    MEMBER_REMOVED: { label: 'Member Removed', color: 'red', icon: 'UserMinus' },
    ROLE_CHANGED: { label: 'Role Changed', color: 'orange', icon: 'Shield' },
    
    // Branches
    BRANCH_CREATED: { label: 'Branch Created', color: 'green', icon: 'MapPin' },
    BRANCH_UPDATED: { label: 'Branch Updated', color: 'blue', icon: 'MapPin' },
    BRANCH_DELETED: { label: 'Branch Deleted', color: 'red', icon: 'MapPin' },
    
    // Teams
    TEAM_CREATED: { label: 'Team Created', color: 'green', icon: 'Users' },
    TEAM_UPDATED: { label: 'Team Updated', color: 'blue', icon: 'Users' },
    TEAM_DELETED: { label: 'Team Deleted', color: 'red', icon: 'Users' },
    
    // Agents
    AGENT_CREATED: { label: 'Agent Created', color: 'green', icon: 'UserCircle' },
    AGENT_UPDATED: { label: 'Agent Updated', color: 'blue', icon: 'UserCircle' },
    AGENT_DELETED: { label: 'Agent Deleted', color: 'red', icon: 'UserCircle' },
    AGENT_ACTIVATED: { label: 'Agent Activated', color: 'green', icon: 'CheckCircle' },
    AGENT_DEACTIVATED: { label: 'Agent Deactivated', color: 'gray', icon: 'XCircle' },
    
    // Daily Logs
    LOG_CREATED: { label: 'Log Created', color: 'green', icon: 'ClipboardList' },
    LOG_UPDATED: { label: 'Log Updated', color: 'blue', icon: 'ClipboardList' },
    LOG_DELETED: { label: 'Log Deleted', color: 'red', icon: 'ClipboardList' },
    
    // Settings
    KPI_SETTINGS_UPDATED: { label: 'KPI Settings Updated', color: 'purple', icon: 'Settings' },
    KPI_WEIGHTS_CHANGED: { label: 'KPI Weights Changed', color: 'orange', icon: 'Sliders' },
    FINANCE_SETTINGS_UPDATED: { label: 'Finance Updated', color: 'green', icon: 'DollarSign' },
    
    // Calculations
    BREAK_EVEN_CALCULATED: { label: 'Break-Even Calculated', color: 'cyan', icon: 'Calculator' },
    SCENARIO_SAVED: { label: 'Scenario Saved', color: 'green', icon: 'Save' },
    SCENARIO_DELETED: { label: 'Scenario Deleted', color: 'red', icon: 'Trash2' },
    MONTHLY_SCORES_CALCULATED: { label: 'Scores Calculated', color: 'purple', icon: 'TrendingUp' },
    
    // API
    API_TOKEN_CREATED: { label: 'API Token Created', color: 'blue', icon: 'Key' },
    API_TOKEN_REVOKED: { label: 'API Token Revoked', color: 'red', icon: 'KeyOff' },
  };
  
  return displays[action] || { label: action, color: 'gray', icon: 'Activity' };
}

