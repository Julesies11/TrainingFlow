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
  type: 'Race' | 'Goal' | 'Test';
  title: string;
  priority: 'A' | 'B' | 'C';
  description?: string;
  segments?: EventSegment[];
}
