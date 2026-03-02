create extension if not exists "uuid-ossp";

create table if not exists public.site_config (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null default 'default',
  data jsonb not null,
  published_data jsonb,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
