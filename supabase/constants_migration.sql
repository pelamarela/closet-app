-- "Constants" are pieces the user always wears (jewelry, watch, etc.) — kept
-- separate from the closet (items table). No category/warmth/formality —
-- just a description and an optional photo. Uses the existing item-photos
-- storage bucket (its policies key off the top-level user_id folder, so no
-- new bucket/policy is needed).

CREATE TABLE constants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  image_url   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE constants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their constants" ON constants
  FOR ALL USING (user_id = auth.uid());
