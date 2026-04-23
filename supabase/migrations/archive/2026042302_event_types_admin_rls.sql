-- 1. Add role column to pf_profiles (if it doesn't exist)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name='pf_profiles' and column_name='role') then
        alter table public.pf_profiles add column role text not null default 'user';
    end if;
end $$;

-- 2. Add is_system column to pf_event_types (if it doesn't exist)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name='pf_event_types' and column_name='is_system') then
        alter table public.pf_event_types add column is_system boolean not null default false;
    end if;
end $$;

-- 3. Set existing system types (those where created_by is NULL)
update public.pf_event_types set is_system = true where created_by is null;

-- 4. Drop old policies to replace them with is_system based logic
drop policy if exists "Users can view global and own event types" on public.pf_event_types;
drop policy if exists "Users can insert own event types" on public.pf_event_types;
drop policy if exists "Users can update own event types" on public.pf_event_types;
drop policy if exists "Developers can manage all event types" on public.pf_event_types;
drop policy if exists "Users can update own or global event types" on public.pf_event_types;

-- 5. New secure policies for standard users
-- Standard users see system types OR their own custom types
create policy "Users can view system or own event types"
on public.pf_event_types for select
using (is_system = true or created_by = auth.uid());

-- Standard users can only insert custom types (is_system must be false)
create policy "Users can insert own custom event types"
on public.pf_event_types for insert
with check (is_system = false and created_by = auth.uid());

-- Standard users can only update their own custom types
create policy "Users can update own custom event types"
on public.pf_event_types for update
using (is_system = false and created_by = auth.uid());

-- 6. Administrative Bypass: Admins can manage EVERYTHING
-- This uses a subquery to check the pf_profiles table we just updated
drop policy if exists "Admins can manage all event types" on public.pf_event_types;
create policy "Admins can manage all event types"
on public.pf_event_types for all
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
