-- Akademya Tagalog : progression et historique, dans le même projet Supabase que l'Académie CMD & PowerShell.
-- Les comptes (auth.users), les profils (nom d'utilisateur), la connexion par nom d'utilisateur (resolve_login)
-- et la suppression de compte (Edge Function delete-account) sont communs aux deux sites : voir le dépôt
-- adamfast-tech/academie-cmd-powershell, fichier supabase/schema.sql.

create table public.tagalog_progress (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  state        jsonb not null default '{}'::jsonb,
  xp           int not null default 0,
  lessons_done int not null default 0,
  streak       int not null default 0,
  words        int not null default 0,
  updated_at   timestamptz not null default now(),
  constraint tagalog_progress_state_object check (jsonb_typeof(state) = 'object'),
  constraint tagalog_progress_state_size check (pg_column_size(state) < 500000)
);
alter table public.tagalog_progress enable row level security;
create policy "Lire sa progression tagalog" on public.tagalog_progress for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Créer sa progression tagalog" on public.tagalog_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Mettre à jour sa progression tagalog" on public.tagalog_progress for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.tagalog_progress from anon;
grant select, insert, update on public.tagalog_progress to authenticated;

create table public.tagalog_history (
  id           bigint generated always as identity primary key,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lesson_id    text not null check (lesson_id ~ '^[a-z0-9_-]{1,32}$'),
  mode         text not null check (mode in ('lesson', 'exam', 'jump', 'practice', 'mistakes', 'story')),
  xp           int  not null check (xp between 0 and 200),
  accuracy     int  check (accuracy between 0 and 100),
  completed_at timestamptz not null default now()
);
create index tagalog_history_user on public.tagalog_history (user_id, completed_at desc);
alter table public.tagalog_history enable row level security;
create policy "Lire son historique tagalog" on public.tagalog_history for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Ajouter à son historique tagalog" on public.tagalog_history for insert to authenticated
  with check ((select auth.uid()) = user_id);
revoke all on public.tagalog_history from anon;
grant select, insert on public.tagalog_history to authenticated;

-- Colonnes de synthèse calculées côté serveur à partir de l'état envoyé par le site.
create or replace function public.tagalog_progress_summary()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.xp := least(greatest(coalesce(case when jsonb_typeof(new.state -> 'xp') = 'number' then (new.state ->> 'xp')::numeric end, 0), 0), 10000000)::int;
  new.lessons_done := case when jsonb_typeof(new.state -> 'done') = 'object'
                           then (select count(*) from jsonb_object_keys(new.state -> 'done'))::int else 0 end;
  new.streak := least(greatest(coalesce(case when jsonb_typeof(new.state -> 'streak') = 'number' then (new.state ->> 'streak')::numeric end, 0), 0), 100000)::int;
  new.words := case when jsonb_typeof(new.state -> 'words') = 'object'
                    then (select count(*) from jsonb_each(new.state -> 'words') w
                          where w.key like 'w%' and jsonb_typeof(w.value -> 's') = 'number' and (w.value ->> 's')::numeric >= 1)::int else 0 end;
  new.updated_at := now();
  return new;
end $$;
create trigger tagalog_progress_summary before insert or update on public.tagalog_progress
  for each row execute function public.tagalog_progress_summary();
revoke execute on function public.tagalog_progress_summary() from public, anon, authenticated;
