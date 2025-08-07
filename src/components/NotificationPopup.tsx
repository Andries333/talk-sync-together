import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  sender_name: string;
  target_audience: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  posisie: string;
  posisie_hk_sr: string;
}

export default function NotificationPopup() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [currentUser]);

  useEffect(() => {
    if (notifications.length > 0 && !isOpen) {
      const nextNotification = notifications[0];
      setCurrentNotification(nextNotification);
      setIsOpen(true);
    }
  }, [notifications, isOpen]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, posisie, posisie_hk_sr')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setCurrentUser(profile);
      }
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      // Get all notifications first
      const { data: allNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user's read notifications
      const { data: readNotifications, error: readError } = await supabase
        .from('user_notifications')
        .select('notification_id')
        .eq('user_id', currentUser.user_id)
        .eq('is_read', true);

      if (readError) throw readError;

      const readNotificationIds = new Set(readNotifications?.map(rn => rn.notification_id) || []);

      // Filter notifications for this user and unread only
      const relevantNotifications = allNotifications?.filter(notification => {
        if (readNotificationIds.has(notification.id)) return false;
        return isNotificationRelevant(notification, currentUser);
      }) || [];

      setNotifications(relevantNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const isNotificationRelevant = (notification: Notification, user: Profile): boolean => {
    const audience = notification.target_audience;
    
    switch (audience) {
      case 'alle_leiers':
        return user.posisie === 'HK' || user.posisie === 'SR' || user.posisie === 'Personeel';
      case 'alle_personeel':
        return user.posisie === 'Personeel';
      case 'alle_hks':
        return user.posisie === 'HK';
      case 'alle_srs':
        return user.posisie === 'SR';
      case 'sport':
      case 'kultuur':
      case 'sosiaal':
      case 'studente_ondersteuning':
      case 'voorsitter':
      case 'ondervoorsitter':
        return user.posisie_hk_sr === audience || user.posisie === 'HK' || user.posisie === 'Personeel';
      default:
        return false;
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (currentUser && isNotificationRelevant(newNotification, currentUser)) {
            setNotifications(prev => [newNotification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .upsert([
          {
            user_id: currentUser.user_id,
            notification_id: notificationId,
            is_read: true,
            read_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // Remove from current notifications
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setIsOpen(false);
      setCurrentNotification(null);

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClose = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
  };

  if (!currentNotification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {currentNotification.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Van: {currentNotification.sender_name}
            </div>
            
            <div className="whitespace-pre-wrap">
              {currentNotification.message}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {new Date(currentNotification.created_at).toLocaleString('af-ZA')}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleClose}>
            Verstaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}