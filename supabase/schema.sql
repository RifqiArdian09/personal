-- ============================================================
-- PORTFOLIO SUPABASE SCHEMA
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABLE: profile
-- ============================================================
create table if not exists profile (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  role              text not null,
  bio               text,
  profile_image_url text,
  cv_url            text,
  github            text,
  linkedin          text,
  instagram         text,
  email             text,
  whatsapp          text,
  updated_at        timestamptz default now()
);

-- ============================================================
-- 2. TABLE: tech_stack
-- ============================================================
create table if not exists tech_stack (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  icon_url   text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. TABLE: projects
-- ============================================================
create table if not exists projects (
  id            text primary key,
  title         text not null,
  description   text,
  content       text,
  status        text check (status in ('Solo Project', 'Team Project')),
  thumbnail_url text,
  github_url    text,
  demo_url      text,
  date          text,
  featured      boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- 4. TABLE: project_tech
-- ============================================================
create table if not exists project_tech (
  id         uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  tech_name  text not null,
  sort_order int not null default 0
);

-- ============================================================
-- 5. TABLE: project_team_members
-- ============================================================
create table if not exists project_team_members (
  id         uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  username   text not null,
  github_url text,
  sort_order int not null default 0
);

-- ============================================================
-- 6. TABLE: project_images
-- ============================================================
create table if not exists project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  image_url  text not null,
  caption    text,
  sort_order int not null default 0
);

-- ============================================================
-- 7. TABLE: certificates
-- ============================================================
create table if not exists certificates (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  issuer     text not null,
  image_url  text,
  issued_at  date,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profile               enable row level security;
alter table tech_stack            enable row level security;
alter table projects              enable row level security;
alter table project_tech          enable row level security;
alter table project_team_members  enable row level security;
alter table project_images        enable row level security;
alter table certificates          enable row level security;

-- PUBLIC: Semua orang boleh baca (untuk portfolio frontend)
create policy "Public can read profile"
  on profile for select using (true);

create policy "Public can read tech_stack"
  on tech_stack for select using (true);

create policy "Public can read projects"
  on projects for select using (true);

create policy "Public can read project_tech"
  on project_tech for select using (true);

create policy "Public can read project_team_members"
  on project_team_members for select using (true);

create policy "Public can read project_images"
  on project_images for select using (true);

create policy "Public can read certificates"
  on certificates for select using (true);

-- ADMIN: Hanya user yang login boleh write (insert/update/delete)
create policy "Admin can manage profile"
  on profile for all using (auth.role() = 'authenticated');

create policy "Admin can manage tech_stack"
  on tech_stack for all using (auth.role() = 'authenticated');

create policy "Admin can manage projects"
  on projects for all using (auth.role() = 'authenticated');

create policy "Admin can manage project_tech"
  on project_tech for all using (auth.role() = 'authenticated');

create policy "Admin can manage project_team_members"
  on project_team_members for all using (auth.role() = 'authenticated');

create policy "Admin can manage project_images"
  on project_images for all using (auth.role() = 'authenticated');

create policy "Admin can manage certificates"
  on certificates for all using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS
-- Jalankan ini jika belum dibuat via dashboard
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('profile',      'profile',      true),
  ('projects',     'projects',     true),
  ('certificates', 'certificates', true),
  ('icons',        'icons',        true)
on conflict (id) do nothing;

-- Storage policy: Public read untuk semua bucket
create policy "Public read profile storage"
  on storage.objects for select
  using (bucket_id = 'profile');

create policy "Public read projects storage"
  on storage.objects for select
  using (bucket_id = 'projects');

create policy "Public read certificates storage"
  on storage.objects for select
  using (bucket_id = 'certificates');

create policy "Public read icons storage"
  on storage.objects for select
  using (bucket_id = 'icons');

-- Admin upload/delete untuk semua bucket
create policy "Admin manage profile storage"
  on storage.objects for all
  using (bucket_id = 'profile' and auth.role() = 'authenticated');

create policy "Admin manage projects storage"
  on storage.objects for all
  using (bucket_id = 'projects' and auth.role() = 'authenticated');

create policy "Admin manage certificates storage"
  on storage.objects for all
  using (bucket_id = 'certificates' and auth.role() = 'authenticated');

create policy "Admin manage icons storage"
  on storage.objects for all
  using (bucket_id = 'icons' and auth.role() = 'authenticated');

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create trigger set_profile_updated_at
  before update on profile
  for each row execute function update_updated_at();
  
on conflict do nothing;