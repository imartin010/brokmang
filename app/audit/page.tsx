/**
 * Audit Logs Page (Owner/Admin Only)
 * Brokmang. v1.1
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileSearch, Filter, Download, Loader2, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/zustand/store";
import { supabase } from "@/lib/supabase-browser";
import { hasPermission } from "@/lib/rbac";
import { getAuditActionDisplay } from "@/lib/audit-logger";
import type { SystemLog } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function AuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    if (user) {
      loadAuditLogs();
    }
  }, [user]);
  
  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-16 text-center">
            <p className="text-muted-foreground">Please sign in first</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Allow all authenticated users to view audit logs (no org restriction)
  const canViewAudit = true;
  
  if (!canViewAudit) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-16 text-center">
            <FileSearch className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              Only Owners and Administrators can view audit logs
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.entity === filter);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900">
            <FileSearch className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">
              Complete activity trail for your organization
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <div className="flex gap-2">
              {['all', 'sales_agents'].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                </Button>
              ))}
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Log</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredLogs.length} entries
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const display = getAuditActionDisplay(log.action as any);
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${display.color}-500`} />
                            <span className="font-medium">{display.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.entity || '—'}
                          {log.entity_id && (
                            <span className="block text-xs font-mono">
                              {log.entity_id.substring(0, 8)}...
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Audit Logs</h3>
              <p className="text-muted-foreground">
                Activity logs will appear here as actions are performed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Info */}
      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🔒 Immutable Audit Trail
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            All audit logs are append-only and cannot be modified or deleted.
            This ensures complete compliance and accountability for all organizational activities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

