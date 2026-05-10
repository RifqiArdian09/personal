# Portfolio Website — Project Prompt

**Owner:** Rifqi Ardian  
**Role:** Fullstack Developer

---

## Overview

Build a modern, responsive personal portfolio website for **Rifqi Ardian** — a Fullstack Developer. The site must support **dark and light themes**, **English and Indonesian language switching**, and include a **protected admin panel** for content management.

---

## Typography

| Purpose | Font |
|---|---|
| Headings & UI | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) |
| Code & monospace | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |

---

## Color Palette

| Token | Value |
|---|---|
| Primary background (dark) | `#0F172A` |
| Accent / brand | `#2DD4BF` |

Both dark and light theme variants must be implemented.

---

## Public Pages & Sections

The portfolio consists of six main sections navigable from the top navbar:

### 1. Home
- Hero section with name, role, and a short tagline
- Call-to-action buttons (e.g., View Projects, Download CV)
- Smooth scroll or animated entrance

### 2. About
- Profile photo
- Bio / personal description
- Tech stack icons (pulled from `tech_stack` table)
- Social links: GitHub, LinkedIn, Instagram, Email, WhatsApp

### 3. Projects
- Card-based grid layout
- Each card shows: thumbnail, title, short description, tech badges, and status (`Solo Project` / `Team Project`)
- **Clicking a card opens a modal** with full project details:
  - Full description & rich content
  - Image gallery (from `project_images`)
  - Tech stack list (from `project_tech`)
  - Team members with GitHub links (from `project_team_members`)
  - Links: Live Demo, GitHub Repository
  - Project date

### 4. Certificates
- Grid or list of certificate cards
- Each card shows: title, issuer, issue date, certificate image
- **Verification link** button (external URL)

### 5. Blog
- List of blog posts (title, date, excerpt)
- Clicking opens full post content
- Posts stored in a `blog_posts` table (see Schema section below)

### 6. Contact
- Contact form (name, email, message)
- Display social links and email/WhatsApp from `profile` table

---

## Admin Panel

A protected dashboard accessible only to authenticated users (Supabase Auth).

