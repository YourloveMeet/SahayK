require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SEEKER_TASK_CATALOG = [
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
    title: "Health Insurance", // Changed from "Health & Insurance" to match DB
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

async function seed() {
  const insertData = [];

  for (const cat of SEEKER_TASK_CATALOG) {
    cat.items.forEach((item, index) => {
      insertData.push({
        id: crypto.randomUUID(),
        category_id: cat.id,
        title: item.title,
        official_url: null,
        estimated_time: "Varies",
        documents_needed: ["Relevant Documents", "Aadhaar Card"],
        steps: ["Contact Volunteer for exact steps"],
        sort_order: index + 1
      });
    });
  }

  // Ensure 'other' category exists in service_categories table
  const { data: cats } = await supabase.from('service_categories').select('id');
  if (!cats.some(c => c.id === 'other')) {
     await supabase.from('service_categories').insert({ id: 'other', title: 'Other', sort_order: 9 });
  }

  const { data, error } = await supabase.from('services').insert(insertData);
  if (error) {
    console.error("Error inserting services:", error);
  } else {
    console.log("Successfully inserted", insertData.length, "services!");
  }
}

seed();
