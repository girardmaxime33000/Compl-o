-- T25 : capture d'e-mail du blog (newsletter en double opt-in). Migration additive.
-- Écriture et lecture par le service role uniquement : RLS activée, aucun droit pour anon et authenticated.
-- Preuve de consentement : date, version du texte accepté, origine (blog ou blog:<slug>). Ni adresse IP ni agent utilisateur.
-- confirmation_token_hash : empreinte SHA-256 du jeton envoyé par e-mail (le jeton lui-même n'est jamais stocké).
-- Les lignes `pending` de plus de 7 jours sont supprimées par l'application.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254 and email = lower(email)),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  source text not null default 'blog' check (source ~ '^blog(:[a-z0-9-]{1,50})?$'),
  consent_version text not null,
  consent_at timestamptz not null default now(),
  confirmation_token_hash text,
  confirmation_sent_at timestamptz,
  confirmation_window_start timestamptz,
  confirmation_count integer not null default 0,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index newsletter_subscribers_email_idx on public.newsletter_subscribers (email);
create unique index newsletter_subscribers_token_idx on public.newsletter_subscribers (confirmation_token_hash)
  where confirmation_token_hash is not null;
create index newsletter_subscribers_sent_idx on public.newsletter_subscribers (confirmation_sent_at desc);

alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;
