-- Champs nécessaires à l'émission d'un devis / d'une facture conforme.

alter table public.profiles
  add column siret text,
  add column address text;

grant update (siret, address) on public.profiles to authenticated;

create type public.document_type as enum ('devis', 'facture');

alter table public.invoices
  add column description text not null default '',
  add column document_type public.document_type not null default 'facture';
