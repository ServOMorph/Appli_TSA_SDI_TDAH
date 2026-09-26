-- Schema de synchronisation des donnees de test (roadmap_sync_marie.md, Phase 1).
-- A executer dans le SQL Editor du projet Supabase.
--
-- Un snapshot complet par appareil, au format du payload exportData (useSettingsState.ts).
-- Choix assume d'un JSONB unique plutot que 16 tables miroir : le backend ne fait aucune
-- logique metier sur ces donnees, et une migration Dexie n'impose alors aucune migration SQL.
--
-- La verification du secret d'appareil se fait dans la fonction sync_device_snapshot
-- (SQL classique), pas dans une policy RLS basee sur un header custom : ce dernier pattern
-- s'est revele peu fiable en test (la policy bloquait systematiquement, secret correct ou
-- non, alors que la comparaison des valeurs hors RLS donnait vrai — cause precise non
-- identifiee, plausible lie au cache de plans de PostgREST avec current_setting(), STABLE
-- et non VOLATILE). Le role anon n'a aucun acces direct a la table, seulement le droit
-- d'executer cette fonction.

create table if not exists device_snapshots (
  device_id      uuid primary key,
  device_secret  text not null,
  payload        jsonb not null,
  schema_version text not null,
  app_version    text,
  created_at     timestamptz not null default now(),
  synced_at      timestamptz not null default now()
);

create index if not exists device_snapshots_synced_at_idx on device_snapshots (synced_at desc);

alter table device_snapshots enable row level security;

-- Aucune policy pour anon : RLS refuse tout acces direct par defaut. Seule la fonction
-- ci-dessous (security definer, executee avec les privileges du proprietaire de la table,
-- qui contourne RLS) peut lire/ecrire.
revoke all on device_snapshots from anon;

-- Un payload est considere vide s'il n'a ni tache, ni element de liste, ni entree de budget,
-- ni entree d'energie. Alignee sur le meme ensemble de tables que le garde-fou client jumeau
-- hasSignificantData() (src/app/AppContext.tsx) : les deux doivent juger "significatif" de la
-- meme facon, sinon un appareil dont les seules donnees reelles vivent dans une table protegee
-- cote client mais pas ici (ex: uniquement des entrees d'energie) se voit silencieusement
-- ecraser cote serveur par une reinstallation vide (garde-fou cense l'empecher).
-- Fonction IMMUTABLE : ne lit aucune table, calcule uniquement a partir de son argument.
create or replace function is_empty_snapshot_payload(p_payload jsonb)
returns boolean
language sql
immutable
as $$
  select coalesce(jsonb_array_length(p_payload -> 'tasks'), 0) = 0
     and coalesce(jsonb_array_length(p_payload -> 'list_items'), 0) = 0
     and coalesce(jsonb_array_length(p_payload -> 'budget_entries'), 0) = 0
     and coalesce(jsonb_array_length(p_payload -> 'energy_entries'), 0) = 0
     and coalesce(jsonb_array_length(p_payload -> 'routine_steps'), 0) = 0
$$;

-- Garde anti-ecrasement (roadmap_fiabilite_sync.md Phase 1, 2026-09-13) : un payload vide ne
-- remplace jamais un payload existant non vide pour le meme device_id. Protege contre un client
-- qui repousserait une base locale neuve (reinstallation, onboarding recommence) par-dessus la
-- derniere sauvegarde reelle du meme appareil. N'affecte pas l'insertion initiale (aucune ligne
-- existante) ni la mise a jour d'un payload deja vide.
create or replace function sync_device_snapshot(
  p_device_id uuid,
  p_device_secret text,
  p_payload jsonb,
  p_schema_version text,
  p_app_version text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  insert into device_snapshots (device_id, device_secret, payload, schema_version, app_version, synced_at)
  values (p_device_id, p_device_secret, p_payload, p_schema_version, p_app_version, now())
  on conflict (device_id) do update
    set payload = excluded.payload,
        schema_version = excluded.schema_version,
        app_version = excluded.app_version,
        synced_at = now()
    where device_snapshots.device_secret = excluded.device_secret
      and (
        not is_empty_snapshot_payload(excluded.payload)
        or is_empty_snapshot_payload(device_snapshots.payload)
      );

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

revoke all on function sync_device_snapshot(uuid, text, jsonb, text, text) from public;
grant execute on function sync_device_snapshot(uuid, text, jsonb, text, text) to anon;

-- Usage interne a sync_device_snapshot uniquement : aucun acces direct pour anon.
revoke all on function is_empty_snapshot_payload(jsonb) from public;
