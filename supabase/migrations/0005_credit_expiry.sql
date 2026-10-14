-- T07 : les crédits d'annonces du pack ponctuel expirent 12 mois après l'achat.
-- Chaque achat devient un « lot » avec sa date d'expiration. Migration additive : la colonne
-- profiles.listing_credits (0003) n'est plus lue par l'application ; ses soldes sont convertis en lots puis remis à 0.

create table public.listing_credit_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount int not null check (amount > 0),
  remaining int not null check (remaining >= 0 and remaining <= amount),
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index listing_credit_grants_user_idx on public.listing_credit_grants (user_id, expires_at);

alter table public.listing_credit_grants enable row level security;
-- Lecture de ses propres lots uniquement ; aucune écriture côté utilisateur (service role via les fonctions ci-dessous).
create policy "listing_credit_grants_select_own" on public.listing_credit_grants
  for select using (auth.uid() = user_id);
grant select on public.listing_credit_grants to authenticated;
revoke insert, update, delete on public.listing_credit_grants from anon, authenticated;

-- Soldes existants : un lot valable 12 mois à compter de la migration.
insert into public.listing_credit_grants (user_id, amount, remaining, expires_at)
select id, listing_credits, listing_credits, now() + interval '12 months'
from public.profiles
where listing_credits > 0;
update public.profiles set listing_credits = 0 where listing_credits > 0;

-- Crédite un lot de p_amount annonces valable 12 mois ; retourne le solde non expiré.
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
  if not exists (select 1 from public.profiles where id = p_user) then
    raise exception 'profil introuvable';
  end if;
  insert into public.listing_credit_grants (user_id, amount, remaining, expires_at)
  values (p_user, p_amount, p_amount, now() + interval '12 months');
  select coalesce(sum(remaining), 0)::int into balance
  from public.listing_credit_grants
  where user_id = p_user and remaining > 0 and expires_at > now();
  return balance;
end;
$$;

-- Débite un crédit sur le lot non expiré le plus proche de l'expiration ; retourne le solde restant, ou -1 si aucun crédit.
create or replace function public.consume_listing_credit(p_user uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  picked uuid;
  balance int;
begin
  select id into picked
  from public.listing_credit_grants
  where user_id = p_user and remaining > 0 and expires_at > now()
  order by expires_at
  limit 1
  for update skip locked;

  if picked is null then
    return -1;
  end if;

  update public.listing_credit_grants set remaining = remaining - 1 where id = picked;
  select coalesce(sum(remaining), 0)::int into balance
  from public.listing_credit_grants
  where user_id = p_user and remaining > 0 and expires_at > now();
  return balance;
end;
$$;

revoke execute on function public.consume_listing_credit(uuid) from public, anon, authenticated;
revoke execute on function public.grant_listing_credits(uuid, int) from public, anon, authenticated;
grant execute on function public.consume_listing_credit(uuid) to service_role;
grant execute on function public.grant_listing_credits(uuid, int) to service_role;
