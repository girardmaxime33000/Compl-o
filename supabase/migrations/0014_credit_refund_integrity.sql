-- Intégrité des crédits du pack face aux remboursements (suite de 0013). Migration additive, compatible avec le code précédent
-- (`consume_listing_credit` est conservée).

-- ============================================================
-- Paiements remboursés ou contestés : mémorisés même si le lot n'existe pas encore
-- ============================================================
-- Stripe ne garantit pas l'ordre des événements : un remboursement peut être traité avant l'achat qu'il annule.
-- `grant_listing_credits` ne crédite jamais un paiement présent dans cette table.
create table public.refunded_payments (
  payment_intent text primary key,
  created_at timestamptz not null default now()
);
alter table public.refunded_payments enable row level security;

-- Un lot retiré (remboursement ou litige) ne reçoit plus de crédit rendu.
alter table public.listing_credit_grants add column revoked_at timestamptz;

create or replace function public.grant_listing_credits(p_user uuid, p_amount int, p_payment_intent text default null)
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
  -- Paiement déjà remboursé ou contesté : aucun crédit.
  if p_payment_intent is null or not exists (select 1 from public.refunded_payments where payment_intent = p_payment_intent) then
    insert into public.listing_credit_grants (user_id, amount, remaining, expires_at, stripe_payment_intent)
    values (p_user, p_amount, p_amount, now() + interval '12 months', p_payment_intent)
    on conflict (stripe_payment_intent) where stripe_payment_intent is not null do nothing;
  end if;
  select coalesce(sum(remaining), 0)::int into balance
  from public.listing_credit_grants
  where user_id = p_user and remaining > 0 and expires_at > now();
  return balance;
end;
$$;

-- Mémorise le paiement remboursé, puis retire les crédits restants du lot s'il existe ; retourne le nombre de crédits retirés.
create or replace function public.revoke_listing_credits(p_payment_intent text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  revoked int;
begin
  insert into public.refunded_payments (payment_intent) values (p_payment_intent) on conflict do nothing;

  select remaining into revoked
    from public.listing_credit_grants
   where stripe_payment_intent = p_payment_intent
   for update;
  if not found then
    return 0;
  end if;
  update public.listing_credit_grants
     set remaining = 0, revoked_at = coalesce(revoked_at, now())
   where stripe_payment_intent = p_payment_intent;
  return revoked;
end;
$$;

-- ============================================================
-- Crédit consommé puis rendu : retour sur le lot d'origine
-- ============================================================
-- Comme `consume_listing_credit`, mais retourne aussi le lot débité (grant_id null et balance -1 si aucun crédit).
create or replace function public.consume_listing_credit_grant(p_user uuid)
returns table (grant_id uuid, balance int)
language plpgsql
security definer
set search_path = public
as $$
declare
  picked uuid;
begin
  select id into picked
  from public.listing_credit_grants
  where user_id = p_user and remaining > 0 and expires_at > now() and revoked_at is null
  order by expires_at
  limit 1
  for update skip locked;

  if picked is null then
    return query select null::uuid, -1;
    return;
  end if;

  update public.listing_credit_grants set remaining = remaining - 1 where id = picked;
  return query
    select picked, coalesce(sum(g.remaining), 0)::int
    from public.listing_credit_grants g
    where g.user_id = p_user and g.remaining > 0 and g.expires_at > now();
end;
$$;

-- Rend un crédit au lot débité (génération échouée). Sans effet si le lot a été retiré ou est déjà complet ; retourne vrai si rendu.
create or replace function public.restore_listing_credit(p_grant uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  restored int;
begin
  update public.listing_credit_grants
     set remaining = remaining + 1
   where id = p_grant and revoked_at is null and remaining < amount;
  get diagnostics restored = row_count;
  return restored > 0;
end;
$$;

revoke execute on function public.grant_listing_credits(uuid, int, text) from public, anon, authenticated;
revoke execute on function public.revoke_listing_credits(text) from public, anon, authenticated;
revoke execute on function public.consume_listing_credit_grant(uuid) from public, anon, authenticated;
revoke execute on function public.restore_listing_credit(uuid) from public, anon, authenticated;
grant execute on function public.grant_listing_credits(uuid, int, text) to service_role;
grant execute on function public.revoke_listing_credits(text) to service_role;
grant execute on function public.consume_listing_credit_grant(uuid) to service_role;
grant execute on function public.restore_listing_credit(uuid) to service_role;
