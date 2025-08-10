// Auto-generated static calendar data mapped from provided JSON
// Exports a flat list of events that can be merged into the UI without DB changes

export interface StaticCalendarEvent {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string;
  category: string;
  description?: string;
}

// Raw JSON as provided
const RAW_CALENDAR_DATA: any = {
  "kalender_data": {
    "periode": "11 Augustus - 30 September 2025",
    "gebeurtenisse": [
      {"datum":"2025-08-11","datum_leesbaar":"11 Augustus 2025","weekdag":"Maandag","gebeurtenisse":[{"titel":"SS Afdelingsvergadering","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-12","datum_leesbaar":"12 Augustus 2025","weekdag":"Dinsdag","gebeurtenisse":[{"titel":"KETEL","kategorie":"ketel","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-13","datum_leesbaar":"13 Augustus 2025","weekdag":"Woensdag","gebeurtenisse":[{"titel":"GROEN UUR","kategorie":"groen-uur","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-14","datum_leesbaar":"14 Augustus 2025","weekdag":"Donderdag","gebeurtenisse":[{"titel":"STOOF","kategorie":"stoof","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-17","datum_leesbaar":"17 Augustus 2025","weekdag":"Sondag","gebeurtenisse":[{"titel":"Sport & Ontspanning: Golf, Tennis & Fietsry","kategorie":"sport","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-18","datum_leesbaar":"18 Augustus 2025","weekdag":"Maandag","gebeurtenisse":[{"titel":"SS Afdelingsvergadering","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-19","datum_leesbaar":"19 Augustus 2025","weekdag":"Dinsdag","gebeurtenisse":[{"titel":"KETEL","kategorie":"ketel","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-20","datum_leesbaar":"20 Augustus 2025","weekdag":"Woensdag","gebeurtenisse":[{"titel":"GROEN UUR","kategorie":"groen-uur","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-21","datum_leesbaar":"21 Augustus 2025","weekdag":"Donderdag","gebeurtenisse":[{"titel":"STOOF","kategorie":"stoof","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-24","datum_leesbaar":"24 Augustus 2025","weekdag":"Sondag","gebeurtenisse":[{"titel":"Sport & Ontspanning: Squash, Rugby & Fietsry","kategorie":"sport","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-25","datum_leesbaar":"25 Augustus 2025","weekdag":"Maandag","gebeurtenisse":[{"titel":"SS Afdelingsvergadering","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-26","datum_leesbaar":"26 Augustus 2025","weekdag":"Dinsdag","gebeurtenisse":[{"titel":"KETEL","kategorie":"ketel","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-27","datum_leesbaar":"27 Augustus 2025","weekdag":"Woensdag","gebeurtenisse":[{"titel":"GROEN UUR","kategorie":"groen-uur","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-28","datum_leesbaar":"28 Augustus 2025","weekdag":"Donderdag","gebeurtenisse":[{"titel":"STOOF","kategorie":"stoof","tyd":"","beskrywing":""}]},
      {"datum":"2025-08-31","datum_leesbaar":"31 Augustus 2025","weekdag":"Sondag","gebeurtenisse":[{"titel":"Sport & Ontspanning: Golf, Tennis & Fietsry","kategorie":"sport","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-01","datum_leesbaar":"1 September 2025","weekdag":"Maandag","gebeurtenisse":[{"titel":"SS Afdelingsvergadering","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-02","datum_leesbaar":"2 September 2025","weekdag":"Dinsdag","gebeurtenisse":[{"titel":"KETEL","kategorie":"ketel","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-03","datum_leesbaar":"3 September 2025","weekdag":"Woensdag","gebeurtenisse":[{"titel":"GROEN UUR","kategorie":"groen-uur","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-04","datum_leesbaar":"4 September 2025","weekdag":"Donderdag","gebeurtenisse":[{"titel":"STOOF","kategorie":"stoof","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-07","datum_leesbaar":"7 September 2025","weekdag":"Sondag","gebeurtenisse":[{"titel":"Sport & Ontspanning: Squash, Rugby & Fietsry","kategorie":"sport","tyd":"","beskrywing":""},{"titel":"SS Koshuisraad","kategorie":"vergadering","tyd":"","beskrywing":""},{"titel":"Dien Augustus maandverslag in","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-08","datum_leesbaar":"8 September 2025","weekdag":"Maandag","gebeurtenisse":[{"titel":"SS Afdelingsvergadering","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-09","datum_leesbaar":"9 September 2025","weekdag":"Dinsdag","gebeurtenisse":[{"titel":"KETEL","kategorie":"ketel","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-10","datum_leesbaar":"10 September 2025","weekdag":"Woensdag","gebeurtenisse":[{"titel":"GROEN UUR","kategorie":"groen-uur","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-11","datum_leesbaar":"11 September 2025","weekdag":"Donderdag","gebeurtenisse":[{"titel":"STOOF","kategorie":"stoof","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-14","datum_leesbaar":"14 September 2025","weekdag":"Sondag","gebeurtenisse":[{"titel":"Sport & Ontspanning: Golf, Tennis & Fietsry","kategorie":"sport","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-15","datum_leesbaar":"15 September 2025","weekdag":"Maandag","gebeurtenisse":[{"titel":"SS Afdelingsvergadering","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-16","datum_leesbaar":"16 September 2025","weekdag":"Dinsdag","gebeurtenisse":[{"titel":"KETEL","kategorie":"ketel","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-17","datum_leesbaar":"17 September 2025","weekdag":"Woensdag","gebeurtenisse":[{"titel":"GROEN UUR","kategorie":"groen-uur","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-18","datum_leesbaar":"18 September 2025","weekdag":"Donderdag","gebeurtenisse":[{"titel":"STOOF","kategorie":"stoof","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-21","datum_leesbaar":"21 September 2025","weekdag":"Sondag","gebeurtenisse":[{"titel":"Sport & Ontspanning: Squash, Rugby & Fietsry","kategorie":"sport","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-22","datum_leesbaar":"22 September 2025","weekdag":"Maandag","gebeurtenisse":[{"titel":"SS Afdelingsvergadering","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-23","datum_leesbaar":"23 September 2025","weekdag":"Dinsdag","gebeurtenisse":[{"titel":"KETEL","kategorie":"ketel","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-24","datum_leesbaar":"24 September 2025","weekdag":"Woensdag","gebeurtenisse":[{"titel":"GROEN UUR","kategorie":"groen-uur","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-25","datum_leesbaar":"25 September 2025","weekdag":"Donderdag","gebeurtenisse":[{"titel":"STOOF","kategorie":"stoof","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-28","datum_leesbaar":"28 September 2025","weekdag":"Sondag","gebeurtenisse":[{"titel":"Sport & Ontspanning: Golf, Tennis & Fietsry","kategorie":"sport","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-29","datum_leesbaar":"29 September 2025","weekdag":"Maandag","gebeurtenisse":[{"titel":"SS Afdelingsvergadering","kategorie":"vergadering","tyd":"","beskrywing":""}]},
      {"datum":"2025-09-30","datum_leesbaar":"30 September 2025","weekdag":"Dinsdag","gebeurtenisse":[{"titel":"KETEL","kategorie":"ketel","tyd":"","beskrywing":""}]}
    ]
  }
};

export const STATIC_CALENDAR_EVENTS: StaticCalendarEvent[] =
  (RAW_CALENDAR_DATA?.kalender_data?.gebeurtenisse || []).flatMap((day: any) => {
    const items = Array.isArray(day?.gebeurtenisse) ? day.gebeurtenisse : [];
    return items.map((g: any, idx: number) => ({
      id: `static-${day.datum}-${idx}`,
      title: g.titel as string,
      event_date: day.datum as string,
      event_time: (g.tyd && String(g.tyd).trim() !== '') ? g.tyd : undefined,
      category: g.kategorie as string,
      description: (g.beskrywing && String(g.beskrywing).trim() !== '') ? g.beskrywing : undefined,
    } satisfies StaticCalendarEvent));
  });
