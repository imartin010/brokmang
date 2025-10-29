/**
 * Audit Logger Tests
 * Brokmang. v1.1
 */

import { createDiff, getAuditActionDisplay } from '@/lib/audit-logger';
import type { AuditAction } from '@/lib/audit-logger';

describe('Audit Logger Utilities', () => {
  describe('createDiff', () => {
    it('detects changed fields', () => {
      const before = { name: 'John', age: 30, city: 'Cairo' };
      const after = { name: 'John', age: 31, city: 'Cairo' };
      
      const diff = createDiff(before, after);
      
      expect(diff.before).toEqual({ age: 30 });
      expect(diff.after).toEqual({ age: 31 });
    });

    it('handles added fields', () => {
      const before = { name: 'John' };
      const after = { name: 'John', age: 30 };
      
      const diff = createDiff(before as any, after as any);
      
      expect(diff.before).toEqual({});
      expect(diff.after).toEqual({ age: 30 });
    });

    it('handles removed fields', () => {
      const before = { name: 'John', age: 30 };
      const after = { name: 'John' };
      
      const diff = createDiff(before as any, after as any);
      
      expect(diff.before).toEqual({ age: 30 });
      expect(diff.after).toEqual({});
    });

    it('returns empty diff if nothing changed', () => {
      const before = { name: 'John', age: 30 };
      const after = { name: 'John', age: 30 };
      
      const diff = createDiff(before, after);
      
      expect(diff.before).toEqual({});
      expect(diff.after).toEqual({});
    });

    it('handles nested objects', () => {
      const before = { user: { name: 'John', role: 'ADMIN' } };
      const after = { user: { name: 'John', role: 'OWNER' } };
      
      const diff = createDiff(before, after);
      
      expect(diff.before.user).toEqual({ name: 'John', role: 'ADMIN' });
      expect(diff.after.user).toEqual({ name: 'John', role: 'OWNER' });
    });
  });

  describe('getAuditActionDisplay', () => {
    it('returns display info for known actions', () => {
      const display = getAuditActionDisplay('AGENT_CREATED');
      
      expect(display.label).toBe('Agent Created');
      expect(display.color).toBe('green');
      expect(display.icon).toBe('UserCircle');
    });

    it('returns different colors for different action types', () => {
      const created = getAuditActionDisplay('AGENT_CREATED');
      const updated = getAuditActionDisplay('AGENT_UPDATED');
      const deleted = getAuditActionDisplay('AGENT_DELETED');
      
      expect(created.color).toBe('green');
      expect(updated.color).toBe('blue');
      expect(deleted.color).toBe('red');
    });

    it('returns default for unknown actions', () => {
      const display = getAuditActionDisplay('UNKNOWN_ACTION' as AuditAction);
      
      expect(display.label).toBe('UNKNOWN_ACTION');
      expect(display.color).toBe('gray');
      expect(display.icon).toBe('Activity');
    });
  });
});

