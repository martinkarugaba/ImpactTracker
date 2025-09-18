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

  // Core demographic filters
  const sexOptions = createDynamicOptions("sex", "Gender", value =>
    value === "male"
      ? "Male"
      : value === "female"
        ? "Female"
        : capitalizeFirst(value)
  );

  const hasAgeData = participants.some(p => p.age || p.dateOfBirth);
  const ageGroupOptions = hasAgeData
    ? {
        key: "ageGroup",
        label: "Age",
        values: [
          { value: "all", label: "All Ages" },
          { value: "young", label: "Youth (15-35)" },
          { value: "adult", label: "Adults (36-59)" },
          { value: "older", label: "Elderly (60+)" },
        ],
      }
    : null;

  // Employment and enterprise filters
  const employmentTypeOptions = createDynamicOptions(
    "employmentType",
    "Employment Type"
  );

  // Add fallback options for employment type if no data exists
  if (employmentTypeOptions.values.length <= 1) {
    employmentTypeOptions.values = [
      { value: "all", label: "All" },
      { value: "formal", label: "Formal Employment" },
      { value: "informal", label: "Informal Employment" },
      { value: "self-employed", label: "Self-Employed" },
      { value: "unemployed", label: "Unemployed" },
    ];
  }

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

  // Education and demographics
  const educationLevelOptions = createDynamicOptions(
    "educationLevel",
    "Education"
  );
  const maritalStatusOptions = createDynamicOptions(
    "maritalStatus",
    "Marital Status"
  );
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

  // Return organized filter groups
  return {
    quick: [sexOptions, ageGroupOptions, employmentTypeOptions, vslaOptions]
      .filter(Boolean)
      .filter((item): item is NonNullable<typeof item> => item !== null),

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
    ].filter(option => option.values.length > 1),

    employment: [employmentTypeOptions, employmentSectorOptions].filter(
      option => option.values.length > 1
    ),
  };
}
