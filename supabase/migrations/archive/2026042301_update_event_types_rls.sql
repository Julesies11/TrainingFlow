-- Revert the previous overly permissive policy
drop policy if exists "Users can update own or global event types" on public.pf_event_types;

-- Restore the correct policy: Users can only update their OWN custom event types
create policy "Users can update own event types"
on public.pf_event_types for update
using (created_by = auth.uid());

-- Since 'remove' sets is_active = false, it relies on the update policy above.
