// Demographics interfaces (to be extended when database fields are added)
export interface DemographicsData {
  // Basic demographics
  totalParticipants: number;
  trainingType: string;

  // Age & Gender demographics (current available data)
  participantsUrban: number; // To be calculated based on location
  participantsRural: number; // To be calculated based on location
  participants15to35: number;
  participantsAbove35: number;
  maleParticipants: number;
  males15to35: number;
  malesAbove35: number;
  femaleParticipants: number;
  females15to35: number;
  femalesAbove35: number;

  // PWD demographics (current available data)
  participantsWithDisability: number;
  disabilityTypes: string[]; // To be added to database
  femalePWDs: number;
  malePWDs: number;

  // Employment demographics (to be extended)
  youthsInWork: number;
  youthsInWorkUrban: number;
  youthsInWorkRural: number;

  // Wage employment (to be added to database)
  totalWageEmployment: number;
  wageEmploymentMale: number;
  wageEmploymentMale15to35: number;
  wageEmploymentMaleAbove35: number;
  wageEmploymentFemale: number;
  wageEmploymentFemale15to35: number;
  wageEmploymentFemaleAbove35: number;
  wageEmploymentUrban: number;
  wageEmploymentRural: number;
  wageEmploymentPWDs: number;
  wageEmploymentFemalePWDs: number;
  wageEmploymentMalePWDs: number;
  employmentSectors: Array<{
    sector: string;
    total: number;
    newJobs: number;
    sustainedJobs: number;
    improvedJobs: number;
  }>;
  employmentScale: {
    micro: number;
    small: number;
    medium: number;
    large: number;
  };

  // Self-employment (to be added to database)
  totalSelfEmployment: number;
  selfEmploymentMale: number;
  selfEmploymentMale15to35: number;
  selfEmploymentMaleAbove35: number;
  selfEmploymentFemale: number;
  selfEmploymentFemale15to35: number;
  selfEmploymentFemaleAbove35: number;
  selfEmploymentUrban: number;
  selfEmploymentRural: number;
  selfEmploymentPWDs: number;
  selfEmploymentFemalePWDs: number;
  selfEmploymentMalePWDs: number;
  selfEmploymentSectors: Array<{
    sector: string;
    total: number;
    newBusinesses: number;
    sustainedBusinesses: number;
    improvedBusinesses: number;
  }>;
  accessedLoans: number;
  individualSaving: number;
  groupSaving: number;
  businessScale: {
    micro: number;
    small: number;
    medium: number;
    large: number;
  };

  // Secondary employment (to be added to database)
  totalSecondaryEmployment: number;
  secondaryEmploymentMale: number;
  secondaryEmploymentMale15to35: number;
  secondaryEmploymentMaleAbove35: number;
  secondaryEmploymentFemale: number;
  secondaryEmploymentFemale15to35: number;
  secondaryEmploymentFemaleAbove35: number;
  secondaryEmploymentUrban: number;
  secondaryEmploymentRural: number;
  secondaryEmploymentPWDs: number;
  secondaryEmploymentFemalePWDs: number;
  secondaryEmploymentMalePWDs: number;
  secondaryEmploymentSectors: Array<{
    sector: string;
    total: number;
    newJobs: number;
    sustainedJobs: number;
    improvedJobs: number;
  }>;
  secondaryBusinessScale: {
    micro: number;
    small: number;
    medium: number;
    large: number;
  };
}

export interface DemographicsProps {
  data: DemographicsData;
}
