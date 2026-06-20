# SahayaK — New Modules Implementation Spec

**Target:** Coding agent extending the existing SahayaK codebase (React + Tailwind + Supabase).
**Scope:** Two modules — (1) Amenities/Errand Requests with manual status tracking, (2) NGO Admin Panel (basic CRUD).
**Constraint:** Must integrate with existing `profiles` and `tasks` tables, not replace them. Reuse existing auth, RLS patterns, and UI components wherever possible.

---

## Context: What Already Exists

- `profiles` table — roles: `seeker`, `volunteer`, `admin`
- `tasks` table — status flow: `open → accepted → in_progress → completed → verified`
- `task_messages`, `notifications`, `help_score_log`, `schemes` tables already exist
- Existing task categories: Government Schemes, Identity Documents, Property & Legal, Health & Insurance, Banking, Education, Utilities, Municipal Services, Other (9 categories total)
- Frontend: React + Tailwind, deployed on Vercel
- Existing Volunteer Dashboard has: stats bar, map, filters, Nearby Requests list, task detail modal, Accept flow, My Active Tasks, Complete Task modal with image upload

**Do not rebuild any of the above. Extend it.**

---

## MODULE 1: Amenities / Errand Requests

### 1.1 Purpose

Allow seekers who cannot leave their home (groceries, medicine pickup, small errands) to request help, distinct from the existing documentation-task flow. Adds a new task category with structured item lists instead of free-text description, plus manual (non-GPS) status tracking so seekers know where their volunteer is in the process.

### 1.2 New Task Category

Add a 10th category to the existing category list:

```
Category: "Daily Essentials & Errands"
Sub-services:
  - Grocery Shopping
  - Medicine / Pharmacy Pickup
  - Utility Bill Payment (in-person)
  - Small Household Errand (specify)
```

This reuses the existing `tasks` table — do not create a separate table for the task itself. Add an `errand_details` JSONB column (see schema below) to hold the structured item list specific to this category.

### 1.3 Schema Changes

```sql
-- Add to existing tasks table
ALTER TABLE tasks ADD COLUMN errand_details JSONB DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN task_status_detail TEXT DEFAULT NULL;
-- task_status_detail holds the manual tracking sub-state, separate from the main status enum.
-- Allowed values: 'not_started', 'on_the_way_to_shop', 'shopping_in_progress',
--                 'on_the_way_to_seeker', 'arrived', 'delivered'

ALTER TABLE tasks ADD COLUMN receipt_image_url TEXT DEFAULT NULL;
-- Used in Phase 2 (receipt upload) — column can be added now even if feature ships later.
```

`errand_details` JSONB shape:

```json
{
  "items": [
    { "name": "Milk - 1L", "quantity": 2, "notes": "Amul preferred" },
    { "name": "Paracetamol 500mg", "quantity": 1, "notes": "as prescribed, see photo" }
  ],
  "preferred_shop": "Nearby Apna Bazaar or any pharmacy",
  "estimated_budget": 500
}
```

### 1.4 Seeker-Side Screens

