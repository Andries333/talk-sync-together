import React, { useState, useEffect } from 'react';
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
    vergadering: { label: '📋 Vergadering', color: 'bg-red-600' },
    sport: { label: '⚽ Sport', color: 'bg-orange-500' },
    'groen-uur': { label: '🌱 Groen Uur', color: 'bg-green-500' },
    stoof: { label: '🍽️ STOOF', color: 'bg-blue-600' },
    ketel: { label: '☕ KETEL', color: 'bg-purple-600' },
    ander: { label: '📌 Ander', color: 'bg-gray-600' }
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

  const addEvent = async () => {
    if (!selectedDate || !eventForm.title.trim()) {
      toast("Fout: Vul asseblief alle verpligte velde in");
      return;
    }

    const { error } = await supabase
      .from('calendar_events')
      .insert([{
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || null,
        event_date: selectedDate.toISOString().split('T')[0],
        event_time: eventForm.event_time || null,
        category: eventForm.category
      }]);

    if (error) {
      toast("Fout: Kon nie gebeurtenis voeg nie");
    } else {
      toast("Sukses: Gebeurtenis suksesvol bygevoeg");
      setIsDialogOpen(false);
      setEventForm({ title: '', description: '', event_time: '', category: 'ander' });
      setSelectedDate(null);
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
    return events.filter(event => event.event_date === dateString);
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
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Vorige
          </Button>
          
          <h2 className="text-2xl font-bold text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="flex items-center gap-2"
          >
            Volgende
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center font-semibold bg-bko-primary text-white rounded">
              {day.slice(0, 3)}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((date, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border rounded cursor-pointer transition-colors
                ${date ? 'hover:bg-bko-light/50' : ''}
                ${date && isToday(date) ? 'bg-bko-accent-blue/20 border-bko-accent-blue' : 'border-gray-200'}
              `}
              onClick={() => date && handleDateClick(date)}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-2 ${isToday(date) ? 'text-bko-accent-blue font-bold' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDate(date).slice(0, 3).map((event) => (
                      <Badge
                        key={event.id}
                        variant="secondary"
                        className={`text-xs text-white block truncate ${categories[event.category as keyof typeof categories]?.color || 'bg-gray-500'}`}
                      >
                        {event.title}
                      </Badge>
                    ))}
                    {getEventsForDate(date).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{getEventsForDate(date).length - 3} meer
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Voeg Gebeurtenis By
                {selectedDate && (
                  <span className="block text-sm font-normal text-gray-600 mt-1">
                    {selectedDate.toLocaleDateString('af-ZA', { 
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
              
              <div className="flex gap-2 pt-4">
                <Button onClick={addEvent} className="flex-1">
                  Stoor
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Kanselleer
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