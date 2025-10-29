/**
 * Notifications Page - Full notification center
 * Brokmang. v1.1
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Filter, Loader2, Trash2, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/notifications/notification-card";
import { useNotifications, useAuth } from "@/lib/zustand/store";
import { supabase } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { user, currentOrgId } = useAuth();
  const {
    notifications,
    unreadCount,
    filter,
    setNotifications,
    markAsRead,
    deleteNotification,
    setFilter,
    getFilteredNotifications,
  } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user && currentOrgId) {
      loadNotifications();
    }
  }, [user, currentOrgId]);
  
  const loadNotifications = async () => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('org_id', currentOrgId)
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
      markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);
      
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
      
      if (error) throw error;
      
      unreadIds.forEach(id => markAsRead(id));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };
  
  const filteredNotifications = getFilteredNotifications();
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 && 's'}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'alerts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('alerts')}
          >
            Alerts
          </Button>
          <Button
            variant={filter === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('system')}
          >
            System
          </Button>
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>
      
      {/* Notifications List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {filter === 'all'
                ? "You're all caught up! No notifications to show."
                : `No ${filter} notifications to display.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

