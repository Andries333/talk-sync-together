import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { STATIC_CALENDAR_EVENTS } from '@/staticCalendarData';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  category: string;
  created_by?: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [birthdays, setBirthdays] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_time: '',
    category: 'ander'
  });

  const monthNames = [
    'Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie',
    'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag'];

  const categories = {
    vergadering: { label: '📋 Vergadering', color: 'bg-destructive', textColor: 'text-destructive-foreground' },
    sport: { label: '⚽ Sport', color: 'bg-orange-500', textColor: 'text-white' },
    'groen-uur': { label: '🌱 Groen Uur', color: 'bg-accent', textColor: 'text-accent-foreground' },
    stoof: { label: '🍽️ STOOF', color: 'bg-secondary', textColor: 'text-secondary-foreground' },
    ketel: { label: '☕ KETEL', color: 'bg-purple-600', textColor: 'text-white' },
    ander: { label: '📌 Ander', color: 'bg-primary', textColor: 'text-primary-foreground' },
    verjaarsdag: { label: '🎂 Verjaarsdag', color: 'bg-accent', textColor: 'text-accent-foreground' }
  };
  
  const isMobile = useIsMobile();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    touchCurrentRef.current = touchStartRef.current;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchCurrentRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchCurrentRef.current) return;
    const dx = touchCurrentRef.current.x - touchStartRef.current.x;
    const dy = touchCurrentRef.current.y - touchStartRef.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dy) < 30) {
      navigateMonth(dx < 0 ? 'next' : 'prev');
    }
    touchStartRef.current = null;
    touchCurrentRef.current = null;
  };

  useEffect(() => {
    fetchEvents();
    
    // Real-time subscription
    const channel = supabase
      .channel('calendar-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'calendar_events' },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      toast("Fout: Kon nie gebeurtenisse laai nie");
    } else {
      setEvents(data || []);
    }
  };

  const fetchBirthdays = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, verjaarsdag')
      .not('verjaarsdag', 'is', null);

    if (error) {
      return;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const result: CalendarEvent[] = [];

    (data || []).forEach((p: any) => {
      if (!p.verjaarsdag) return;
      const dob = new Date(p.verjaarsdag);
      const birthdayThisYear = new Date(year, dob.getMonth(), dob.getDate());
      if (birthdayThisYear.getMonth() !== month) return;
      const age = year - dob.getFullYear();
      const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Onbekend';
      result.push({
        id: `bday-${p.user_id}-${year}`,
        title: `${name} verjaar ${age}`,
        event_date: birthdayThisYear.toISOString().split('T')[0],
        event_time: undefined,
        category: 'verjaarsdag',
        created_by: p.user_id,
      });
    });

    setBirthdays(result);
  };

  useEffect(() => {
    fetchBirthdays();
  }, [currentDate]);

  const addEvent = async () => {
    if (!selectedDate || !eventForm.title.trim()) {
      toast("Fout: Vul asseblief alle verpligte velde in");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast("Fout: Jy moet aangemeld wees om gebeurtenisse by te voeg");
        return;
      }

      const { error } = await supabase
        .from('calendar_events')
        .insert([{
          title: eventForm.title.trim(),
          description: eventForm.description.trim() || null,
          event_date: selectedDate.toISOString().split('T')[0],
          event_time: eventForm.event_time || null,
          category: eventForm.category,
          created_by: user.id
        }]);

      if (error) {
        toast("Fout: Kon nie gebeurtenis voeg nie");
      } else {
        toast("Sukses: Gebeurtenis suksesvol bygevoeg");
        setIsDialogOpen(false);
        setEventForm({ title: '', description: '', event_time: '', category: 'ander' });
        setSelectedDate(null);
      }
    } catch (error) {
      toast("Fout: Kon nie gebeurtenis voeg nie");
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const combined = [
      ...events.filter(event => event.event_date === dateString),
      ...birthdays.filter(event => event.event_date === dateString),
      ...STATIC_CALENDAR_EVENTS.filter(event => event.event_date === dateString),
    ];
    const uniq = new Map<string, CalendarEvent>();
    combined.forEach((e) => {
      const key = `${e.event_date}|${e.title}|${e.category}`;
      if (!uniq.has(key)) uniq.set(key, e);
    });
    return Array.from(uniq.values());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-background to-muted/30">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="h-4 w-4" />
            Vorige
          </Button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">BKO Studentesake Kalender</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
          >
            Volgende
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div
          className="grid grid-cols-7 gap-1 sm:gap-3 p-1 sm:p-2 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Day headers */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 sm:p-4 text-center font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-xl shadow-sm text-[10px] sm:text-base"
            >
              {isMobile ? day.slice(0, 1) : day.slice(0, 3)}
            </div>
          ))}
          
          {/* Calendar days */}
            {days.map((date, index) => (
              <div
                key={index}
                className={`min-h-[72px] sm:min-h-[140px] p-1 sm:p-3 rounded-xl cursor-pointer transition-all duration-300 transform
                  ${date ? 'hover:shadow-lg hover:scale-105 hover:-translate-y-1 bg-card border border-border/50 hover:border-primary/30' : ''}
                  ${date && isToday(date) ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary shadow-lg ring-2 ring-primary/20' : ''}
                  ${!date ? 'opacity-0 pointer-events-none' : ''}
                `}
                onClick={() => date && handleDateClick(date)}
              >
                {date && (
                  <>
                    <div
                      className={`text-xs sm:text-lg font-bold mb-1 sm:mb-3 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-colors
                        ${isToday(date) ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-primary/10'}
                      `}
                    >
                      {date.getDate()}
                    </div>
                    {isMobile ? (
                      <div className="mt-1">
                        {getEventsForDate(date).length > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            {getEventsForDate(date).length} gebeure
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {getEventsForDate(date).slice(0, 3).map((event) => {
                          const category = categories[event.category as keyof typeof categories] || categories.ander;
                          return (
                            <Badge
                              key={event.id}
                              className={`text-xs block truncate px-2 py-1 rounded-md shadow-sm hover:shadow-md transition-shadow ${category.color} ${category.textColor}`}
                            >
                              <span className="mr-1">{category.label.split(' ')[0]}</span>
                              {event.title}
                            </Badge>
                          );
                        })}
                        {getEventsForDate(date).length > 3 && (
                          <Badge variant="outline" className="text-xs bg-muted/50 hover:bg-muted">
                            +{getEventsForDate(date).length - 3} meer
                          </Badge>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
        </div>

        {/* Add Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted/30 border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Voeg Gebeurtenis By
                {selectedDate && (
                  <span className="block text-sm font-normal text-muted-foreground mt-2 bg-gradient-to-r from-muted to-muted/50 bg-clip-text text-transparent">
                    📅 {selectedDate.toLocaleDateString('af-ZA', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Byvoorbeeld: Vergadering"
                />
              </div>
              
              <div>
                <Label htmlFor="time">Tyd</Label>
                <Input
                  id="time"
                  type="time"
                  value={eventForm.event_time}
                  onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Select value={eventForm.category} onValueChange={(value) => setEventForm({ ...eventForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Beskrywing</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Ekstra besonderhede (opsioneel)"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-6">
                <Button 
                  onClick={addEvent} 
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  💾 Stoor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  className="flex-1 hover:bg-muted/50 transition-all duration-200"
                >
                  ❌ Kanselleer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Calendar;