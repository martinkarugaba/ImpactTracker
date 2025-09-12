# VSLA (Village Savings and Loan Association) Data Structure

## Overview

This document outlines the comprehensive data structure for VSLAs as specified.
Each VSLA record captures detailed information about the group, its operations,
governance, and financial aspects.

## Required Information Fields

### 1. Basic Information

- **Group name** (`name`): The official name of the VSLA
- **Code** (`code`): Unique identifier/code for the VSLA
- **Primary business** (`primary_business`): Main business activity from
  predefined options:
  - Agriculture
  - Bakery
  - Basket weaving
  - Boda-boda
  - Catering and cookery
  - Hairdressing and cosmetology
  - Leather and craft making
  - Others (specify)
- **Primary business other** (`primary_business_other`): Specification when
  "Others" is selected

### 2. Location Information

- **Country** (`country`): Country where VSLA operates
- **Region** (`region`): Administrative region
- **District** (`district`): Administrative district
- **County** (`county`): Administrative county
- **Subcounty** (`sub_county`): Administrative subcounty
- **Parish** (`parish`): Administrative parish
- **Village** (`village`): Administrative village

### 3. Organizational Information

- **Formation date** (`formation_date`): Date when VSLA was established
- **Closing date** (`closing_date`): Date when VSLA was closed (optional)
- **Organization ID** (`organization_id`): Reference to parent organization
- **Cluster ID** (`cluster_id`): Reference to cluster
- **Project ID** (`project_id`): Reference to project

### 4. Meeting Information

- **Meeting frequency** (`meeting_frequency`): How often meetings occur (weekly,
  monthly, etc.)
- **Meeting day** (`meeting_day`): Day of the week for meetings
- **Meeting time** (`meeting_time`): Time of day for meetings
- **Meeting location** (`meeting_location`): Physical location where meetings
  are held

### 5. Local Leadership

- **LC1 Chairperson Name** (`lc1_chairperson_name`): Name of the local council
  chairperson
- **LC1 Chairperson Contact** (`lc1_chairperson_contact`): Contact information
  for LC1 chairperson

### 6. Governance

- **VSLA has a constitution** (`has_constitution`): Yes/No - Whether group has
  constitution
- **VSLA has a signed constitution** (`has_signed_constitution`): Yes/No -
  Whether constitution is signed

### 7. Banking Information

- **Bank name** (`bank_name`): Name of the bank where VSLA has account
- **Bank branch** (`bank_branch`): Specific bank branch
- **Bank account number** (`bank_account_number`): Account number
- **Registration certificate number** (`registration_certificate_number`):
  Official registration number

### 8. SACCO Information

- **SACCO Member** (`sacco_member`): Yes/No - Whether VSLA is a SACCO member

### 9. Additional Information

- **Notes** (`notes`): Free text for additional information and comments

### 10. Financial Summary (Auto-calculated)

- **Total members** (`total_members`): Number of active members
- **Total savings** (`total_savings`): Cumulative savings amount
- **Total loans** (`total_loans`): Total loans outstanding

## Database Schema

The VSLA table has been updated to include all these fields with appropriate
data types:

- Text fields for names, descriptions, and identifiers
- Timestamp fields for dates
- Enum-constrained fields for standardized options (yes/no, business types)
- Integer fields for financial amounts and member counts
- UUID references for organizational relationships

## Validation Rules

- Required fields are enforced at database and application level
- Business type must be from predefined list
- Yes/No fields are constrained to valid values
- Conditional validation: if primary_business is "Others", then
  primary_business_other is required
- Formation date is required; closing date is optional
- Financial amounts must be non-negative

## Integration Points

- Links to Organizations, Clusters, and Projects tables
- Can have multiple VSLA members through vsla_members table
- Location fields integrate with Uganda administrative structure
- Financial fields can be calculated from member transactions

This comprehensive structure ensures all required VSLA information is captured
systematically and can support detailed reporting and analysis.
