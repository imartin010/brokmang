/**
 * Notification Card Component
 * Brokmang. v1.1
 */

"use client";

import { motion } from "framer-motion";
import { 
  Bell, 
  AlertCircle, 
  Info, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Notification, NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

function getNotificationIcon(type: NotificationType) {
  const icons = {
    MISSED_LOG: AlertCircle,
    KPI_ALERT: TrendingDown,
    TAX_REMINDER: Info,
    SYSTEM: Bell,
    BREAK_EVEN_WARNING: AlertTriangle,
  };
  return icons[type] || Bell;
}

function getNotificationColor(type: NotificationType) {
  const colors = {
    MISSED_LOG: "from-orange-500 to-red-500",
    KPI_ALERT: "from-yellow-500 to-orange-500",
    TAX_REMINDER: "from-blue-500 to-cyan-500",
    SYSTEM: "from-purple-500 to-pink-500",
    BREAK_EVEN_WARNING: "from-red-500 to-pink-500",
  };
  return colors[type] || "from-gray-500 to-slate-500";
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false,
}: NotificationCardProps) {
  const Icon = getNotificationIcon(notification.type);
  const colorGradient = getNotificationColor(notification.type);
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(notification.id);
  };
  
  const content = (
    <Card className={cn(
      "transition-all hover:shadow-md",
      !notification.is_read && "border-l-4 border-l-blue-500"
    )}>
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "rounded-lg p-2 bg-gradient-to-br flex-shrink-0",
            colorGradient
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className={cn(
                  "font-semibold",
                  !notification.is_read && "text-foreground",
                  notification.is_read && "text-muted-foreground"
                )}>
                  {notification.title}
                </h4>
                <p className={cn(
                  "text-sm mt-1",
                  compact && "text-xs",
                  !notification.is_read && "text-foreground",
                  notification.is_read && "text-muted-foreground"
                )}>
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                {!notification.is_read && onMarkAsRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMarkAsRead}
                    className="h-8 w-8"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Action Link */}
            {notification.action_url && (
              <Link href={notification.action_url}>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 h-auto p-0 text-blue-600"
                >
                  <span>View Details</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  if (!notification.is_read) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }
  
  return content;
}

