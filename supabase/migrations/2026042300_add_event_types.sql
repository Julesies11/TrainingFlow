-- 1. Create pf_event_types lookup table
create table public.pf_event_types (
    id uuid not null default gen_random_uuid (),
    name text not null,
    is_active boolean not null default true,
    created_by uuid null,
    created_at timestamp with time zone null default now(),
    constraint event_types_pkey primary key (id),
    constraint event_types_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete SET NULL
) TABLESPACE pg_default;

-- 2. Insert global default event types
insert into public.pf_event_types (name, created_by)
values 
    ('Race', null),
    ('Goal', null),
    ('Test', null);

-- 3. Enable RLS on pf_event_types
alter table public.pf_event_types enable row level security;

-- Policy to allow users to read global defaults and their own custom types
create policy "Users can view global and own event types"
on public.pf_event_types for select
using (created_by is null or created_by = auth.uid());

-- Policy to allow users to insert their own custom types
create policy "Users can insert own event types"
on public.pf_event_types for insert
with check (created_by = auth.uid());

-- Policy to allow users to update their own custom types
create policy "Users can update own event types"
on public.pf_event_types for update
using (created_by = auth.uid());

-- 4. Alter pf_events to use the new lookup table
alter table public.pf_events add column event_type_id uuid;

-- 5. Backfill event_type_id by matching the name in type
do $$
begin
    update public.pf_events e
    set event_type_id = (select id from public.pf_event_types where name = e.type limit 1);
    
    -- For any that don't match exactly (e.g. if we had more), we could map to a default or leave as null.
    -- Since we only have Race, Goal, Test, it should be fine.
end $$;

-- 6. Add foreign key and clean up
alter table public.pf_events add constraint pf_events_event_type_id_fkey foreign key (event_type_id) references public.pf_event_types(id) on delete restrict;

-- If we want to enforce it's not null, we can do that now.
-- But we need to make sure we didn't miss any in the backfill.
-- Any leftovers will default to 'Race' id.
update public.pf_events set event_type_id = (select id from public.pf_event_types where name = 'Race') where event_type_id is null;

alter table public.pf_events alter column event_type_id set not null;

-- Now drop the old type column
alter table public.pf_events drop column type;
