-- Quota atomique, limitation de débit, remboursements et impayés.
-- Migration additive : aucune donnée n'est supprimée. Toutes les fonctions sont réservées au service role.

-- ============================================================
-- P1.5 : réservation atomique d'une annonce du quota
-- ============================================================
-- Le quota était lu puis consommé sans verrou : des requêtes simultanées dépassaient le plafond. La réservation compte
-- les annonces de la période ET les réservations en cours (moins de 2 minutes, durée maximale d'une génération).
create table public.listing_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index listing_reservations_user_idx on public.listing_reservations (user_id, created_at desc);
alter table public.listing_reservations enable row level security;

-- Retourne l'identifiant de la réservation, ou null si le plafond de la période est atteint.
-- p_period : 'month' (mois civil UTC, comme le code applicatif) ou 'day' (jour calendaire, heure de Paris).
create or replace function public.claim_listing_slot(p_user uuid, p_limit int, p_period text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  period_start timestamptz;
  used int;
  reservation uuid;
begin
  if p_period = 'month' then
    period_start := date_trunc('month', now() at time zone 'UTC') at time zone 'UTC';
  elsif p_period = 'day' then
    period_start := date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris';
  else
    raise exception 'période invalide';
  end if;

  perform pg_advisory_xact_lock(hashtext('listing_slot:' || p_user::text));

  delete from public.listing_reservations where created_at < now() - interval '1 day';

  select
    (select count(*) from public.listings where user_id = p_user and created_at >= period_start)
    + (select count(*) from public.listing_reservations
        where user_id = p_user and created_at >= greatest(period_start, now() - interval '2 minutes'))
  into used;

  if used >= p_limit then
    return null;
  end if;

  insert into public.listing_reservations (user_id) values (p_user) returning id into reservation;
  return reservation;
end;
$$;

create or replace function public.release_listing_slot(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.listing_reservations where id = p_id;
$$;

-- ============================================================
-- P1.6 : limitation de débit (fenêtre fixe, atomique)
-- ============================================================
-- La clé ne contient aucune donnée en clair : identifiant utilisateur, ou empreinte d'adresse IP calculée côté serveur.
-- Les lignes de plus de 2 jours sont supprimées à chaque appel.
create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security;

-- Enregistre un appel et retourne vrai s'il reste dans la limite de la fenêtre.
create or replace function public.rate_limit_hit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  win timestamptz;
  current_hits int;
begin
  if p_window_seconds <= 0 or p_limit < 0 then
    raise exception 'paramètres invalides';
  end if;
  win := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  delete from public.rate_limits where window_start < now() - interval '2 days';

  insert into public.rate_limits (key, window_start, hits) values (p_key, win, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into current_hits;

  return current_hits <= p_limit;
end;
$$;

-- ============================================================
-- P1.7 : remboursement et litige du pack, impayés d'abonnement
-- ============================================================
-- Le lot de crédits mémorise le paiement Stripe qui l'a financé : un remboursement ou un litige peut le retirer,
-- et un même paiement ne crédite jamais deux fois.
alter table public.listing_credit_grants add column stripe_payment_intent text;
create unique index listing_credit_grants_payment_idx on public.listing_credit_grants (stripe_payment_intent)
  where stripe_payment_intent is not null;

drop function public.grant_listing_credits(uuid, int);
create function public.grant_listing_credits(p_user uuid, p_amount int, p_payment_intent text default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  balance int;
begin
  if p_amount <= 0 then
    raise exception 'montant invalide';
  end if;
  if not exists (select 1 from public.profiles where id = p_user) then
    raise exception 'profil introuvable';
  end if;
  insert into public.listing_credit_grants (user_id, amount, remaining, expires_at, stripe_payment_intent)
  values (p_user, p_amount, p_amount, now() + interval '12 months', p_payment_intent)
  on conflict (stripe_payment_intent) where stripe_payment_intent is not null do nothing;
  select coalesce(sum(remaining), 0)::int into balance
  from public.listing_credit_grants
  where user_id = p_user and remaining > 0 and expires_at > now();
  return balance;
end;
$$;
revoke execute on function public.grant_listing_credits(uuid, int, text) from public, anon, authenticated;
grant execute on function public.grant_listing_credits(uuid, int, text) to service_role;

-- Retire les crédits restants du lot acheté par ce paiement ; retourne le nombre de crédits retirés (0 si déjà
-- consommés ou lot inconnu). Les crédits déjà utilisés ne sont pas repris.
create or replace function public.revoke_listing_credits(p_payment_intent text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  revoked int;
begin
  select remaining into revoked
    from public.listing_credit_grants
   where stripe_payment_intent = p_payment_intent
   for update;
  if revoked is null or revoked = 0 then
    return 0;
  end if;
  update public.listing_credit_grants set remaining = 0 where stripe_payment_intent = p_payment_intent;
  return revoked;
end;
$$;
revoke execute on function public.revoke_listing_credits(text) from public, anon, authenticated;
grant execute on function public.revoke_listing_credits(text) to service_role;

-- Abonnement en impayé : date du premier passage à l'état « past_due ». Colonne réservée au service role
-- (non ajoutée au grant update de 0001).
alter table public.profiles add column past_due_since timestamptz;

create or replace function public.mark_past_due(p_customer text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set past_due_since = coalesce(past_due_since, now())
   where stripe_customer_id = p_customer and subscription_status = 'active';
$$;

-- Retire l'accès aux abonnements impayés depuis plus de p_days jours ; retourne le nombre de comptes concernés.
-- Si Stripe encaisse ensuite, l'événement customer.subscription.updated réactive l'abonnement.
create or replace function public.expire_past_due_subscriptions(p_days int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  affected int;
begin
  update public.profiles
     set subscription_status = 'canceled', subscription_plan = null, past_due_since = null
   where subscription_status = 'active'
     and past_due_since is not null
     and past_due_since < now() - make_interval(days => p_days);
  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke execute on function public.claim_listing_slot(uuid, int, text) from public, anon, authenticated;
revoke execute on function public.release_listing_slot(uuid) from public, anon, authenticated;
revoke execute on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
revoke execute on function public.mark_past_due(text) from public, anon, authenticated;
revoke execute on function public.expire_past_due_subscriptions(int) from public, anon, authenticated;
grant execute on function public.claim_listing_slot(uuid, int, text) to service_role;
grant execute on function public.release_listing_slot(uuid) to service_role;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;
grant execute on function public.mark_past_due(text) to service_role;
grant execute on function public.expire_past_due_subscriptions(int) to service_role;
