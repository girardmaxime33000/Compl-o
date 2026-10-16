-- Nouvelles plateformes d'annonces. `listings.platform` reprend la première version d'une annonce multi-sites :
-- le type énuméré doit donc connaître chaque site proposé dans le générateur. Additive.
alter type public.listing_platform add value if not exists 'needhelp';
alter type public.listing_platform add value if not exists 'yoojo';
alter type public.listing_platform add value if not exists 'stootie';
alter type public.listing_platform add value if not exists 'luludansmarue';
alter type public.listing_platform add value if not exists 'nextdoor';
alter type public.listing_platform add value if not exists 'pap';
alter type public.listing_platform add value if not exists 'blablacar';
alter type public.listing_platform add value if not exists 'karos';
alter type public.listing_platform add value if not exists 'klaxit';
alter type public.listing_platform add value if not exists 'getaround';
alter type public.listing_platform add value if not exists 'animaute';
alter type public.listing_platform add value if not exists 'holidog';
alter type public.listing_platform add value if not exists 'rover';
alter type public.listing_platform add value if not exists 'cocolis';
alter type public.listing_platform add value if not exists 'jestocke';
alter type public.listing_platform add value if not exists 'ouistock';
alter type public.listing_platform add value if not exists 'geev';
alter type public.listing_platform add value if not exists 'trocservices';
