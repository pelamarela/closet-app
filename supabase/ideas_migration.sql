CREATE TABLE outfit_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  occasion text,
  reasoning text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE idea_items (
  idea_id uuid REFERENCES outfit_ideas(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (idea_id, item_id)
);

ALTER TABLE outfit_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their ideas" ON outfit_ideas
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users own their idea items" ON idea_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM outfit_ideas WHERE id = idea_id AND user_id = auth.uid())
  );
