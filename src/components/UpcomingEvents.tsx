import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { STATIC_CALENDAR_EVENTS } from "@/staticCalendarData";
import { supabase } from "@/integrations/supabase/client";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string | null;
  category: string;
  description?: string | null;
  created_by?: string | null;
}

const categories: Record<string, { label: string; color: string; textColor: string }> = {
  vergadering: { label: "📋 Vergadering", color: "bg-destructive", textColor: "text-destructive-foreground" },
  sport: { label: "⚽ Sport", color: "bg-orange-500", textColor: "text-white" },
  "groen-uur": { label: "🌱 Groen Uur", color: "bg-accent", textColor: "text-accent-foreground" },
  stoof: { label: "🍽️ STOOF", color: "bg-secondary", textColor: "text-secondary-foreground" },
  ketel: { label: "☕ KETEL", color: "bg-purple-600", textColor: "text-white" },
  ander: { label: "📌 Ander", color: "bg-primary", textColor: "text-primary-foreground" },
  verjaarsdag: { label: "🎂 Verjaarsdag", color: "bg-accent", textColor: "text-accent-foreground" },
};

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("af-ZA", { weekday: "long", day: "numeric", month: "long" });
}

function isWithinRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr + "T00:00:00");
  return d >= new Date(start.toDateString()) && d <= new Date(end.toDateString());
}

const UpcomingEvents: React.FC = () => {
  const [dbEvents, setDbEvents] = useState<CalendarEvent[]>([]);
  const [birthdays, setBirthdays] = useState<CalendarEvent[]>([]);

  const today = useMemo(() => new Date(), []);
  const end = useMemo(() => {
    const e = new Date(today);
    e.setDate(e.getDate() + 7);
    return e;
  }, [today]);

  useEffect(() => {
    const load = async () => {
      const startStr = today.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];

      // DB events in range
      const { data: evts } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("event_date", startStr)
        .lte("event_date", endStr)
        .order("event_date", { ascending: true });

      setDbEvents(evts || []);

      // Birthdays in range (handles year rollover)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, verjaarsdag")
        .not("verjaarsdag", "is", null);

      const bdays: CalendarEvent[] = [];
      (profiles || []).forEach((p: any) => {
        if (!p.verjaarsdag) return;
        const dob = new Date(p.verjaarsdag);
        let bday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (bday < today && end.getFullYear() > today.getFullYear()) {
          bday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
        }
        const bdayStr = bday.toISOString().split("T")[0];
        if (isWithinRange(bdayStr, today, end)) {
          const age = bday.getFullYear() - dob.getFullYear();
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || "Onbekend";
          bdays.push({
            id: `bday-${p.user_id}-${bday.getFullYear()}`,
            title: `${name} verjaar ${age}`,
            event_date: bdayStr,
            event_time: null,
            category: "verjaarsdag",
            created_by: p.user_id,
          });
        }
      });
      setBirthdays(bdays);
    };

    load();
  }, [today, end]);

  const staticInRange = useMemo(
    () => STATIC_CALENDAR_EVENTS.filter((e) => isWithinRange(e.event_date, today, end)),
    [today, end]
  );

  const upcoming = useMemo(() => {
    const combined = [...dbEvents, ...birthdays, ...staticInRange];
    const uniq = new Map<string, CalendarEvent>();
    combined.forEach((e) => {
      const key = `${e.event_date}|${e.title}|${e.category}`;
      if (!uniq.has(key)) uniq.set(key, e);
    });
    return Array.from(uniq.values()).sort((a, b) => {
      if (a.event_date !== b.event_date) return a.event_date.localeCompare(b.event_date);
      const ta = a.event_time || "99:99";
      const tb = b.event_time || "99:99";
      return ta.localeCompare(tb);
    });
  }, [dbEvents, birthdays, staticInRange]);

  if (!upcoming.length) {
    return <p className="text-muted-foreground">Geen opkomende gebeure in die volgende 7 dae nie.</p>;
  }

  return (
    <div className="space-y-3">
      {upcoming.map((e) => {
        const cat = categories[e.category] || categories["ander"];
        return (
          <div key={`${e.event_date}-${e.id}`} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-3 py-2">
            <div>
              <div className="text-sm font-medium">{e.title}</div>
              <div className="text-xs text-muted-foreground">{formatDateLabel(e.event_date)}</div>
            </div>
            <Badge className={`ml-3 ${cat.color} ${cat.textColor}`}>{cat.label}</Badge>
          </div>
        );
      })}
      <Separator className="my-1" />
    </div>
  );
};

export default UpcomingEvents;
