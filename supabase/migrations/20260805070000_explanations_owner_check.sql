-- =============================================================================
-- Ownership: at least one of user_id / guest_id must be present
-- =============================================================================

alter table public.explanations
  drop constraint if exists explanations_owner_present_check;

alter table public.explanations
  add constraint explanations_owner_present_check
  check (user_id is not null or guest_id is not null);

comment on constraint explanations_owner_present_check on public.explanations is
  'Each explanation must belong to an authenticated user and/or a guest identity.';
