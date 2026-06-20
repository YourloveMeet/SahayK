-- 1. Modify ngo_residents
ALTER TABLE ngo_residents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE ngo_residents ADD COLUMN IF NOT EXISTS status_date DATE DEFAULT NULL;
ALTER TABLE ngo_residents ADD COLUMN IF NOT EXISTS status_note TEXT DEFAULT NULL;
ALTER TABLE ngo_residents ADD COLUMN IF NOT EXISTS assigned_caretaker TEXT DEFAULT NULL;

-- 2. Create resident_care_notes
CREATE TABLE IF NOT EXISTS resident_care_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID REFERENCES ngo_residents(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT NOT NULL,
  category TEXT NOT NULL,
  logged_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE resident_care_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NGOs can view their own residents' care notes" 
  ON resident_care_notes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ngo_residents
      WHERE ngo_residents.id = resident_care_notes.resident_id
      AND ngo_residents.ngo_id IN (
        SELECT id FROM ngo_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "NGOs can insert their own residents' care notes" 
  ON resident_care_notes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ngo_residents
      WHERE ngo_residents.id = resident_care_notes.resident_id
      AND ngo_residents.ngo_id IN (
        SELECT id FROM ngo_profiles WHERE user_id = auth.uid()
      )
    )
    AND logged_by = auth.uid()
  );

-- 3. Create resident_documents
CREATE TABLE IF NOT EXISTS resident_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID REFERENCES ngo_residents(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  label TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE resident_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NGOs can view their own residents' documents" 
  ON resident_documents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ngo_residents
      WHERE ngo_residents.id = resident_documents.resident_id
      AND ngo_residents.ngo_id IN (
        SELECT id FROM ngo_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "NGOs can insert their own residents' documents" 
  ON resident_documents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ngo_residents
      WHERE ngo_residents.id = resident_documents.resident_id
      AND ngo_residents.ngo_id IN (
        SELECT id FROM ngo_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 4. Create resident_visitor_log
CREATE TABLE IF NOT EXISTS resident_visitor_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID REFERENCES ngo_residents(id) ON DELETE CASCADE NOT NULL,
  visitor_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  visit_date DATE NOT NULL,
  notes TEXT,
  logged_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE resident_visitor_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NGOs can view their own residents' visitor logs" 
  ON resident_visitor_log FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ngo_residents
      WHERE ngo_residents.id = resident_visitor_log.resident_id
      AND ngo_residents.ngo_id IN (
        SELECT id FROM ngo_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "NGOs can insert their own residents' visitor logs" 
  ON resident_visitor_log FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ngo_residents
      WHERE ngo_residents.id = resident_visitor_log.resident_id
      AND ngo_residents.ngo_id IN (
        SELECT id FROM ngo_profiles WHERE user_id = auth.uid()
      )
    )
    AND logged_by = auth.uid()
  );

-- 5. Create resident_incidents
CREATE TABLE IF NOT EXISTS resident_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID REFERENCES ngo_residents(id) ON DELETE CASCADE NOT NULL,
  incident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_datetime TIMESTAMPTZ NOT NULL,
  action_taken TEXT,
  severity TEXT NOT NULL,
  logged_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE resident_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NGOs can view their own residents' incidents" 
  ON resident_incidents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ngo_residents
      WHERE ngo_residents.id = resident_incidents.resident_id
      AND ngo_residents.ngo_id IN (
        SELECT id FROM ngo_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "NGOs can insert their own residents' incidents" 
  ON resident_incidents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ngo_residents
      WHERE ngo_residents.id = resident_incidents.resident_id
      AND ngo_residents.ngo_id IN (
        SELECT id FROM ngo_profiles WHERE user_id = auth.uid()
      )
    )
    AND logged_by = auth.uid()
  );
