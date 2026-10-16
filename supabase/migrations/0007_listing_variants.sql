-- Annonce multi-sites : une génération = une ligne (donc un seul crédit ou une seule unité de quota).
-- `variants` contient les trois versions [{ platform, title, description }] ; title/description/platform de la ligne
-- reprennent la première version, pour que l'export, les e-mails et les anciennes annonces restent lisibles.
-- Additive : aucune politique RLS modifiée, les anciennes lignes gardent variants = null.
alter table public.listings add column if not exists variants jsonb;
