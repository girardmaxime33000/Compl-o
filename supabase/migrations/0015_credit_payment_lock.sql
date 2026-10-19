-- Sérialise l'octroi et le retrait des crédits d'un même paiement (suite de 0014).
-- Sans verrou, un `checkout.session.completed` et un `charge.refunded` traités simultanément pouvaient se croiser : l'octroi ne voit
-- pas encore le remboursement, le remboursement ne voit pas encore le lot, et le lot est créé après coup.
-- Le verrou est pris sur le paiement et relâché à la fin de la transaction. Migration additive : remplace deux fonctions.

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
  if p_payment_intent is not null then
    perform pg_advisory_xact_lock(hashtext('payment:' || p_payment_intent));
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

create or replace function public.revoke_listing_credits(p_payment_intent text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  revoked int;
begin
  perform pg_advisory_xact_lock(hashtext('payment:' || p_payment_intent));

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

revoke execute on function public.grant_listing_credits(uuid, int, text) from public, anon, authenticated;
revoke execute on function public.revoke_listing_credits(text) from public, anon, authenticated;
grant execute on function public.grant_listing_credits(uuid, int, text) to service_role;
grant execute on function public.revoke_listing_credits(text) to service_role;
