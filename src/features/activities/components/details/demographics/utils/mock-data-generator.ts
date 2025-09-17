import { ActivityParticipant } from "../../../../types/types";
import { DemographicsData } from "../types/demographics";

// Mock data generator for demonstration (to be replaced with real data when database fields are added)
export const generateMockDemographicsData = (
  totalParticipants: number,
  _participants: ActivityParticipant[]
): DemographicsData => {
  // Calculate actual demographics from participant data
  // Note: Since demographic fields (sex, age, isPWD) are not available in the current
  // ActivityParticipant type, we'll generate realistic mock data based on total participants

  // Mock gender distribution (approximately 60% female, 40% male - typical for development programs)
  const males = Math.floor(totalParticipants * 0.4);
  const females = totalParticipants - males;

  // Mock age calculations (approximately 70% youth 15-35, 30% above 35)
  const participants15to35 = Math.floor(totalParticipants * 0.7);
  const participantsAbove35 = totalParticipants - participants15to35;

  const males15to35 = Math.floor(males * 0.7);
  const malesAbove35 = males - males15to35;

  const females15to35 = Math.floor(females * 0.7);
  const femalesAbove35 = females - females15to35;

  // Mock PWD calculations (approximately 10% PWD representation)
  const pwdParticipants = Math.floor(totalParticipants * 0.1);
  const malePWDs = Math.floor(pwdParticipants * 0.45); // Slightly fewer male PWDs
  const femalePWDs = pwdParticipants - malePWDs;

  // Location-based calculations (mock - would need location classification)
  const urbanParticipants = Math.floor(totalParticipants * 0.4); // 40% urban estimate
  const ruralParticipants = totalParticipants - urbanParticipants;

  // Mock employment data (to be replaced with real data)
  return {
    totalParticipants,
    trainingType: "Skills Development Training", // Would come from activity type

    participantsUrban: urbanParticipants,
    participantsRural: ruralParticipants,
    participants15to35,
    participantsAbove35,
    maleParticipants: males,
    males15to35,
    malesAbove35,
    femaleParticipants: females,
    females15to35,
    femalesAbove35,

    participantsWithDisability: pwdParticipants,
    disabilityTypes: ["Visual", "Hearing", "Physical", "Mental"], // Mock data
    femalePWDs,
    malePWDs,

    youthsInWork: Math.floor(participants15to35 * 0.6),
    youthsInWorkUrban: Math.floor(participants15to35 * 0.6 * 0.4),
    youthsInWorkRural: Math.floor(participants15to35 * 0.6 * 0.6),

    // Mock wage employment data
    totalWageEmployment: Math.floor(totalParticipants * 0.3),
    wageEmploymentMale: Math.floor(males * 0.35),
    wageEmploymentMale15to35: Math.floor(males15to35 * 0.4),
    wageEmploymentMaleAbove35: Math.floor(malesAbove35 * 0.25),
    wageEmploymentFemale: Math.floor(females * 0.25),
    wageEmploymentFemale15to35: Math.floor(females15to35 * 0.3),
    wageEmploymentFemaleAbove35: Math.floor(femalesAbove35 * 0.2),
    wageEmploymentUrban: Math.floor(urbanParticipants * 0.5),
    wageEmploymentRural: Math.floor(ruralParticipants * 0.2),
    wageEmploymentPWDs: Math.floor(pwdParticipants * 0.15),
    wageEmploymentFemalePWDs: Math.floor(femalePWDs * 0.1),
    wageEmploymentMalePWDs: Math.floor(malePWDs * 0.2),
    employmentSectors: [
      {
        sector: "Petty Trade",
        total: 15,
        newJobs: 8,
        sustainedJobs: 5,
        improvedJobs: 2,
      },
      {
        sector: "Food & Drinks",
        total: 12,
        newJobs: 6,
        sustainedJobs: 4,
        improvedJobs: 2,
      },
      {
        sector: "Manufacturing",
        total: 8,
        newJobs: 3,
        sustainedJobs: 3,
        improvedJobs: 2,
      },
      {
        sector: "Agribusiness",
        total: 20,
        newJobs: 12,
        sustainedJobs: 6,
        improvedJobs: 2,
      },
    ],
    employmentScale: {
      micro: Math.floor(totalParticipants * 0.2),
      small: Math.floor(totalParticipants * 0.15),
      medium: Math.floor(totalParticipants * 0.08),
      large: Math.floor(totalParticipants * 0.02),
    },

    // Mock self-employment data
    totalSelfEmployment: Math.floor(totalParticipants * 0.4),
    selfEmploymentMale: Math.floor(males * 0.45),
    selfEmploymentMale15to35: Math.floor(males15to35 * 0.5),
    selfEmploymentMaleAbove35: Math.floor(malesAbove35 * 0.4),
    selfEmploymentFemale: Math.floor(females * 0.35),
    selfEmploymentFemale15to35: Math.floor(females15to35 * 0.4),
    selfEmploymentFemaleAbove35: Math.floor(femalesAbove35 * 0.3),
    selfEmploymentUrban: Math.floor(urbanParticipants * 0.3),
    selfEmploymentRural: Math.floor(ruralParticipants * 0.5),
    selfEmploymentPWDs: Math.floor(pwdParticipants * 0.25),
    selfEmploymentFemalePWDs: Math.floor(femalePWDs * 0.2),
    selfEmploymentMalePWDs: Math.floor(malePWDs * 0.3),
    selfEmploymentSectors: [
      {
        sector: "Petty Trade",
        total: 25,
        newBusinesses: 15,
        sustainedBusinesses: 8,
        improvedBusinesses: 2,
      },
      {
        sector: "Food & Drinks",
        total: 18,
        newBusinesses: 10,
        sustainedBusinesses: 6,
        improvedBusinesses: 2,
      },
      {
        sector: "Agriculture",
        total: 30,
        newBusinesses: 20,
        sustainedBusinesses: 8,
        improvedBusinesses: 2,
      },
      {
        sector: "Crafts",
        total: 12,
        newBusinesses: 8,
        sustainedBusinesses: 3,
        improvedBusinesses: 1,
      },
    ],
    accessedLoans: Math.floor(totalParticipants * 0.25),
    individualSaving: Math.floor(totalParticipants * 0.6),
    groupSaving: Math.floor(totalParticipants * 0.4),
    businessScale: {
      micro: Math.floor(totalParticipants * 0.3),
      small: Math.floor(totalParticipants * 0.2),
      medium: Math.floor(totalParticipants * 0.1),
      large: Math.floor(totalParticipants * 0.03),
    },

    // Mock secondary employment data
    totalSecondaryEmployment: Math.floor(totalParticipants * 0.15),
    secondaryEmploymentMale: Math.floor(males * 0.18),
    secondaryEmploymentMale15to35: Math.floor(males15to35 * 0.2),
    secondaryEmploymentMaleAbove35: Math.floor(malesAbove35 * 0.15),
    secondaryEmploymentFemale: Math.floor(females * 0.12),
    secondaryEmploymentFemale15to35: Math.floor(females15to35 * 0.15),
    secondaryEmploymentFemaleAbove35: Math.floor(femalesAbove35 * 0.1),
    secondaryEmploymentUrban: Math.floor(urbanParticipants * 0.2),
    secondaryEmploymentRural: Math.floor(ruralParticipants * 0.1),
    secondaryEmploymentPWDs: Math.floor(pwdParticipants * 0.1),
    secondaryEmploymentFemalePWDs: Math.floor(femalePWDs * 0.08),
    secondaryEmploymentMalePWDs: Math.floor(malePWDs * 0.12),
    secondaryEmploymentSectors: [
      {
        sector: "Retail",
        total: 8,
        newJobs: 4,
        sustainedJobs: 3,
        improvedJobs: 1,
      },
      {
        sector: "Services",
        total: 6,
        newJobs: 3,
        sustainedJobs: 2,
        improvedJobs: 1,
      },
      {
        sector: "Transport",
        total: 4,
        newJobs: 2,
        sustainedJobs: 2,
        improvedJobs: 0,
      },
    ],
    secondaryBusinessScale: {
      micro: Math.floor(totalParticipants * 0.1),
      small: Math.floor(totalParticipants * 0.05),
      medium: Math.floor(totalParticipants * 0.02),
      large: Math.floor(totalParticipants * 0.01),
    },
  };
};
