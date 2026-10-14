-- T12 : mesure d'audience interne, sans cookie ni identifiant (pas d'utilisateur, pas d'IP, pas d'agent utilisateur).
-- Écriture par le service role uniquement : RLS activée sans policy.

create table public.analytics_events (
  id bigint generated always as identity primary key,
  name text not null,
  path text,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index analytics_events_name_created_idx on public.analytics_events (name, created_at desc);
alter table public.analytics_events enable row level security;
