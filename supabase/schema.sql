create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email)
  on conflict (id) do update
  set name = excluded.name,
      email = excluded.email;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  network text not null,
  account_name text,
  status text not null default 'disconnected',
  mock_access_token text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  connected_at timestamptz,
  last_published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, network)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_text text not null,
  objective text not null,
  tone text not null,
  status text not null default 'draft',
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_targets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  network text not null,
  adapted_text text,
  title text,
  description text,
  hashtags text[],
  status text not null default 'draft',
  character_limit_warning text,
  external_post_id text,
  published_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  storage_path text not null,
  file_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  status text not null default 'scheduled',
  run_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz
);

create table if not exists public.publish_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  post_target_id uuid references public.post_targets(id) on delete set null,
  network text,
  status text not null,
  message text not null,
  response_payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_connected_accounts_user_id on public.connected_accounts(user_id);
create index if not exists idx_connected_accounts_status on public.connected_accounts(status);
create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_posts_scheduled_at on public.posts(scheduled_at);
create index if not exists idx_post_targets_post_id on public.post_targets(post_id);
create index if not exists idx_post_targets_user_id on public.post_targets(user_id);
create index if not exists idx_post_targets_status on public.post_targets(status);
create index if not exists idx_media_assets_user_id on public.media_assets(user_id);
create index if not exists idx_publish_jobs_user_id on public.publish_jobs(user_id);
create index if not exists idx_publish_jobs_post_id on public.publish_jobs(post_id);
create index if not exists idx_publish_jobs_status on public.publish_jobs(status);
create index if not exists idx_publish_jobs_run_at on public.publish_jobs(run_at);
create index if not exists idx_publish_logs_user_id on public.publish_logs(user_id);
create index if not exists idx_publish_logs_post_id on public.publish_logs(post_id);
create index if not exists idx_publish_logs_status on public.publish_logs(status);

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute procedure public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.posts enable row level security;
alter table public.post_targets enable row level security;
alter table public.media_assets enable row level security;
alter table public.publish_jobs enable row level security;
alter table public.publish_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "connected_accounts_select_own" on public.connected_accounts;
create policy "connected_accounts_select_own" on public.connected_accounts
for select using (auth.uid() = user_id);

drop policy if exists "connected_accounts_insert_own" on public.connected_accounts;
create policy "connected_accounts_insert_own" on public.connected_accounts
for insert with check (auth.uid() = user_id);

drop policy if exists "connected_accounts_update_own" on public.connected_accounts;
create policy "connected_accounts_update_own" on public.connected_accounts
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "connected_accounts_delete_own" on public.connected_accounts;
create policy "connected_accounts_delete_own" on public.connected_accounts
for delete using (auth.uid() = user_id);

drop policy if exists "posts_select_own" on public.posts;
create policy "posts_select_own" on public.posts
for select using (auth.uid() = user_id);

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
for insert with check (auth.uid() = user_id);

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts
for delete using (auth.uid() = user_id);

drop policy if exists "post_targets_select_own" on public.post_targets;
create policy "post_targets_select_own" on public.post_targets
for select using (auth.uid() = user_id);

drop policy if exists "post_targets_insert_own" on public.post_targets;
create policy "post_targets_insert_own" on public.post_targets
for insert with check (auth.uid() = user_id);

drop policy if exists "post_targets_update_own" on public.post_targets;
create policy "post_targets_update_own" on public.post_targets
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "post_targets_delete_own" on public.post_targets;
create policy "post_targets_delete_own" on public.post_targets
for delete using (auth.uid() = user_id);

drop policy if exists "media_assets_select_own" on public.media_assets;
create policy "media_assets_select_own" on public.media_assets
for select using (auth.uid() = user_id);

drop policy if exists "media_assets_insert_own" on public.media_assets;
create policy "media_assets_insert_own" on public.media_assets
for insert with check (auth.uid() = user_id);

drop policy if exists "media_assets_update_own" on public.media_assets;
create policy "media_assets_update_own" on public.media_assets
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "media_assets_delete_own" on public.media_assets;
create policy "media_assets_delete_own" on public.media_assets
for delete using (auth.uid() = user_id);

drop policy if exists "publish_jobs_select_own" on public.publish_jobs;
create policy "publish_jobs_select_own" on public.publish_jobs
for select using (auth.uid() = user_id);

drop policy if exists "publish_jobs_insert_own" on public.publish_jobs;
create policy "publish_jobs_insert_own" on public.publish_jobs
for insert with check (auth.uid() = user_id);

drop policy if exists "publish_jobs_update_own" on public.publish_jobs;
create policy "publish_jobs_update_own" on public.publish_jobs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "publish_jobs_delete_own" on public.publish_jobs;
create policy "publish_jobs_delete_own" on public.publish_jobs
for delete using (auth.uid() = user_id);

drop policy if exists "publish_logs_select_own" on public.publish_logs;
create policy "publish_logs_select_own" on public.publish_logs
for select using (auth.uid() = user_id);

drop policy if exists "publish_logs_insert_own" on public.publish_logs;
create policy "publish_logs_insert_own" on public.publish_logs
for insert with check (auth.uid() = user_id);

drop policy if exists "publish_logs_update_own" on public.publish_logs;
create policy "publish_logs_update_own" on public.publish_logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "publish_logs_delete_own" on public.publish_logs;
create policy "publish_logs_delete_own" on public.publish_logs
for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'social-media-assets',
  'social-media-assets',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage_select_own_assets" on storage.objects;
create policy "storage_select_own_assets" on storage.objects
for select using (
  bucket_id = 'social-media-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "storage_insert_own_assets" on storage.objects;
create policy "storage_insert_own_assets" on storage.objects
for insert with check (
  bucket_id = 'social-media-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "storage_update_own_assets" on storage.objects;
create policy "storage_update_own_assets" on storage.objects
for update using (
  bucket_id = 'social-media-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'social-media-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "storage_delete_own_assets" on storage.objects;
create policy "storage_delete_own_assets" on storage.objects
for delete using (
  bucket_id = 'social-media-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