**New: "Request Errand" form** (separate entry point from existing "Request Help" form, or a tab within it — agent's choice based on existing UI structure)

Fields:
- Errand type (dropdown: Grocery / Medicine / Bill Payment / Other)
- Item list builder — repeatable rows: item name (text), quantity (number), notes (optional text)
- "Add another item" button
- Preferred shop/pharmacy (optional text)
- Estimated budget (optional number, INR)
- Urgent flag (reuse existing component)
- Location pin (reuse existing map component)

On submit: creates a row in `tasks` with `category = 'Daily Essentials & Errands'`, populates `errand_details`, sets `task_status_detail = 'not_started'`.

**Existing "My Requests" page — extend, don't duplicate:**
Add a status tracker UI element for tasks where `category = 'Daily Essentials & Errands'`. Show a simple horizontal stepper:

```
Not Started → On the way to shop → Shopping → On the way to you → Arrived/Delivered
```

Highlight current step based on `task_status_detail`. This is the "Zomato/Swiggy-style" tracking — implemented as manual volunteer-updated status, NOT live GPS. Do not attempt real-time location polling in this phase.

### 1.5 Volunteer-Side Screens

**Existing "Nearby Requests" list — extend filter:**
Add "Daily Essentials & Errands" as a filterable category alongside existing 9 categories. No structural change needed beyond adding it to the existing filter enum.

**Existing Task Detail Modal — extend for this category:**
When `category = 'Daily Essentials & Errands'`, render the item checklist from `errand_details.items` instead of (or alongside) the free-text description. Show preferred shop and budget if present.

**New: Status Update Control (within "My Active Tasks")**
For accepted tasks where `category = 'Daily Essentials & Errands'`, show a simple button/dropdown to advance `task_status_detail` through the sequence:

```
[Mark: On the way to shop] → [Mark: Shopping in progress] → [Mark: On the way to seeker] → [Mark: Arrived]
```

Each click is a single Supabase update to `task_status_detail`. Trigger existing `notifications` flow on each status change (reuse existing notification trigger pattern, just add this as a new trigger event type).

**Existing Complete Task Modal — extend:**
For this category, before final completion, prompt "Upload receipt photo" (optional in Phase 1, can become required later). Store in `receipt_image_url`. Reuse existing image upload component/Storage bucket pattern.

### 1.6 Explicitly Out of Scope for This Phase

- Live GPS tracking — do NOT implement continuous location polling, map-based live volunteer dot, or background location permissions. This is a documented future-scope item, not part of this build.
- Payment/reimbursement processing — cash handled in person, receipt photo is just a record, not a payment flow.
- Route batching / multi-task optimization for volunteers.

---

## MODULE 2: NGO Admin Panel

### 2.1 Purpose

A fourth role/account type allowing NGO staff to register, manage a roster of elderly/disabled residents under their care, track medicines and reminders per resident, and (Phase 2) refer cases to other NGOs.

### 2.2 New Role

Add `ngo_admin` as a 4th value in the existing `profiles.role` enum (currently `seeker`, `volunteer`, `admin`).

```sql
ALTER TABLE profiles ALTER COLUMN role TYPE TEXT;
-- Update CHECK constraint / enum to include 'ngo_admin'
-- If using Postgres ENUM type: ALTER TYPE profile_role ADD VALUE 'ngo_admin';
```

### 2.3 New Tables

```sql
CREATE TABLE ngo_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL, -- the ngo_admin account
  ngo_name TEXT NOT NULL,
  registration_number TEXT,
  address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  specialization TEXT[], -- e.g. ['elderly_care', 'vision_impaired', 'legal_aid']
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ngo_residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngo_profiles(id) NOT NULL,
  full_name TEXT NOT NULL,
  age INT,
  gender TEXT,
  photo_url TEXT,
  medical_notes TEXT,
  mobility_status TEXT, -- e.g. 'independent', 'needs_assistance', 'bedridden'
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE resident_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES ngo_residents(id) NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT, -- e.g. "1 tablet"
  frequency TEXT, -- e.g. "twice daily", "every Monday"
  time_of_day TEXT[], -- e.g. ['morning', 'evening']
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE resident_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES ngo_residents(id) NOT NULL,
  reminder_type TEXT, -- 'medicine', 'appointment', 'document_renewal', 'other'
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- e.g. 'daily', 'weekly', 'monthly'
  completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id), -- ngo_admin who created it
  created_at TIMESTAMPTZ DEFAULT now()
);
```

RLS policy pattern: `ngo_admin` can only read/write `ngo_residents`, `resident_medicines`, `resident_reminders` rows where `ngo_id` matches their own `ngo_profiles.id`. Follow the same RLS pattern already used for seeker/volunteer row-level isolation in the existing schema.

### 2.4 NGO Registration Flow

Extend existing Register page: add "NGO" as a third option alongside Seeker/Volunteer role selection.

On NGO registration, after standard auth signup, show an additional one-time setup form:
- NGO name
- Registration number (optional)
- Address + location pin (reuse existing map component)
- Contact phone, contact email
- Specialization (multi-select: Elderly Care, Vision Impaired, Hearing Impaired, Mobility/Physical Disability, Mental Health, Legal Aid, General/Other)

Creates one row in `ngo_profiles` linked to the new `profiles` row.

### 2.5 NGO Admin Dashboard — New Screens

**2.5.1 Residents List (main landing page for ngo_admin role)**
- Card/table list of all residents under this NGO
- Search/filter by name
- "Add New Resident" button
- Each card shows: photo, name, age, mobility status, count of active medicines/reminders due soon

**2.5.2 Add/Edit Resident Form**
- All fields from `ngo_residents` table
- Photo upload (reuse existing image upload pattern)

**2.5.3 Resident Detail Page**
Tabs or sections:
- Profile info (editable)
- Medicines list — table of `resident_medicines`, with "Add Medicine" form (name, dosage, frequency, time of day, notes)
- Reminders list — table of `resident_reminders`, with "Add Reminder" form (type, title, description, due date, recurring toggle)
- Mark medicine inactive / mark reminder completed — simple toggle buttons

**2.5.4 Today's Reminders Dashboard Widget**
On the main NGO dashboard landing page, show a "Due Today / Overdue" widget pulling from `resident_reminders` where `due_date <= today AND completed = false`, grouped by resident. This is the single highest-value screen for demo purposes — it's the "at a glance, who needs what today" view.

### 2.6 Explicitly Out of Scope for This Phase (Phase 2 / build-if-time-allows)

- NGO-to-NGO referral directory (separate spec needed if pursued — would need a `ngo_referrals` table and a public/semi-public directory view of all `ngo_profiles` filterable by `specialization` and location)
- Medicine reminder → auto-generated SahayaK task bridge
- Resident self-login or family/guardian read-only access
- Any cross-NGO data sharing — `ngo_residents` data must remain strictly scoped to the owning NGO under RLS, no exceptions in this phase

---

## Build Order Recommendation for Agent

1. Schema migrations (both modules' tables/columns) — do this first, in one migration pass
2. Module 1 seeker-side (request errand form + my requests stepper)
3. Module 1 volunteer-side (filter, modal extension, status update control)
4. Module 2 NGO registration + profile setup
5. Module 2 residents CRUD (list, add, edit, detail)
6. Module 2 medicines + reminders CRUD within resident detail
7. Module 2 "Today's Reminders" dashboard widget
8. Wire up existing notification triggers for new status-change events (errand status updates)

## Testing Checklist Before Demo

- [ ] Seeker can submit an errand request with multiple items
- [ ] Volunteer sees errand requests in Nearby Requests, can filter by this category
- [ ] Volunteer can advance status step by step; seeker sees stepper update in My Requests
- [ ] Volunteer can complete task with optional receipt photo
- [ ] NGO admin can register and complete NGO profile setup
- [ ] NGO admin can add a resident, add medicines, add reminders
- [ ] Today's Reminders widget correctly shows only due/overdue, grouped by resident
- [ ] RLS confirmed: one NGO admin cannot see another NGO's residents (test with two NGO test accounts)
