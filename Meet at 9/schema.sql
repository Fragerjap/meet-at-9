-- Meet at 9 database schema.
-- This file creates empty tables only; it does not copy meeting data.

create table if not exists public.meeting_cells (
  day text not null,
  hour integer not null,
  user_id text not null,
  colored boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (day, hour, user_id)
);

create table if not exists public.meeting_labels (
  column_index integer primary key,
  label text not null default ''
);

create table if not exists public.meeting_user_names (
  user_id text primary key,
  name text not null,
  skipped boolean not null default false
);

create table if not exists public.meeting_description (
  key text primary key,
  value text not null
);

create table if not exists public.meeting_config (
  key text primary key,
  start_hour integer not null default 10,
  start_minute integer not null default 0,
  half_hour_step boolean not null default false
);