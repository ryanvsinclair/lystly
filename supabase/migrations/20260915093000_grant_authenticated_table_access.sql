grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update on table public.agencies to authenticated;

grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.projects to service_role;
grant select, insert, update, delete on table public.agencies to service_role;
