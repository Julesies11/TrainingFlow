export interface EventTypeRecord {
  id: string;
  name: string;
  is_active: boolean;
  is_system: boolean;
  created_by?: string;
}

export interface EventPriorityRecord {
  id: string;
  name: string;
  is_active: boolean;
  is_system: boolean;
  created_by?: string;
}

export interface EventSegment {
  id: string;
  eventId: string;
  sportTypeId: string;
  sportName?: string;
  plannedDurationMinutes?: number;
  plannedDistanceKilometers?: number;
  effortLevel: number;
  segmentOrder: number;
}

export interface Event {
  id: string;
  date: string;
  eventTypeId: string;
  eventTypeName?: string;
  eventPriorityId: string;
  eventPriorityName?: string;
  title: string;
  priority: 'A' | 'B' | 'C'; // Temporarily keeping for backward compatibility during migration if needed, but updating UI to use ID
  description?: string;
  segments?: EventSegment[];
}
