-- T25 : envoi des newsletters. Migration additive. Service role uniquement (RLS activée, aucun droit anon/authenticated).
-- newsletter_campaigns : une ligne par envoi. content_hash fige le contenu (objet, introduction, articles) : un envoi repris
--   avec un contenu différent est refusé, pour que tous les abonnés reçoivent le même message.
-- newsletter_deliveries : une ligne par destinataire et par campagne, créée avant l'envoi (réservation). L'unicité empêche
--   un double envoi, y compris si deux appels se chevauchent ; la ligne est supprimée si l'envoi échoue, pour permettre la reprise.

create table public.newsletter_campaigns (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{2,59}$'),
  subject text not null check (char_length(subject) between 3 and 150),
  content_hash text not null,
  created_at timestamptz not null default now()
);

create table public.newsletter_deliveries (
  campaign_id text not null references public.newsletter_campaigns (id) on delete cascade,
  subscriber_id uuid not null references public.newsletter_subscribers (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (campaign_id, subscriber_id)
);

alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_deliveries enable row level security;
revoke all on public.newsletter_campaigns from anon, authenticated;
revoke all on public.newsletter_deliveries from anon, authenticated;
