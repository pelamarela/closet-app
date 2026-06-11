-- Migration: rename 'dress' and 'set' categories to 'one-piece'
-- Run this once in the Supabase SQL editor.

-- 1. Migrate existing rows
update public.items
  set category = 'one-piece'
  where category in ('dress', 'set');

-- 2. Drop old check constraint and add the new one
alter table public.items
  drop constraint if exists items_category_check;

alter table public.items
  add constraint items_category_check
  check (category in ('top','bottom','one-piece','outerwear','shoes','accessory'));
