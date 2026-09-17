alter table public.profiles
  add column if not exists theme_id text not null default 'valley';
