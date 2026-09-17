insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-photos',
  'project-photos',
  true,
  8388608,
  array['image/png', 'image/webp', 'image/jpeg']
)
on conflict (id) do nothing;

create policy "Public can read project photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'project-photos');

create policy "Users can upload own project photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update own project photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete own project photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
