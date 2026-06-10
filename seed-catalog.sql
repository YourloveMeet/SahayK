-- Seed Categories
INSERT INTO public.service_categories (id, title, sort_order) VALUES
('government_schemes', 'Government Schemes', 1),
('identity_documents', 'Identity Documents', 2),
('property_legal', 'Property & Legal', 3),
('health_insurance', 'Health Insurance', 4),
('banking', 'Banking', 5),
('education', 'Education', 6),
('utilities', 'Utilities', 7),
('municipal_services', 'Municipal Services', 8)
ON CONFLICT (id) DO NOTHING;

-- Seed Services
INSERT INTO public.services (category_id, title, official_url, estimated_time, documents_needed, steps, sort_order) VALUES
-- Government Schemes
('government_schemes', 'Disability Pension Application', 'https://sjsa.maharashtra.gov.in', '45-60 minutes', '["Aadhaar Card", "Disability Certificate", "Bank Passbook", "Income Certificate"]', '["Go to official state portal", "Login or create an account", "Fill out the pension application form", "Upload required documents", "Submit and save the reference number"]', 1),
('government_schemes', 'Senior Citizen Pension', 'https://nsap.nic.in', '30-45 minutes', '["Aadhaar Card", "Age Proof (Birth Certificate or PAN)", "Bank Passbook", "Income Certificate"]', '["Visit NSAP portal", "Select your state and pension scheme", "Enter personal and banking details", "Upload scanned documents", "Submit form"]', 2),
('government_schemes', 'Widow Assistance Scheme', 'https://wcd.nic.in', '45-60 minutes', '["Aadhaar Card", "Husband''s Death Certificate", "Income Certificate", "Bank Passbook"]', '["Visit Women & Child Development portal", "Locate the Widow Pension Scheme", "Fill in details and upload Death Certificate", "Submit for verification"]', 3),
('government_schemes', 'BPL (Below Poverty Line) Card Application', 'https://nfsa.gov.in', '45-60 minutes', '["Aadhaar Card", "Income Certificate", "Address Proof", "Passport Size Photo"]', '["Visit state food portal", "Select new ration card option", "Fill in family details and income", "Submit proof of residence", "Wait for verification"]', 4),

-- Identity Documents
('identity_documents', 'Aadhaar Card Correction / Update', 'https://myaadhaar.uidai.gov.in', '15-30 minutes', '["Aadhaar Number", "Mobile linked to Aadhaar", "Valid Proof of Address/Name"]', '["Go to myAadhaar portal", "Login with Aadhaar OTP", "Select Update Aadhaar Online", "Choose Name/Address/DOB to update", "Upload valid proof document", "Pay Rs. 50 fee online"]', 1),
('identity_documents', 'Aadhaar Card New Enrollment', 'https://appointments.uidai.gov.in', '15 minutes (to book appointment)', '["Proof of Identity", "Proof of Address", "Date of Birth Proof"]', '["Visit UIDAI appointment portal", "Locate nearest Aadhaar Seva Kendra", "Select time slot", "Take necessary original documents to the center at the booked time"]', 2),
('identity_documents', 'PAN Card Application', 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', '30-45 minutes', '["Aadhaar Card", "Passport Size Photo", "Signature Scan"]', '["Go to NSDL PAN portal", "Select New PAN (Form 49A)", "Fill in applicant details", "Authenticate via Aadhaar e-KYC", "Pay processing fee", "Submit"]', 3),
('identity_documents', 'Voter ID Registration', 'https://voters.eci.gov.in/', '20-30 minutes', '["Aadhaar Card", "Address Proof", "Passport Size Photo"]', '["Go to Election Commission Portal", "Select Form 6 for New Voter", "Fill personal and address details", "Upload photo and address proof", "Submit and save reference ID"]', 4);
