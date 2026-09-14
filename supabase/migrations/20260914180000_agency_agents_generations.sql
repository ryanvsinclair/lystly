create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  homepage_url text not null,
  homepage_key text not null unique,
  logo_path text,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agencies_homepage_key_idx
  on public.agencies (homepage_key);

create index if not exists agencies_created_by_idx
  on public.agencies (created_by);

alter table public.profiles
  add column if not exists agency_id uuid references public.agencies (id) on delete set null,
  add column if not exists phone text,
  add column if not exists public_email text,
  add column if not exists instagram text,
  add column if not exists cutout_path text;

create index if not exists profiles_agency_id_idx
  on public.profiles (agency_id);

alter table public.projects
  add column if not exists agency_id uuid references public.agencies (id) on delete set null;

create index if not exists projects_agency_id_idx
  on public.projects (agency_id);

alter table public.agencies enable row level security;

create policy "Members can read their agency"
  on public.agencies
  for select
  using (
    created_by = (select auth.uid())
    or exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.agency_id = agencies.id
    )
  );

create policy "Authenticated users can create agencies"
  on public.agencies
  for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "Members can update their agency"
  on public.agencies
  for update
  using (
    created_by = (select auth.uid())
    or exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.agency_id = agencies.id
    )
  )
  with check (
    created_by = (select auth.uid())
    or exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.agency_id = agencies.id
    )
  );

create or replace function private.touch_agency_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agencies_set_updated_at on public.agencies;
create trigger agencies_set_updated_at
  before update on public.agencies
  for each row execute function private.touch_agency_updated_at();

create or replace function public.lookup_agency(p_homepage_key text)
returns table (
  id uuid,
  name text,
  homepage_url text,
  logo_path text
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.id, a.name, a.homepage_url, a.logo_path
  from public.agencies as a
  where a.homepage_key = p_homepage_key
  limit 1;
$$;

revoke all on function public.lookup_agency(text) from public;
grant execute on function public.lookup_agency(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agency-logos',
  'agency-logos',
  true,
  5242880,
  array['image/png', 'image/webp', 'image/jpeg']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agent-cutouts',
  'agent-cutouts',
  false,
  5242880,
  array['image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Agency members can read logos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'agency-logos'
    and (
      exists (
        select 1
        from public.profiles as profile
        where profile.id = (select auth.uid())
          and profile.agency_id::text = (storage.foldername(name))[1]
      )
      or exists (
        select 1
        from public.agencies as agency
        where agency.created_by = (select auth.uid())
          and agency.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "Agency members can upload logos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'agency-logos'
    and (
      exists (
        select 1
        from public.profiles as profile
        where profile.id = (select auth.uid())
          and profile.agency_id::text = (storage.foldername(name))[1]
      )
      or exists (
        select 1
        from public.agencies as agency
        where agency.created_by = (select auth.uid())
          and agency.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "Agency members can update logos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'agency-logos'
    and (
      exists (
        select 1
        from public.profiles as profile
        where profile.id = (select auth.uid())
          and profile.agency_id::text = (storage.foldername(name))[1]
      )
      or exists (
        select 1
        from public.agencies as agency
        where agency.created_by = (select auth.uid())
          and agency.id::text = (storage.foldername(name))[1]
      )
    )
  )
  with check (
    bucket_id = 'agency-logos'
    and (
      exists (
        select 1
        from public.profiles as profile
        where profile.id = (select auth.uid())
          and profile.agency_id::text = (storage.foldername(name))[1]
      )
      or exists (
        select 1
        from public.agencies as agency
        where agency.created_by = (select auth.uid())
          and agency.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "Agents can read own cutout"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'agent-cutouts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Agents can upload own cutout"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'agent-cutouts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Agents can update own cutout"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'agent-cutouts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'agent-cutouts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
