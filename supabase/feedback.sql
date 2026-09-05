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
