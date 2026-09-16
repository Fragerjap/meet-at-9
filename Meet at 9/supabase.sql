-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.meeting_cells (
  day text NOT NULL,
  hour integer NOT NULL,
  user_id text NOT NULL,
  colored boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT meeting_cells_pkey PRIMARY KEY (day, hour, user_id)
);
CREATE TABLE public.meeting_labels (
  column_index integer NOT NULL,
  label text NOT NULL DEFAULT ''::text,
  CONSTRAINT meeting_labels_pkey PRIMARY KEY (column_index)
);
CREATE TABLE public.meeting_user_names (
  user_id text NOT NULL,
  name text NOT NULL,
  skipped boolean NOT NULL DEFAULT false,
  CONSTRAINT meeting_user_names_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.meeting_description (
  key text NOT NULL,
  value text NOT NULL,
  CONSTRAINT meeting_description_pkey PRIMARY KEY (key)
);
CREATE TABLE public.meeting_config (
  key text NOT NULL,
  start_hour integer NOT NULL DEFAULT 10,
  start_minute integer NOT NULL DEFAULT 0,
  half_hour_step boolean NOT NULL DEFAULT false,
  CONSTRAINT meeting_config_pkey PRIMARY KEY (key)
);