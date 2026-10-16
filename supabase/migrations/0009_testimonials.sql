-- Témoignages d'utilisateurs (preuve sociale). Un témoignage par compte, publié seulement après relecture du propriétaire.
-- Lecture publique : uniquement les lignes `approved`. Insertion : le titulaire, toujours en `pending`. Aucune politique
-- de mise à jour : seul le service role (ou l'éditeur SQL de Supabase) peut changer le statut. Le titulaire peut retirer
-- son témoignage (suppression) ; la suppression du compte l'efface en cascade. Additive.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 40),
  city text check (city is null or char_length(city) <= 80),
  body text not null check (char_length(body) between 20 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "testimonials_select_approved" on public.testimonials
  for select using (status = 'approved');
create policy "testimonials_select_own" on public.testimonials
  for select using (auth.uid() = user_id);
create policy "testimonials_insert_own" on public.testimonials
  for insert with check (auth.uid() = user_id and status = 'pending');
create policy "testimonials_delete_own" on public.testimonials
  for delete using (auth.uid() = user_id);
