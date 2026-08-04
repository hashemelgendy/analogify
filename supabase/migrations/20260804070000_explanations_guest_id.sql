-- =============================================================================
-- Guest isolation: explanations.guest_id
-- Persistent anonymous UUID (cookie-backed), independent of auth.users.
-- user_id remains for future authenticated ownership.
-- =============================================================================

alter table public.explanations
  add column if not exists guest_id uuid null;

comment on column public.explanations.guest_id is
  'Anonymous browser guest identity (httpOnly cookie). Null for pre-guest rows or auth-only rows. Future login can reclaim history by setting user_id where guest_id matches.';

comment on column public.explanations.user_id is
  'Authenticated owner (auth.users). When set, takes precedence over guest_id for ownership queries.';

-- Lookups by guest trail
create index if not exists explanations_guest_id_created_at_idx
  on public.explanations (guest_id, created_at desc)
  where guest_id is not null;

-- Lookups by authenticated user trail (future)
create index if not exists explanations_user_id_created_at_idx
  on public.explanations (user_id, created_at desc)
  where user_id is not null;

-- Optional helper for later guest → user conversion (callable after login):
-- update public.explanations
--   set user_id = auth.uid()
-- where guest_id = <cookie-guest-id>
--   and user_id is null;
