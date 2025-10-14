# Skill Category Feature for Training Activities

## Overview

Added a `skillCategory` field to the activities table to track the type of
skills being trained in training activities.

## Changes Made

### 1. Database Schema (`src/lib/db/schema.ts`)

- Added `skillCategory: text("skill_category")` field to the `activities` table
- Field is optional but required when activity type is "training"
- Allows values: `business`, `vocational`, or `soft_skills`

### 2. Types (`src/features/activities/types/types.ts`)

- Added `SKILL_CATEGORIES` constant array with values:
  `["business", "vocational", "soft_skills"]`
- Added `SkillCategory` type definition
- Exported both for use throughout the application

### 3. Activity Form (`src/features/activities/components/forms/activity-form-dialog.tsx`)

- Added `skillCategory` field to the form schema with conditional validation
- Implemented validation rule: when activity type is "training", skillCategory
  is required
- Added form field that conditionally displays when activity type is "training"
- Field shows as a select dropdown with three options:
  - Business
  - Vocational
  - Soft Skills
- Integrated `skillCategory` into form submission for both create and update
  operations
- Added to default values and form reset logic

### 4. Database Migration

- Created migration file: `migrations/add-skill-category-to-activities.sql`
- Migration adds the `skill_category` column to the activities table

## Usage

When creating or editing a training activity:

1. Select "Training" as the activity type
2. The "Skill Category" field will appear below the type/status fields
3. Select one of the three skill categories:
   - **Business**: For business-related skills training
   - **Vocational**: For vocational/technical skills training
   - **Soft Skills**: For soft skills training (communication, leadership, etc.)
4. The field is required for training activities and will prevent form
   submission if not selected

For non-training activities, the skill category field is hidden and not
required.

## Database Migration

To apply the schema changes to your database, run:

```bash
pnpm db:push
```

Or manually apply the migration file:

```bash
psql -d your_database < migrations/add-skill-category-to-activities.sql
```

## Notes

- The field is stored as TEXT in the database for flexibility
- Frontend validation ensures only valid values are submitted
- Existing training activities will have `null` for skillCategory until updated
- The field is optional at the database level but required by form validation
  for training activities
