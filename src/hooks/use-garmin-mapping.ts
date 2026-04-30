import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GarminSportMapping } from '@/types/training/sports.types';
import { garminMappingApi } from '@/services/api/training/garmin-mapping.api';
import { useSupabaseUserId } from './use-supabase-user';

const KEYS = {
  garminMappings: (uid: string) => ['garminMappings', uid] as const,
};

export function useGarminMappings() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.garminMappings(userId ?? ''),
    queryFn: () => garminMappingApi.getAll(),
    enabled: !!userId,
  });
}

export function useUpsertGarminMapping() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mapping: Partial<GarminSportMapping>) =>
      garminMappingApi.upsert(mapping, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.garminMappings(userId!) });
    },
  });
}

export function useDeleteGarminMapping() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => garminMappingApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.garminMappings(userId!) });
    },
  });
}
