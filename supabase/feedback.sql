-- Retours annotees depuis l'application.
-- A executer apres supabase/schema.sql dans le SQL Editor Supabase.
-- Ce fichier ne doit pas etre applique automatiquement par le client.

create table if not exists feedback_reports (
  id uuid primary key,
  device_id uuid not null,
  screen_code text not null,
  comment text not null,
  storage_path text not null,
  image_bytes integer not null check (image_bytes > 0),
  strokes jsonb not null default '[]'::jsonb,
  app_version text,
  created_at timestamptz not null
);

create index if not exists feedback_reports_created_at_idx on feedback_reports (created_at desc);
create index if not exists feedback_reports_device_id_idx on feedback_reports (device_id);

alter table feedback_reports enable row level security;
revoke all on feedback_reports from anon;

create or replace function submit_feedback(
  p_id uuid,
  p_device_id uuid,
  p_device_secret text,
  p_screen_code text,
  p_comment text,
  p_storage_path text,
  p_image_bytes integer,
  p_strokes jsonb,
  p_app_version text,
  p_created_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from device_snapshots
    where device_id = p_device_id
      and device_secret = p_device_secret
  ) then
    return false;
  end if;

  if p_storage_path <> format('%s/%s.jpg', p_device_id, p_id) then
    return false;
  end if;

  insert into feedback_reports (
    id, device_id, screen_code, comment, storage_path, image_bytes, strokes, app_version, created_at
  ) values (
    p_id, p_device_id, p_screen_code, p_comment, p_storage_path, p_image_bytes,
    coalesce(p_strokes, '[]'::jsonb), p_app_version, p_created_at
  ) on conflict (id) do nothing;

  return true;
end;
$$;

revoke all on function submit_feedback(uuid, uuid, text, text, text, text, integer, jsonb, text, timestamptz) from public;
grant execute on function submit_feedback(uuid, uuid, text, text, text, text, integer, jsonb, text, timestamptz) to anon;

-- Fil de discussion (roadmap_retours_conversationnels.md, Phase 3).
alter table feedback_reports add column if not exists resolved_at timestamptz;

create table if not exists feedback_messages (
  id uuid primary key,
  report_id uuid not null references feedback_reports(id),
  device_id uuid not null,
  author text not null check (author in ('user', 'agent')),
  body text not null,
  created_at timestamptz not null
);

create index if not exists feedback_messages_report_id_idx on feedback_messages (report_id);

alter table feedback_messages enable row level security;
revoke all on feedback_messages from anon;

-- Le client ne pousse jamais que des messages de testeur : les reponses d'agent sont deposees
-- directement en base par le script developpeur (service_role, Phase 5), jamais via cette RPC.
create or replace function submit_feedback_message(
  p_id uuid,
  p_device_id uuid,
  p_device_secret text,
  p_report_id uuid,
  p_author text,
  p_body text,
  p_created_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_author <> 'user' then
    return false;
  end if;

  if not exists (
    select 1
    from device_snapshots
    where device_id = p_device_id
      and device_secret = p_device_secret
  ) then
    return false;
  end if;

  if not exists (
    select 1
    from feedback_reports
    where id = p_report_id
      and device_id = p_device_id
  ) then
    return false;
  end if;

  insert into feedback_messages (id, report_id, device_id, author, body, created_at)
  values (p_id, p_report_id, p_device_id, p_author, p_body, p_created_at)
  on conflict (id) do nothing;

  return true;
end;
$$;

revoke all on function submit_feedback_message(uuid, uuid, text, uuid, text, text, timestamptz) from public;
grant execute on function submit_feedback_message(uuid, uuid, text, uuid, text, text, timestamptz) to anon;

create or replace function close_feedback_report(
  p_device_id uuid,
  p_device_secret text,
  p_report_id uuid,
  p_resolved_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  if not exists (
    select 1
    from device_snapshots
    where device_id = p_device_id
      and device_secret = p_device_secret
  ) then
    return false;
  end if;

  update feedback_reports
  set resolved_at = p_resolved_at
  where id = p_report_id
    and device_id = p_device_id;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

revoke all on function close_feedback_report(uuid, text, uuid, timestamptz) from public;
grant execute on function close_feedback_report(uuid, text, uuid, timestamptz) to anon;

-- Chemin de lecture serveur -> client (roadmap_retours_conversationnels.md, Phase 4).
-- Ne renvoie que les reponses d'agent : le client connait deja tous les messages qu'il a
-- lui-meme pousses via submit_feedback_message, inutile de les lui reechoir. Un
-- device_id/device_secret invalide ou etranger ne renvoie aucune ligne (ensemble vide, pas
-- d'erreur), meme contrat que les autres RPC de cette famille.
create or replace function fetch_feedback_messages(
  p_device_id uuid,
  p_device_secret text,
  p_since timestamptz
)
returns table (
  id uuid,
  report_id uuid,
  body text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from device_snapshots
    where device_id = p_device_id
      and device_secret = p_device_secret
  ) then
    return;
  end if;

  return query
  select m.id, m.report_id, m.body, m.created_at
  from feedback_messages m
  where m.device_id = p_device_id
    and m.author = 'agent'
    and m.created_at >= p_since
  order by m.created_at asc;
end;
$$;

revoke all on function fetch_feedback_messages(uuid, text, timestamptz) from public;
grant execute on function fetch_feedback_messages(uuid, text, timestamptz) to anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feedback', 'feedback', false, 8388608, array['image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "anon_can_upload_feedback_images"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'feedback'
  and array_length(storage.foldername(name), 1) = 1
  and name like '%.jpg'
);
