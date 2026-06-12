CREATE TABLE suggestion_feedback (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  occasion text,
  item_ids text[],
  feedback text CHECK (feedback IN ('up', 'down')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suggestion_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their feedback" ON suggestion_feedback
  FOR ALL USING (user_id = auth.uid());
