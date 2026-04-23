-- 1. Create pf_event_priorities lookup table
create table public.pf_event_priorities (
    id uuid not null default gen_random_uuid (),
    name text not null,
    is_active boolean not null default true,
    is_system boolean not null default false,
    created_by uuid null,
    created_at timestamp with time zone null default now(),
    constraint event_priorities_pkey primary key (id),
    constraint event_priorities_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete SET NULL
) TABLESPACE pg_default;

-- 2. Insert global default event priorities
insert into public.pf_event_priorities (name, is_system, created_by)
values 
    ('A', true, null),
    ('B', true, null),
    ('C', true, null);

-- 3. Enable RLS on pf_event_priorities
alter table public.pf_event_priorities enable row level security;

-- 4. New secure policies for standard users
-- Standard users see system priorities OR their own custom priorities
create policy "Users can view system or own event priorities"
on public.pf_event_priorities for select
using (is_system = true or created_by = auth.uid());

-- Standard users can only insert custom priorities (is_system must be false)
create policy "Users can insert own custom event priorities"
on public.pf_event_priorities for insert
with check (is_system = false and created_by = auth.uid());

-- Standard users can only update their own custom priorities
create policy "Users can update own custom event priorities"
on public.pf_event_priorities for update
using (is_system = false and created_by = auth.uid());

-- 5. Administrative Bypass: Admins can manage EVERYTHING
create policy "Admins can manage all event priorities"
on public.pf_event_priorities for all
using (
  exists (
    select 1 from public.pf_profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.pf_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- 6. Alter pf_events to use the new lookup table
alter table public.pf_events add column priority_id uuid;

-- 7. Backfill priority_id by matching the name in priority
do $$
begin
    update public.pf_events e
    set priority_id = (select id from public.pf_event_priorities where name = e.priority limit 1);
end $$;

-- 8. Add foreign key and clean up
alter table public.pf_events add constraint pf_events_priority_id_fkey foreign key (priority_id) references public.pf_event_priorities(id) on delete restrict;

-- Handle any nulls by defaulting to 'C' (lowest priority) just in case
update public.pf_events set priority_id = (select id from public.pf_event_priorities where name = 'C') where priority_id is null;

alter table public.pf_events alter column priority_id set not null;

-- Now drop the old priority column
alter table public.pf_events drop column priority;
