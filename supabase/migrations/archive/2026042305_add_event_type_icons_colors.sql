-- 1. Add icon_name and color_theme to pf_event_types
alter table public.pf_event_types add column if not exists icon_name text not null default 'Info';
alter table public.pf_event_types add column if not exists color_theme text not null default 'other';

-- 2. Backfill existing system types
update public.pf_event_types set icon_name = 'Flag', color_theme = 'afternoon' where name = 'Race' and is_system = true;
update public.pf_event_types set icon_name = 'Target', color_theme = 'morning' where name = 'Goal' and is_system = true;
update public.pf_event_types set icon_name = 'Trophy', color_theme = 'day' where name = 'Test' and is_system = true;
