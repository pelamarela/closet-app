-- ============================================================
-- Closet App — Supabase schema
-- Run this in the Supabase SQL editor to set up the database.
-- ============================================================

-- Enable UUID extension (usually already enabled on Supabase)
create extension if not exists "uuid-ossp";

-- ─── items ───────────────────────────────────────────────────
create table if not exists public.items (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  category    text not null check (category in ('top','bottom','one-piece','outerwear','shoes','accessory')),
  subcategory text,
  color       text,
  pattern     text,
  material    text,
  warmth      int  not null check (warmth between 1 and 5),
  formality   int  not null check (formality between 1 and 5),
  brand       text,
  image_url   text,
  status      text not null default 'active' check (status in ('active','archived')),
  created_at  timestamptz not null default now(),
  user_id     uuid not null references auth.users(id) on delete cascade
);

-- ─── outfits ─────────────────────────────────────────────────
create table if not exists public.outfits (
  id         uuid primary key default uuid_generate_v4(),
  date_worn  date not null default current_date,
  occasion   text,
  weather    jsonb,
  rating     int check (rating between 1 and 5),
  image_url  text,
  notes      text,
  created_at timestamptz not null default now(),
  user_id    uuid not null references auth.users(id) on delete cascade
);

-- ─── outfit_items (join) ─────────────────────────────────────
create table if not exists public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  item_id   uuid not null references public.items(id)  on delete cascade,
  primary key (outfit_id, item_id)
);

-- ─── style_profile ───────────────────────────────────────────
create table if not exists public.style_profile (
  id          uuid primary key default uuid_generate_v4(),
  description text not null default '',
  updated_at  timestamptz not null default now(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  unique(user_id)
);

-- ─── Row-Level Security ──────────────────────────────────────
alter table public.items         enable row level security;
alter table public.outfits       enable row level security;
alter table public.outfit_items  enable row level security;
alter table public.style_profile enable row level security;

-- items policies
create policy "owner can select items"
  on public.items for select
  using (auth.uid() = user_id);

create policy "owner can insert items"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "owner can update items"
  on public.items for update
  using (auth.uid() = user_id);

create policy "owner can delete items"
  on public.items for delete
  using (auth.uid() = user_id);

-- outfits policies
create policy "owner can select outfits"
  on public.outfits for select
  using (auth.uid() = user_id);

create policy "owner can insert outfits"
  on public.outfits for insert
  with check (auth.uid() = user_id);

create policy "owner can update outfits"
  on public.outfits for update
  using (auth.uid() = user_id);

create policy "owner can delete outfits"
  on public.outfits for delete
  using (auth.uid() = user_id);

-- outfit_items policies (access via outfits ownership)
create policy "owner can select outfit_items"
  on public.outfit_items for select
  using (
    exists (
      select 1 from public.outfits o
      where o.id = outfit_id and o.user_id = auth.uid()
    )
  );

create policy "owner can insert outfit_items"
  on public.outfit_items for insert
  with check (
    exists (
      select 1 from public.outfits o
      where o.id = outfit_id and o.user_id = auth.uid()
    )
  );

create policy "owner can delete outfit_items"
  on public.outfit_items for delete
  using (
    exists (
      select 1 from public.outfits o
      where o.id = outfit_id and o.user_id = auth.uid()
    )
  );

-- style_profile policies
create policy "owner can select style_profile"
  on public.style_profile for select
  using (auth.uid() = user_id);

create policy "owner can insert style_profile"
  on public.style_profile for insert
  with check (auth.uid() = user_id);

create policy "owner can update style_profile"
  on public.style_profile for update
  using (auth.uid() = user_id);

-- ─── Storage bucket ──────────────────────────────────────────
-- Create a private bucket called "item-photos" in the Supabase
-- dashboard (Storage → New bucket → name: item-photos, private).
-- Then add these storage policies in the dashboard or via SQL:

insert into storage.buckets (id, name, public)
  values ('item-photos', 'item-photos', false)
  on conflict do nothing;

create policy "owner can upload item photos"
  on storage.objects for insert
  with check (bucket_id = 'item-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "owner can read item photos"
  on storage.objects for select
  using (bucket_id = 'item-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "owner can delete item photos"
  on storage.objects for delete
  using (bucket_id = 'item-photos' and auth.uid()::text = (storage.foldername(name))[1]);
