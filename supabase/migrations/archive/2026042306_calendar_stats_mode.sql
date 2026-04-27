-- Add calendar_stats_mode column to pf_profiles
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name='pf_profiles' and column_name='calendar_stats_mode') then
        alter table public.pf_profiles add column calendar_stats_mode boolean not null default true;
    end if;
end $$;
