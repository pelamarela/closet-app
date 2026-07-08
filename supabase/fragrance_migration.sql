-- Migration: add 'fragrance' as a valid item category
-- Run this once in the Supabase SQL editor.

alter table public.items
  drop constraint if exists items_category_check;

alter table public.items
  add constraint items_category_check
  check (category in ('top','bottom','one-piece','outerwear','shoes','accessory','fragrance'));
