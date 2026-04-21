import { Event, EventSegment } from '@/types/training';
import { supabase } from '@/lib/supabase';

interface DbSegmentWithSportName {
  id: string;
  event_id: string;
  sport_type_id: string;
  sport_name?: string;
  planned_duration_minutes: number | null;
  planned_distance_kilometers: number | null;
  effort_level: number;
  segment_order: number;
}

interface DbSegmentFromSupabase {
  id: string;
  event_id: string;
  sport_type_id: string;
  pf_sport_types: { name: string } | null;
  planned_duration_minutes: number | null;
  planned_distance_kilometers: number | null;
  effort_level: number;
  segment_order: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbSegment(s: any): EventSegment {
  return {
    id: s.id,
    eventId: s.event_id,
    sportTypeId: s.sport_type_id,
    sportName: s.sport_name,
    plannedDurationMinutes: s.planned_duration_minutes,
    plannedDistanceKilometers: s.planned_distance_kilometers,
    effortLevel: s.effort_level,
    segmentOrder: s.segment_order,
  };
}

function mapDbEvent(e: {
  id: string;
  date: string;
  type: string;
  title: string;
  priority: string;
  description?: string;
  segments?: DbSegmentWithSportName[];
}): Event {
  return {
    id: e.id,
    date: e.date,
    type: e.type as Event['type'],
    title: e.title,
    priority: e.priority as Event['priority'],
    description: e.description,
    segments: e.segments ? e.segments.map(mapDbSegment) : [],
  };
}

export const eventsApi = {
  async getAll(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('pf_events')
      .select(
        `
        *,
        segments:pf_event_segments(
          id,
          event_id,
          sport_type_id,
          pf_sport_types(name),
          planned_duration_minutes,
          planned_distance_kilometers,
          effort_level,
          segment_order
        )
      `,
      )
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map((e) => {
      const segments = (e.segments || []).map((s: DbSegmentFromSupabase) => ({
        ...s,
        sport_name: s.pf_sport_types?.name,
      }));
      return mapDbEvent({ ...e, segments });
    });
  },

  async create(event: Partial<Event>, userId: string): Promise<Event> {
    const { data: eventData, error: eventError } = await supabase
      .from('pf_events')
      .insert({
        user_id: userId,
        date: event.date,
        type: event.type,
        title: event.title,
        priority: event.priority,
        description: event.description,
      })
      .select()
      .single();

    if (eventError) throw eventError;

    if (event.segments && event.segments.length > 0) {
      const segmentsToInsert = event.segments.map((seg, idx) => ({
        event_id: eventData.id,
        sport_type_id: seg.sportTypeId,
        planned_duration_minutes: seg.plannedDurationMinutes || null,
        planned_distance_kilometers: seg.plannedDistanceKilometers || null,
        effort_level: seg.effortLevel,
        segment_order: seg.segmentOrder ?? idx,
      }));

      const { error: segmentsError } = await supabase
        .from('pf_event_segments')
        .insert(segmentsToInsert);

      if (segmentsError) throw segmentsError;
    }

    const { data: fullEvent, error: fetchError } = await supabase
      .from('pf_events')
      .select(
        `
        *,
        segments:pf_event_segments(
          id,
          event_id,
          sport_type_id,
          pf_sport_types(name),
          planned_duration_minutes,
          planned_distance_kilometers,
          effort_level,
          segment_order
        )
      `,
      )
      .eq('id', eventData.id)
      .single();

    if (fetchError) throw fetchError;

    const segments = (fullEvent.segments || []).map(
      (s: DbSegmentFromSupabase) => ({
        ...s,
        sport_name: s.pf_sport_types?.name,
      }),
    );

    return mapDbEvent({ ...fullEvent, segments });
  },

  async update(event: Event, userId: string): Promise<Event> {
    const { error: eventError } = await supabase
      .from('pf_events')
      .update({
        date: event.date,
        type: event.type,
        title: event.title,
        priority: event.priority,
        description: event.description,
      })
      .eq('id', event.id)
      .eq('user_id', userId);

    if (eventError) throw eventError;

    const { data: existingSegments, error: fetchError } = await supabase
      .from('pf_event_segments')
      .select('id')
      .eq('event_id', event.id);

    if (fetchError) throw fetchError;

    const existingIds = new Set((existingSegments || []).map((s) => s.id));
    const newSegmentIds = new Set(
      (event.segments || []).filter((s) => s.id).map((s) => s.id),
    );

    const toDelete = Array.from(existingIds).filter(
      (id) => !newSegmentIds.has(id),
    );
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('pf_event_segments')
        .delete()
        .in('id', toDelete);

      if (deleteError) throw deleteError;
    }

    if (event.segments && event.segments.length > 0) {
      for (let i = 0; i < event.segments.length; i++) {
        const seg = event.segments[i];
        const segmentData = {
          event_id: event.id,
          sport_type_id: seg.sportTypeId,
          planned_duration_minutes: seg.plannedDurationMinutes || null,
          planned_distance_kilometers: seg.plannedDistanceKilometers || null,
          effort_level: seg.effortLevel,
          segment_order: seg.segmentOrder ?? i,
        };

        if (seg.id && existingIds.has(seg.id)) {
          const { error: updateError } = await supabase
            .from('pf_event_segments')
            .update(segmentData)
            .eq('id', seg.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('pf_event_segments')
            .insert(segmentData);

          if (insertError) throw insertError;
        }
      }
    }

    const { data: fullEvent, error: finalFetchError } = await supabase
      .from('pf_events')
      .select(
        `
        *,
        segments:pf_event_segments(
          id,
          event_id,
          sport_type_id,
          pf_sport_types(name),
          planned_duration_minutes,
          planned_distance_kilometers,
          effort_level,
          segment_order
        )
      `,
      )
      .eq('id', event.id)
      .single();

    if (finalFetchError) throw finalFetchError;

    const segments = (fullEvent.segments || []).map(
      (s: DbSegmentFromSupabase) => ({
        ...s,
        sport_name: s.pf_sport_types?.name,
      }),
    );

    return mapDbEvent({ ...fullEvent, segments });
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('pf_events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
