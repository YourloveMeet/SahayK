-- 1. Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  cause TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donors can view their own donations" 
  ON donations FOR SELECT 
  USING (donor_id = auth.uid());

CREATE POLICY "Recipients can view their received donations" 
  ON donations FOR SELECT 
  USING (recipient_id = auth.uid());

CREATE POLICY "Donors can insert donations" 
  ON donations FOR INSERT 
  WITH CHECK (donor_id = auth.uid());

-- 2. Create seeker_financial_requests table
CREATE TABLE IF NOT EXISTS seeker_financial_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_needed NUMERIC NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('High', 'Medium', 'Low')),
  status TEXT DEFAULT 'Open' NOT NULL CHECK (status IN ('Open', 'Fulfilled')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE seeker_financial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open seeker financial requests" 
  ON seeker_financial_requests FOR SELECT 
  USING (true);

CREATE POLICY "Seekers can insert their own requests" 
  ON seeker_financial_requests FOR INSERT 
  WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Seekers can update their own requests" 
  ON seeker_financial_requests FOR UPDATE 
  USING (seeker_id = auth.uid());

-- 3. Add preferred_causes to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_causes TEXT[] DEFAULT '{}';
