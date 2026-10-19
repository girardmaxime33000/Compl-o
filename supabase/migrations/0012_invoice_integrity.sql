-- Intégrité des devis et factures : numérotation séquentielle, identité de l'émetteur figée, documents émis immuables.
-- Migration additive : aucune ligne n'est supprimée. Les documents existants gardent leur numéro d'origine (`reference`).

-- ============================================================
-- Colonnes
-- ============================================================
alter table public.invoices
  add column number int,
  add column number_year int,
  add column reference text,
  add column issuer_name text,
  add column issuer_siret text,
  add column issuer_address text,
  add column issuer_email text;

-- ============================================================
-- Rattrapage des documents existants
-- ============================================================
-- Numéro d'origine (utilisé sur les PDF déjà envoyés) conservé tel quel : prefixe-année-6 premiers caractères de l'identifiant.
update public.invoices
   set reference = (case document_type when 'devis' then 'D' else 'F' end)
                   || '-' || to_char(issue_date, 'YYYY') || '-' || upper(substr(id::text, 1, 6));

-- Identité de l'émetteur : valeurs actuelles du profil (seule information disponible pour l'existant).
update public.invoices i
   set issuer_name = p.full_name,
       issuer_siret = p.siret,
       issuer_address = p.address,
       issuer_email = p.email
  from public.profiles p
 where p.id = i.user_id;

alter table public.invoices alter column reference set not null;
create unique index invoices_reference_idx on public.invoices (user_id, reference);
-- Numéros séquentiels : par utilisateur, type de document et année d'émission. Les lignes existantes (number null) en sont exclues.
create unique index invoices_number_idx on public.invoices (user_id, document_type, number_year, number) where number is not null;

-- ============================================================
-- Attribution à l'insertion : numéro, référence, identité figée
-- ============================================================
create or replace function public.invoices_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prof public.profiles%rowtype;
  last_date date;
  next_number int;
begin
  -- Sérialise les créations d'un même utilisateur : pas de numéro en double ni de trou en cas de requêtes simultanées.
  perform pg_advisory_xact_lock(hashtext('invoices:' || new.user_id::text));

  -- Chronologie : une facture ne peut pas porter une date antérieure à la dernière facture émise.
  if new.document_type = 'facture' then
    select max(issue_date) into last_date
      from public.invoices
     where user_id = new.user_id and document_type = 'facture';
    if last_date is not null and new.issue_date < last_date then
      raise exception 'DATE_ANTERIEURE' using errcode = 'P0001', detail = to_char(last_date, 'YYYY-MM-DD');
    end if;
  end if;

  select coalesce(max(number), 0) + 1 into next_number
    from public.invoices
   where user_id = new.user_id
     and document_type = new.document_type
     and number_year = extract(year from new.issue_date)::int;

  new.number := next_number;
  new.number_year := extract(year from new.issue_date)::int;
  new.reference := (case new.document_type when 'devis' then 'D' else 'F' end)
                   || '-' || new.number_year || '-' || lpad(next_number::text, 4, '0');

  select * into prof from public.profiles where id = new.user_id;
  new.issuer_name := prof.full_name;
  new.issuer_siret := prof.siret;
  new.issuer_address := prof.address;
  new.issuer_email := prof.email;
  return new;
end;
$$;

create trigger invoices_before_insert
  before insert on public.invoices
  for each row execute function public.invoices_before_insert();

-- ============================================================
-- Immuabilité : seul le statut est modifiable, et uniquement vers l'avant (brouillon, envoyé, payé)
-- ============================================================
revoke update on public.invoices from authenticated, anon;
grant update (status) on public.invoices to authenticated;

create or replace function public.invoices_before_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'draft' and new.status in ('sent', 'paid'))
      or (old.status = 'sent' and new.status = 'paid')
    ) then
      raise exception 'STATUT_IRREVERSIBLE' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger invoices_before_update
  before update on public.invoices
  for each row execute function public.invoices_before_update();

-- ============================================================
-- Suppression : devis uniquement. Une facture numérotée ne se supprime pas (la suppression du compte, par cascade, reste possible).
-- ============================================================
drop policy "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own_quotes" on public.invoices
  for delete using (auth.uid() = user_id and document_type = 'devis');
