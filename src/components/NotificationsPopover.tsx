import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, ShoppingCart, AlertTriangle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/contexts/NotificationsContext";
import { formatDistanceToNow } from "date-fns";

export const NotificationsPopover = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "expiring":
        return AlertTriangle;
      case "shopping":
        return ShoppingCart;
      case "reminder":
        return Clock;
      case "achievement":
        return Trophy;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "expiring":
        return "destructive";
      case "shopping":
        return "default";
      case "reminder":
        return "secondary";
      case "achievement":
        return "outline";
      default:
        return "default";
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to the action URL if provided
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    
    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-accent/50 transition-colors ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full mt-1 ${
                      !notification.is_read ? 'bg-primary/20' : 'bg-primary/10'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        !notification.is_read ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm ${
                          !notification.is_read ? 'font-semibold' : 'font-medium text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Badge variant={getNotificationColor(notification.type)} className="text-xs">
                            {notification.type}
                          </Badge>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="p-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};