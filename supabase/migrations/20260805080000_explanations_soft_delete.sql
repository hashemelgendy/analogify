-- =============================================================================
-- Soft delete support for explanations
-- Never hard-delete in app flow; hide via deleted_at IS NULL filters.
-- Future cleanup example:
--   DELETE FROM public.explanations
--   WHERE deleted_at < now() - interval '30 days';
-- =============================================================================

alter table public.explanations
  add column if not exists deleted_at timestamptz null;

alter table public.explanations
  add column if not exists deleted_by text null;

comment on column public.explanations.deleted_at is
  'When set, the explanation is soft-deleted and hidden from list/detail UI.';

comment on column public.explanations.deleted_by is
  'Who soft-deleted: auth user uuid, or the literal ''guest'' for anonymous deletes.';

-- Active (not deleted) lookups for owned trails
create index if not exists explanations_active_user_id_created_at_idx
  on public.explanations (user_id, created_at desc)
  where deleted_at is null and user_id is not null;

create index if not exists explanations_active_guest_id_created_at_idx
  on public.explanations (guest_id, created_at desc)
  where deleted_at is null and guest_id is not null;

-- Optional: find rows eligible for permanent purge later
create index if not exists explanations_deleted_at_idx
  on public.explanations (deleted_at)
  where deleted_at is not null;
