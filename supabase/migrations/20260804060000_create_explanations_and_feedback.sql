-- =============================================================================
-- Analogify: initial production schema
-- explanations + feedback
-- Auth policies intentionally omitted (auth not implemented yet).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.difficulty_level as enum (
  'beginner',
  'intermediate',
  'advanced'
);

create type public.generation_mode as enum (
  'simpler',
  'another',
  'deeper'
);

-- -----------------------------------------------------------------------------
-- explanations
-- Stores AI-generated analogy explanations plus the original learner input.
-- -----------------------------------------------------------------------------
create table public.explanations (
  id uuid primary key default gen_random_uuid(),

  -- Learner input (as submitted to /api/explain)
  input_concept text not null,
  input_familiar_topics text[] not null default '{}',

  -- Generated AI content (mirrors app Explanation type fields)
  concept text not null,
  familiar_topics text[] not null default '{}',
  analogy_title text not null,
  analogy_content text not null,
  explanation text not null,
  key_points text[] not null default '{}',
  difficulty_level public.difficulty_level not null,

  -- Generation metadata
  generation_mode public.generation_mode not null default 'another',
  model_used text not null,

  -- Ownership (nullable until authentication ships)
  user_id uuid null references auth.users (id) on delete cascade,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Guardrails
  constraint explanations_input_concept_not_blank
    check (char_length(trim(input_concept)) > 0),
  constraint explanations_concept_not_blank
    check (char_length(trim(concept)) > 0),
  constraint explanations_analogy_title_not_blank
    check (char_length(trim(analogy_title)) > 0),
  constraint explanations_input_familiar_topics_not_empty
    check (cardinality(input_familiar_topics) > 0),
  constraint explanations_familiar_topics_not_empty
    check (cardinality(familiar_topics) > 0),
  constraint explanations_key_points_max
    check (cardinality(key_points) <= 20),
  constraint explanations_model_used_not_blank
    check (char_length(trim(model_used)) > 0)
);

comment on table public.explanations is
  'AI-generated analogy explanations. Ratings live in public.feedback, not here.';

comment on column public.explanations.input_concept is
  'Raw concept string the learner submitted before generation.';

comment on column public.explanations.input_familiar_topics is
  'Familiar topics the learner submitted; may differ slightly from model output.';

comment on column public.explanations.concept is
  'Concept as returned by the model (usually mirrors input_concept).';

comment on column public.explanations.familiar_topics is
  'Familiar topics associated with the generated analogy.';

comment on column public.explanations.generation_mode is
  'Refinement mode: simpler | another | deeper.';

comment on column public.explanations.model_used is
  'Model identifier that produced this row (e.g. gpt-4o-mini, mock).';

comment on column public.explanations.user_id is
  'Optional owner; references auth.users when the user is signed in.';

-- Indexes
create index explanations_created_at_idx
  on public.explanations (created_at desc);

create index explanations_concept_idx
  on public.explanations (concept);

create index explanations_user_id_idx
  on public.explanations (user_id)
  where user_id is not null;

create index explanations_difficulty_level_idx
  on public.explanations (difficulty_level);

-- -----------------------------------------------------------------------------
-- Reusable updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic BEFORE UPDATE trigger function to stamp updated_at.';

create trigger explanations_set_updated_at
  before update on public.explanations
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- feedback
-- Ratings and free-text comments linked to explanations.
-- -----------------------------------------------------------------------------
create table public.feedback (
  id uuid primary key default gen_random_uuid(),

  explanation_id uuid not null
    references public.explanations (id)
    on delete cascade,

  rating integer not null,
  comment text null,

  -- Ownership (nullable until authentication ships)
  user_id uuid null references auth.users (id) on delete cascade,

  created_at timestamptz not null default now(),

  constraint feedback_rating_range
    check (rating between 1 and 5),
  constraint feedback_comment_length
    check (comment is null or char_length(comment) <= 2000)
);

comment on table public.feedback is
  'User ratings and optional comments. One logical rating surface; not denormalized onto explanations.';

comment on column public.feedback.explanation_id is
  'Parent explanation; cascade-deletes when the explanation is removed.';

comment on column public.feedback.rating is
  'Star rating from 1 to 5.';

comment on column public.feedback.user_id is
  'Optional owner; references auth.users when the user is signed in.';

-- Indexes
create index feedback_explanation_id_idx
  on public.feedback (explanation_id);

create index feedback_created_at_idx
  on public.feedback (created_at desc);

create index feedback_user_id_idx
  on public.feedback (user_id)
  where user_id is not null;

-- -----------------------------------------------------------------------------
-- Row Level Security (enabled, no policies yet)
-- anon/authenticated have no access until policies are added.
-- service_role bypasses RLS for trusted server-side writes later.
-- -----------------------------------------------------------------------------
alter table public.explanations enable row level security;
alter table public.feedback enable row level security;
