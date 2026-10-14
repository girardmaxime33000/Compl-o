-- T07 : offres (pack ponctuel, mensuel, annuel), crédits d'annonces et idempotence des webhooks Stripe.
-- Migration additive : aucune colonne ni donnée existante n'est supprimée.

create type public.subscription_plan as enum ('monthly', 'annual');

alter table public.profiles
  add column subscription_plan public.subscription_plan,
  add column listing_credits int not null default 0 check (listing_credits >= 0);

-- Ces colonnes ne sont PAS ajoutées au grant update de 0001 : seul le service role peut les modifier.

-- Événements Stripe déjà traités (idempotence par event.id). RLS activée sans policy : service role uniquement.
create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;

-- Quota quotidien (plan mensuel) : annonces générées depuis minuit, heure de Paris.
create or replace function public.listings_count_today()
returns int
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::int
  from public.listings
  where user_id = auth.uid()
    and created_at >= (date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris');
$$;

-- Débit atomique d'un crédit : retourne le nouveau solde, ou -1 si le solde est nul.
create or replace function public.consume_listing_credit(p_user uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining int;
begin
  update public.profiles
     set listing_credits = listing_credits - 1
   where id = p_user and listing_credits > 0
  returning listing_credits into remaining;
  return coalesce(remaining, -1);
end;
$$;

-- Crédit atomique : retourne le nouveau solde.
create or replace function public.grant_listing_credits(p_user uuid, p_amount int)
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
  update public.profiles
     set listing_credits = listing_credits + p_amount
   where id = p_user
  returning listing_credits into balance;
  if balance is null then
    raise exception 'profil introuvable';
  end if;
  return balance;
end;
$$;

revoke execute on function public.consume_listing_credit(uuid) from public, anon, authenticated;
revoke execute on function public.grant_listing_credits(uuid, int) from public, anon, authenticated;
grant execute on function public.consume_listing_credit(uuid) to service_role;
grant execute on function public.grant_listing_credits(uuid, int) to service_role;
