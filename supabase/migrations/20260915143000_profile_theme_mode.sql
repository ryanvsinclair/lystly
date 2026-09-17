alter table public.profiles
  add column if not exists theme_mode text not null default 'light';

update public.profiles
set theme_mode = 'dark'
where theme_id in (
  'deep-emerald',
  'deep-sky',
  'deep-gold',
  'deep-cream-bar',
  'emerald-gold',
  'emerald-sky',
  'turquoise-gold',
  'turquoise-sky',
  'turquoise-emerald',
  'turquoise-cream-bar',
  'forest-sky',
  'forest-gold'
);
