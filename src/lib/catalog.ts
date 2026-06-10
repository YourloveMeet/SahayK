export interface TaskCatalogItem {
  id: string;
  title: string;
}

export interface TaskCategory {
  id: string;
  title: string;
  items: TaskCatalogItem[];
}

export const SEEKER_TASK_CATALOG: TaskCategory[] = [
  {
    id: "government_schemes",
    title: "Government Schemes",
    items: [
      { id: "disability_pension", title: "Disability Pension Application" },
      { id: "senior_citizen_pension", title: "Senior Citizen Pension" },
      { id: "widow_assistance", title: "Widow Assistance Scheme" },
      { id: "bpl_card", title: "BPL (Below Poverty Line) Card Application" },
      { id: "indira_gandhi_old_age", title: "Indira Gandhi National Old Age Pension" },
      { id: "indira_gandhi_disability", title: "Indira Gandhi National Disability Pension" },
      { id: "pm_awas_yojana", title: "PM Awas Yojana (Housing Scheme)" },
      { id: "ration_card_app", title: "Ration Card Application / Correction" },
      { id: "scholarship_disabled", title: "Scholarship for Disabled Students" },
      { id: "antyodaya_anna_yojana", title: "Antyodaya Anna Yojana" },
    ]
  },
  {
    id: "identity_documents",
    title: "Identity Documents",
    items: [
      { id: "aadhaar_correction", title: "Aadhaar Card Correction / Update" },
      { id: "aadhaar_new", title: "Aadhaar Card New Enrollment" },
      { id: "pan_card_app", title: "PAN Card Application" },
      { id: "pan_card_correction", title: "PAN Card Correction" },
      { id: "voter_id_reg", title: "Voter ID Registration" },
      { id: "voter_id_correction", title: "Voter ID Correction" },
      { id: "udid_card", title: "UDID Card (Disability ID)" },
      { id: "passport_help", title: "Passport Application Help" },
      { id: "driving_license", title: "Driving License (for eligible disabled)" },
      { id: "birth_certificate", title: "Birth Certificate" },
    ]
  },
  {
    id: "property_legal",
    title: "Property & Legal",
    items: [
      { id: "property_tax", title: "Property Tax Payment" },
      { id: "property_registration", title: "Property Registration Help" },
      { id: "land_record", title: "Land Record (7/12 Utara) Query" },
      { id: "property_mutation", title: "Property Mutation Application" },
      { id: "rent_agreement", title: "Rent Agreement Help" },
      { id: "legal_notice", title: "Legal Notice Understanding" },
      { id: "will_nomination", title: "Will / Nomination Form Help" },
      { id: "property_dispute", title: "Property Dispute Documentation" },
      { id: "shop_license", title: "Shop License Application" },
      { id: "noc_society", title: "NOC from Society" },
    ]
  },
  {
    id: "health_insurance",
    title: "Health & Insurance",
    items: [
      { id: "ayushman_bharat", title: "Ayushman Bharat (PMJAY) Enrollment" },
      { id: "health_card", title: "Health Card Application" },
      { id: "esi_card", title: "ESI Card Application" },
      { id: "insurance_claim", title: "Insurance Claim Filing" },
      { id: "medical_certificate", title: "Medical Certificate from Government Hospital" },
      { id: "disability_certificate", title: "Disability Certificate Application" },
      { id: "hospital_admission", title: "Hospital Admission Form Help" },
      { id: "jan_arogya_card", title: "Jan Arogya Card" },
      { id: "medical_reimbursement", title: "Corona / Medical Reimbursement Claim" },
      { id: "blood_group_record", title: "Blood Group / Health Record Documentation" },
    ]
  },
  {
    id: "banking",
    title: "Banking",
    items: [
      { id: "jan_dhan_account", title: "Jan Dhan Account Opening" },
      { id: "bank_account_reg", title: "Bank Account Opening (Regular)" },
      { id: "bank_form_filling", title: "Bank Form Filling (General)" },
      { id: "passbook_update", title: "Passbook Update / Entry" },
      { id: "cheque_writing", title: "Cheque Writing Help" },
      { id: "fixed_deposit", title: "Fixed Deposit Form" },
      { id: "loan_application", title: "Loan Application Help" },
      { id: "kyc_update", title: "KYC Update" },
      { id: "nominee_update_bank", title: "Nominee Update in Bank" },
      { id: "upi_setup", title: "UPI / Digital Payment Setup" },
    ]
  },
  {
    id: "education",
    title: "Education",
    items: [
      { id: "school_admission", title: "School Admission Form" },
      { id: "college_admission", title: "College Admission Form" },
      { id: "scholarship_app", title: "Scholarship Application" },
      { id: "transfer_certificate", title: "Transfer Certificate Help" },
      { id: "bonafide_certificate", title: "Bonafide Certificate Request" },
      { id: "migration_certificate", title: "Migration Certificate" },
      { id: "rti_education", title: "RTI Application for Education Records" },
      { id: "exam_form", title: "Exam Form Filling" },
      { id: "result_marksheet", title: "Result / Marksheet Download Help" },
      { id: "hostel_fee", title: "Hostel / Fee Concession Form" },
    ]
  },
  {
    id: "utilities",
    title: "Utilities",
    items: [
      { id: "electricity_new", title: "Electricity New Connection" },
      { id: "electricity_bill", title: "Electricity Bill Payment Help" },
      { id: "water_connection", title: "Water Connection Application" },
      { id: "gas_connection", title: "Gas Connection (LPG) Application" },
      { id: "ration_card_update", title: "Ration Card Update / Correction" },
      { id: "internet_broadband", title: "Internet / Broadband Application" },
      { id: "name_change_utility", title: "Name Change in Utility Bills" },
      { id: "meter_complaint", title: "Meter Complaint Filing" },
      { id: "solar_rooftop", title: "Solar Rooftop Subsidy Application" },
      { id: "pgvcl_dgvcl", title: "PGVCL / DGVCL Complaint" },
    ]
  },
  {
    id: "municipal_services",
    title: "Municipal Services",
    items: [
      { id: "birth_certificate_app", title: "Birth Certificate Application" },
      { id: "death_certificate", title: "Death Certificate Application" },
      { id: "domicile_certificate", title: "Domicile Certificate" },
      { id: "caste_certificate", title: "Caste Certificate" },
      { id: "income_certificate", title: "Income Certificate" },
      { id: "residence_proof", title: "Residence Proof Certificate" },
      { id: "marriage_certificate", title: "Marriage Certificate" },
      { id: "divorce_certificate", title: "Divorce Certificate Help" },
      { id: "character_certificate", title: "Character Certificate" },
      { id: "noc_general", title: "No Objection Certificate (NOC)" },
    ]
  },
  {
    id: "other",
    title: "Other",
    items: [
      { id: "rti_filing", title: "RTI (Right to Information) Filing" },
      { id: "police_complaint", title: "Police Complaint / FIR Help" },
      { id: "court_document", title: "Court Document Understanding" },
      { id: "ngo_registration", title: "NGO Registration Help" },
      { id: "anything_else", title: "Anything not listed above" },
    ]
  }
];
