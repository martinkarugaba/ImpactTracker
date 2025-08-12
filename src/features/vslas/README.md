# VSLAs (Village Savings and Loans Associations) Feature

This feature provides comprehensive CRUD functionality for managing Village
Savings and Loans Associations (VSLAs) in the KPI Edge application.

## Overview

VSLAs are community-based financial organizations that help members save money
and access loans. This feature allows users to:

- Create and manage VSLAs
- Track VSLA members and their roles
- Monitor savings and loan activities
- Manage VSLA locations and meeting schedules
- View VSLA performance metrics

## Database Schema

### VSLAs Table

```sql
CREATE TABLE "vslas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "code" text NOT NULL UNIQUE,
  "description" text,
  "organization_id" uuid NOT NULL REFERENCES organizations(id),
  "cluster_id" uuid NOT NULL REFERENCES clusters(id),
  "project_id" uuid NOT NULL REFERENCES projects(id),
  "country" text NOT NULL,
  "district" text NOT NULL,
  "sub_county" text NOT NULL,
  "parish" text NOT NULL,
  "village" text NOT NULL,
  "address" text,
  "total_members" integer DEFAULT 0 NOT NULL,
  "total_savings" integer DEFAULT 0 NOT NULL,
  "total_loans" integer DEFAULT 0 NOT NULL,
  "meeting_frequency" text NOT NULL,
  "meeting_day" text,
  "meeting_time" text,
  "status" text DEFAULT 'active' NOT NULL,
  "formed_date" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
```

### VSLA Members Table

```sql
CREATE TABLE "vsla_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "vsla_id" uuid NOT NULL REFERENCES vslas(id),
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text,
  "role" text DEFAULT 'member' NOT NULL,
  "joined_date" timestamp NOT NULL,
  "total_savings" integer DEFAULT 0 NOT NULL,
  "total_loans" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
```

## File Structure

```
src/features/vslas/
├── actions/
│   ├── vslas.ts              # VSLA CRUD operations
│   └── vsla-members.ts       # VSLA member CRUD operations
├── components/
│   ├── vsla-form/
│   │   └── vsla-form.tsx     # VSLA creation/editing form
│   ├── vsla-member-form/
│   │   └── vsla-member-form.tsx # VSLA member form
│   ├── create-vsla-dialog.tsx    # Create VSLA dialog
│   ├── edit-vsla-dialog.tsx      # Edit VSLA dialog
│   ├── delete-vsla-dialog.tsx    # Delete VSLA dialog
│   ├── vslas-table.tsx           # VSLAs data table
│   ├── vsla-table-columns.tsx    # Table column definitions
│   ├── vslas-page-content.tsx    # Main page content
│   └── vslas-page-skeleton.tsx   # Loading skeleton
├── schemas/
│   └── vsla-schema.ts        # Zod validation schemas
├── types.ts                  # TypeScript type definitions
└── README.md                 # This file
```

## Features

### 1. VSLA Management

- **Create VSLAs**: Add new VSLAs with comprehensive information
- **Edit VSLAs**: Update VSLA details and settings
- **Delete VSLAs**: Remove VSLAs with confirmation
- **View VSLAs**: Browse and filter VSLA listings

### 2. VSLA Member Management

- **Add Members**: Register new VSLA members
- **Member Roles**: Assign roles (Chairperson, Secretary, Treasurer, Member)
- **Track Savings/Loans**: Monitor individual member financial activities
- **Member Status**: Manage active/inactive/suspended status

### 3. Location and Meeting Management

- **Geographic Data**: Store country, district, sub-county, parish, village
- **Meeting Schedule**: Set frequency, day, and time for meetings
- **Address Information**: Store detailed location information

### 4. Financial Tracking

- **Total Savings**: Track overall VSLA savings
- **Total Loans**: Monitor total loan amounts
- **Member Contributions**: Individual member savings and loan tracking

## Usage

### Creating a VSLA

1. Navigate to `/dashboard/vslas`
2. Click "New VSLA" button
3. Fill in the required information:
   - Basic details (name, code, description)
   - Organization, cluster, and project associations
   - Location information
   - Meeting schedule
   - Initial financial data
4. Click "Save VSLA"

### Managing VSLA Members

1. Select a VSLA from the table
2. Use the actions menu to manage members
3. Add new members with their details
4. Track individual savings and loan amounts

### Filtering and Searching

- Use the search bar to filter VSLAs by name
- Sort by any column (name, members, savings, loans, etc.)
- Toggle column visibility as needed

## API Endpoints

### VSLAs

- `GET /api/vslas` - Get all VSLAs
- `GET /api/vslas/:id` - Get specific VSLA
- `POST /api/vslas` - Create new VSLA
- `PUT /api/vslas/:id` - Update VSLA
- `DELETE /api/vslas/:id` - Delete VSLA

### VSLA Members

- `GET /api/vslas/:id/members` - Get VSLA members
- `POST /api/vslas/:id/members` - Add member to VSLA
- `PUT /api/vsla-members/:id` - Update member
- `DELETE /api/vsla-members/:id` - Remove member

## Validation

The feature uses Zod schemas for validation:

- **VSLA Schema**: Validates all VSLA fields including required fields and data
  types
- **VSLA Member Schema**: Validates member information and financial data
- **Form Validation**: Real-time validation in the UI with error messages

## Dependencies

- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Tables**: TanStack Table for data display
- **Date Handling**: date-fns for date formatting and validation

## Future Enhancements

1. **Financial Reports**: Generate savings and loan reports
2. **Meeting Attendance**: Track member attendance at meetings
3. **Loan Applications**: Manage loan application process
4. **Notifications**: Alert members about meetings and payments
5. **Mobile App**: Extend functionality to mobile devices
6. **Analytics Dashboard**: Visualize VSLA performance metrics

## Contributing

When adding new features to the VSLAs module:

1. Follow the existing file structure
2. Use TypeScript for type safety
3. Implement proper validation with Zod
4. Add appropriate error handling
5. Update this README with new features
6. Test thoroughly before submitting

## Support

For issues or questions related to the VSLAs feature, please refer to the main
project documentation or contact the development team.
