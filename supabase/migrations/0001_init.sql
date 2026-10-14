-- JobBoost FR : schéma initial
-- À exécuter dans l'éditeur SQL Supabase ou via `supabase db push`.

create extension if not exists "pgcrypto";

-- ============================================================
-- Types énumérés
-- ============================================================
create type public.subscription_status as enum ('free', 'active', 'canceled');
create type public.listing_platform as enum ('leboncoin', 'allovoisins', 'gensdeconfiance', 'vinted', 'taskrabbit');
create type public.invoice_status as enum ('draft', 'sent', 'paid');

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  stripe_customer_id text unique,
  subscription_status public.subscription_status not null default 'free',
  created_at timestamptz not null default now()
);

-- ============================================================
-- user_skills
-- ============================================================
create table public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null,
  equipment_available text[] not null default '{}',
  weekly_availability_hours int not null check (weekly_availability_hours between 0 and 80),
  created_at timestamptz not null default now()
);
create index user_skills_user_id_idx on public.user_skills (user_id);

-- ============================================================
-- listings
-- ============================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  platform public.listing_platform not null,
  description text not null,
  price_suggested numeric(10, 2) check (price_suggested is null or price_suggested >= 0),
  created_at timestamptz not null default now()
);
create index listings_user_month_idx on public.listings (user_id, created_at desc);

-- ============================================================
-- invoices
-- ============================================================
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  client_name text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  status public.invoice_status not null default 'draft',
  issue_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index invoices_user_id_idx on public.invoices (user_id, issue_date desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.user_skills enable row level security;
alter table public.listings enable row level security;
alter table public.invoices enable row level security;

-- profiles : lecture et mise à jour de son propre profil uniquement.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Les colonnes de facturation ne sont modifiables que par le service role (webhook Stripe).
revoke update on public.profiles from authenticated, anon;
grant update (full_name) on public.profiles to authenticated;

-- user_skills
create policy "user_skills_select_own" on public.user_skills
  for select using (auth.uid() = user_id);
create policy "user_skills_insert_own" on public.user_skills
  for insert with check (auth.uid() = user_id);
create policy "user_skills_update_own" on public.user_skills
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_skills_delete_own" on public.user_skills
  for delete using (auth.uid() = user_id);

-- listings
create policy "listings_select_own" on public.listings
  for select using (auth.uid() = user_id);
create policy "listings_insert_own" on public.listings
  for insert with check (auth.uid() = user_id);
create policy "listings_update_own" on public.listings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "listings_delete_own" on public.listings
  for delete using (auth.uid() = user_id);

-- invoices
create policy "invoices_select_own" on public.invoices
  for select using (auth.uid() = user_id);
create policy "invoices_insert_own" on public.invoices
  for insert with check (auth.uid() = user_id);
create policy "invoices_update_own" on public.invoices
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "invoices_delete_own" on public.invoices
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Création automatique du profil à l'inscription
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Quota Freemium : nombre d'annonces générées sur le mois civil courant
-- ============================================================
create or replace function public.listings_count_this_month()
returns int
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::int
  from public.listings
  where user_id = auth.uid()
    and created_at >= date_trunc('month', now());
$$;
