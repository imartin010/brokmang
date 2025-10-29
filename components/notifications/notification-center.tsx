/**
 * Notification Center - Dropdown Component
 * Brokmang. v1.1
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "./notification-card";
import { useNotifications, useAuth } from "@/lib/zustand/store";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const { user, currentOrgId } = useAuth();
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead,
    deleteNotification,
  } = useNotifications();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user && currentOrgId) {
      loadNotifications();
      subscribeToNotifications();
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
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const subscribeToNotifications = () => {
    if (!user || !currentOrgId) return;
    
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `org_id=eq.${currentOrgId}`,
        },
        (payload) => {
          const newNotification = payload.new as any;
          // Only add if it's for this user or org-wide
          if (!newNotification.user_id || newNotification.user_id === user.id) {
            addNotification(newNotification);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
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
      
      // Update local state
      unreadIds.forEach(id => markAsRead(id));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };
  
  // Always show bell, even if no user (will show login prompt)
  if (!user) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }
  
  const recentNotifications = notifications.slice(0, 5);
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>
      
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-96 bg-background border rounded-lg shadow-xl z-50 overflow-hidden max-h-[600px] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              
              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {!currentOrgId ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground text-center text-sm">
                      Select an organization to view notifications
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentNotifications.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {recentNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        compact
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground text-center">
                      No notifications yet
                    </p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {notifications.length > 5 && (
                <div className="p-3 border-t">
                  <Link href="/notifications" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      View All Notifications
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

