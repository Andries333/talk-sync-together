import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send } from 'lucide-react';

interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
  posisie: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setCurrentUser(profile);
      }
    }
  };

  const audienceOptions = [
    { value: 'alle_leiers', label: 'Alle Leiers' },
    { value: 'alle_personeel', label: 'Alle Personeel' },
    { value: 'alle_hks', label: 'Alle HKs' },
    { value: 'alle_srs', label: 'Alle SRs' },
    { value: 'sport', label: 'Sport' },
    { value: 'kultuur', label: 'Kultuur' },
    { value: 'sosiaal', label: 'Sosiaal' },
    { value: 'studente_ondersteuning', label: 'Studente Ondersteuning' },
    { value: 'voorsitter', label: 'Voorsitter' },
    { value: 'ondervoorsitter', label: 'Ondervoorsitter' }
  ];

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim() || !targetAudience || !currentUser) {
      toast({
        title: "Fout",
        description: "Vul asseblief alle velde in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const senderName = `${currentUser.first_name} ${currentUser.last_name}`;
      
      const { error } = await supabase
        .from('notifications')
        .insert([
          {
            title: title.trim(),
            message: message.trim(),
            sender_name: senderName,
            sender_id: currentUser.user_id,
            target_audience: targetAudience
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Kennisgewing is suksesvol gestuur!",
      });

      // Reset form
      setTitle('');
      setMessage('');
      setTargetAudience('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Fout",
        description: "Kon nie kennisgewing stuur nie. Probeer weer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin (HK or Personeel)
  const isAdmin = currentUser?.posisie === 'HK' || currentUser?.posisie === 'Personeel';

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Stuur Kennisgewing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuwe Kennisgewing</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kennisgewing titel..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="audience">Aan Wie</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger>
                <SelectValue placeholder="Kies teikengroep..." />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Boodskap</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tik jou kennisgewing hier..."
              rows={4}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Van: {currentUser?.first_name} {currentUser?.last_name}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Kanselleer
          </Button>
          <Button onClick={handleSendNotification} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Stuur...' : 'Stuur Kennisgewing'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}