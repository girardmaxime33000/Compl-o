-- T14 : e-mails. Migration additive.
-- email_tips_optin : consentement explicite (défaut false) aux e-mails de conseils et d'alerte de plafond.
-- email_log : journal d'envoi, idempotence de la séquence et limitation d'envoi des factures. Service role uniquement.

alter table public.profiles add column email_tips_optin boolean not null default false;
grant update (email_tips_optin) on public.profiles to authenticated;

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  ref text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref)
);
create index email_log_user_kind_idx on public.email_log (user_id, kind, created_at desc);

alter table public.email_log enable row level security;
revoke all on public.email_log from anon, authenticated;