### Layout
- Left **sidebar** with navigation links to each management section
- All UI components sourced from **[Nuxt UI](https://ui.nuxt.com/docs/components)**

### Admin Sections

| Section | Capabilities |
|---|---|
| **Profile** | Edit name, role, bio, profile image, CV file, social links |
| **Tech Stack** | Add / edit / delete technologies; set icon and sort order |
| **Projects** | Full CRUD; manage images, tech tags, and team members per project |
| **Certificates** | Add / edit / delete certificates; include verification link |
| **Blog** | Write and publish blog posts using **Tiptap** rich text editor |
| **Settings** | Toggle site language default, theme preference |

---

## Database Schema (Supabase)

Run the following SQL in the Supabase SQL Editor.

### Tables

#### `profile`
```sql
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
```

#### `tech_stack`
```sql
create table if not exists tech_stack (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  icon_url   text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
```

#### `projects`
```sql
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
```

#### `project_tech`
```sql
create table if not exists project_tech (
  id         uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  tech_name  text not null,
  sort_order int not null default 0
);
```

#### `project_team_members`
```sql
create table if not exists project_team_members (
  id         uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  username   text not null,
  github_url text,
  sort_order int not null default 0
);
```

#### `project_images`
```sql
create table if not exists project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  image_url  text not null,
  caption    text,
  sort_order int not null default 0
);
```

#### `certificates`
```sql
create table if not exists certificates (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  issuer              text not null,
  image_url           text,
  verification_url    text,        -- Link to verify the certificate
  issued_at           date,
  sort_order          int not null default 0,
  created_at          timestamptz default now()
);
```

#### `blog_posts` *(add this table)*
```sql
create table if not exists blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content_html text,             -- Rendered HTML output from Tiptap
  content_json jsonb,            -- Tiptap JSON document (for re-editing)
  cover_url    text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
```

---

### Row Level Security (RLS)

Enable RLS on all tables and apply these policies:

```sql
-- Enable RLS
alter table profile               enable row level security;
alter table tech_stack            enable row level security;
alter table projects              enable row level security;
alter table project_tech          enable row level security;
alter table project_team_members  enable row level security;
alter table project_images        enable row level security;
alter table certificates          enable row level security;
alter table blog_posts            enable row level security;

-- Public read (portfolio frontend)
create policy "Public can read profile"               on profile               for select using (true);
create policy "Public can read tech_stack"            on tech_stack            for select using (true);
create policy "Public can read projects"              on projects              for select using (true);
create policy "Public can read project_tech"          on project_tech          for select using (true);
create policy "Public can read project_team_members"  on project_team_members  for select using (true);
create policy "Public can read project_images"        on project_images        for select using (true);
create policy "Public can read certificates"          on certificates          for select using (true);
create policy "Public can read blog_posts"            on blog_posts            for select using (published = true);

-- Admin write (authenticated users only)
create policy "Admin can manage profile"              on profile               for all using (auth.role() = 'authenticated');
create policy "Admin can manage tech_stack"           on tech_stack            for all using (auth.role() = 'authenticated');
create policy "Admin can manage projects"             on projects              for all using (auth.role() = 'authenticated');
create policy "Admin can manage project_tech"         on project_tech          for all using (auth.role() = 'authenticated');
create policy "Admin can manage project_team_members" on project_team_members  for all using (auth.role() = 'authenticated');
create policy "Admin can manage project_images"       on project_images        for all using (auth.role() = 'authenticated');
create policy "Admin can manage certificates"         on certificates          for all using (auth.role() = 'authenticated');
create policy "Admin can manage blog_posts"           on blog_posts            for all using (auth.role() = 'authenticated');
```

---

### Storage Buckets

```sql
insert into storage.buckets (id, name, public)
values
  ('profile',      'profile',      true),
  ('projects',     'projects',     true),
  ('certificates', 'certificates', true),
  ('icons',        'icons',        true)
on conflict (id) do nothing;

-- Public read policies
create policy "Public read profile storage"      on storage.objects for select using (bucket_id = 'profile');
create policy "Public read projects storage"     on storage.objects for select using (bucket_id = 'projects');
create policy "Public read certificates storage" on storage.objects for select using (bucket_id = 'certificates');
create policy "Public read icons storage"        on storage.objects for select using (bucket_id = 'icons');

-- Admin upload / delete policies
create policy "Admin manage profile storage"      on storage.objects for all using (bucket_id = 'profile'      and auth.role() = 'authenticated');
create policy "Admin manage projects storage"     on storage.objects for all using (bucket_id = 'projects'     and auth.role() = 'authenticated');
create policy "Admin manage certificates storage" on storage.objects for all using (bucket_id = 'certificates' and auth.role() = 'authenticated');
create policy "Admin manage icons storage"        on storage.objects for all using (bucket_id = 'icons'        and auth.role() = 'authenticated');
```

---

### Auto-update Trigger

```sql
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

create trigger set_blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();
```

---

## Internationalization (i18n)

Support two languages with a language toggle in the navbar:

| Code | Language |
|---|---|
| `en` | English |
| `id` | Indonesian (Bahasa Indonesia) |

All UI labels, section titles, navigation items, and form placeholders must be translated.

---

## Technical Requirements

- **Framework:** Nuxt 
- **UI Library:** [Nuxt UI](https://ui.nuxt.com) — use components from this library throughout the admin panel
- **Rich Text Editor:** [Tiptap](https://tiptap.dev) — used in Blog and Project `content` fields
- **Backend / Database:** Supabase (PostgreSQL + Storage + Auth)
- **Styling:** Tailwind CSS with custom design tokens (`#0F172A`, `#2DD4BF`)
- **Theme:** Dark / Light mode toggle (persisted via `localStorage` or cookie)
- **i18n:** `@nuxtjs/i18n` module
- **Authentication:** Supabase Auth (email/password for admin login)
- **Image uploads:** Supabase Storage (drag-and-drop preferred in admin)
- **Fonts:** Loaded via Google Fonts (`Space Grotesk`, `JetBrains Mono`)

---

## Rich Text Editor (Tiptap)

Use **Tiptap v2** as the rich text editor in the admin panel. It is used in two places:

| Field | Table | Column |
|---|---|---|
| Blog post body | `blog_posts` | `content_html` + `content_json` |
| Project detail content | `projects` | `content` |

### Required Tiptap Extensions

```ts
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
```

### Toolbar Actions

The editor toolbar must include:

- Text style: Bold, Italic, Underline, Strikethrough
- Headings: H1, H2, H3
- Lists: Bullet list, Ordered list
- Alignment: Left, Center, Right
- Code block (with syntax highlighting via `lowlight`)
- Blockquote
- Horizontal rule
- Insert image (upload to Supabase Storage `projects` or `blog` bucket)
- Insert link / unlink
- Highlight
- Undo / Redo

### Storage Strategy

- Save **both** `content_json` (Tiptap JSON) and `content_html` (rendered HTML) to the database on every save
- `content_json` is used to re-hydrate the editor when the admin reopens a post for editing
- `content_html` is used for rendering on the public-facing frontend (no Tiptap dependency needed on the frontend)

### Frontend Rendering

On the public Blog and Project detail pages, render `content_html` directly using `v-html`. Apply a custom `.prose` CSS class styled to match the site's design tokens (colors, fonts, spacing).

```vue
<div class="prose dark:prose-invert" v-html="post.content_html" />
```