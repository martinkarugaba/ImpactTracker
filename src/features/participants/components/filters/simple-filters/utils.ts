import { type Participant } from "../../../types/types";
import { type FilterGroup, type FilterGroups } from "./types";

// Helper function to capitalize first letter
export const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_]/g, " ");

// Function to generate dynamic filter options from actual data
export function generateDynamicFilterOptions(
  participants: Participant[] = []
): FilterGroups {
  // Helper function to create options from participant data
  const createDynamicOptions = (
    key: keyof Participant,
    label: string,
    transform?: (value: string) => string
  ): FilterGroup => {
    const uniqueValues = participants
      .map(p => p[key])
      .filter(
        (value, index, arr) =>
          value &&
          value !== "all" &&
          typeof value === "string" &&
          arr.indexOf(value) === index
      )
      .sort();

    return {
      key,
      label,
      values: [
        { value: "all", label: "All" },
        ...uniqueValues.map(value => ({
          value: value as string,
          label: transform
            ? transform(value as string)
            : capitalizeFirst(value as string),
        })),
      ],
    };
  };

  // Core demographic filters - STATIC options that should never disappear
  const sexOptions = {
    key: "sex",
    label: "Gender",
    values: [
      { value: "all", label: "All" },
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
  };

  const ageGroupOptions = {
    key: "ageGroup",
    label: "Age",
    values: [
      { value: "all", label: "All Ages" },
      { value: "young", label: "Youth (15-35)" },
      { value: "adult", label: "Adults (36-59)" },
      { value: "older", label: "Elderly (60+)" },
    ],
  };

  // Education Level - STATIC options
  const educationLevelOptions = {
    key: "educationLevel",
    label: "Education",
    values: [
      { value: "all", label: "All Levels" },
      { value: "none", label: "No Formal Education" },
      { value: "primary", label: "Primary" },
      { value: "secondary", label: "Secondary" },
      { value: "tertiary", label: "Tertiary" },
      { value: "university", label: "University" },
    ],
  };

  // Marital Status - STATIC options
  const maritalStatusOptions = {
    key: "maritalStatus",
    label: "Marital Status",
    values: [
      { value: "all", label: "All Statuses" },
      { value: "single", label: "Single" },
      { value: "married", label: "Married" },
      { value: "divorced", label: "Divorced" },
      { value: "widowed", label: "Widowed" },
    ],
  };

  // Employment and enterprise filters - Use static options for common ones
  const employmentStatusOptions = {
    key: "employmentStatus",
    label: "Employment Status",
    values: [
      { value: "all", label: "All" },
      { value: "employed", label: "Employed" },
      { value: "unemployed", label: "Unemployed" },
      { value: "self-employed", label: "Self-Employed" },
      { value: "student", label: "Student" },
    ],
  };

  // Keep dynamic options for sector-specific filters (these can be dynamic as they're less critical)
  const employmentSectorOptions = createDynamicOptions(
    "employmentSector",
    "Employment Sector"
  );
  const enterpriseSectorOptions = createDynamicOptions(
    "enterpriseSector",
    "Enterprise Sector"
  );
  const businessScaleOptions = createDynamicOptions(
    "businessScale",
    "Business Scale"
  );

  // Skills filters
  const vocationalSkillsOptions = {
    key: "hasVocationalSkills",
    label: "Vocational Skills",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Has Skills" },
      { value: "no", label: "No Skills" },
    ],
  };

  const softSkillsOptions = {
    key: "hasSoftSkills",
    label: "Soft Skills",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Has Skills" },
      { value: "no", label: "No Skills" },
    ],
  };

  const businessSkillsOptions = {
    key: "hasBusinessSkills",
    label: "Business Skills",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Has Skills" },
      { value: "no", label: "No Skills" },
    ],
  };

  // Education and demographics - use the static options we defined above
  const sourceOfIncomeOptions = createDynamicOptions(
    "sourceOfIncome",
    "Income Source"
  );
  const populationSegmentOptions = createDynamicOptions(
    "populationSegment",
    "Population Segment"
  );

  // VSLA and enterprise ownership
  const vslaOptions = {
    key: "isSubscribedToVSLA",
    label: "VSLA",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Member" },
      { value: "no", label: "Non-Member" },
    ],
  };

  const enterpriseOwnershipOptions = {
    key: "ownsEnterprise",
    label: "Enterprise Owner",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Owns Enterprise" },
      { value: "no", label: "No Enterprise" },
    ],
  };

  // Special demographic filters
  const pwdOptions = {
    key: "isPWD",
    label: "PWD",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "PWD" },
      { value: "no", label: "Non-PWD" },
    ],
  };

  const studentOptions = {
    key: "isActiveStudent",
    label: "Student",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Student" },
      { value: "no", label: "Non-Student" },
    ],
  };

  const teenMotherOptions = {
    key: "isTeenMother",
    label: "Teen Mother",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Teen Mother" },
      { value: "no", label: "Not Teen Mother" },
    ],
  };

  // Return organized filter groups with static demographic options
  return {
    quick: [sexOptions, ageGroupOptions, employmentStatusOptions, vslaOptions],

    enterprise: [
      enterpriseOwnershipOptions,
      enterpriseSectorOptions,
      businessScaleOptions,
      sourceOfIncomeOptions,
    ].filter(option => option.values.length > 1),

    skills: [
      vocationalSkillsOptions,
      softSkillsOptions,
      businessSkillsOptions,
      studentOptions,
    ],

    demographics: [
      educationLevelOptions,
      maritalStatusOptions,
      populationSegmentOptions,
      pwdOptions,
      teenMotherOptions,
    ],

    employment: [employmentStatusOptions, employmentSectorOptions].filter(
      option => option.values.length > 1
    ),
  };
}
