/* eslint-disable */
// @ts-nocheck
import {
  pgTable,
  unique,
  uuid,
  text,
  timestamp,
  foreignKey,
  integer,
  date,
  time,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "super_admin",
  "cluster_manager",
  "organization_admin",
  "organization_member",
  "user",
]);

export const countries = pgTable(
  "countries",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [unique("countries_code_unique").on(table.code)]
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    acronym: text().notNull(),
    clusterId: uuid("cluster_id"),
    projectId: uuid("project_id"),
    country: text().notNull(),
    district: text().notNull(),
    parish: text().notNull(),
    village: text().notNull(),
    address: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    subCountyId: text("sub_county_id").notNull(),
    operationSubCounties: text("operation_sub_counties")
      .array()
      .default([""])
      .notNull(),
    municipalityId: uuid("municipality_id"),
    cityId: uuid("city_id"),
    wardId: uuid("ward_id"),
    divisionId: uuid("division_id"),
    cellId: uuid("cell_id"),
  },
  table => [
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "organizations_cluster_id_clusters_id_fk",
    }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "organizations_project_id_projects_id_fk",
    }),
    foreignKey({
      columns: [table.municipalityId],
      foreignColumns: [municipalities.id],
      name: "organizations_municipality_id_municipalities_id_fk",
    }),
    foreignKey({
      columns: [table.cityId],
      foreignColumns: [cities.id],
      name: "organizations_city_id_cities_id_fk",
    }),
    foreignKey({
      columns: [table.wardId],
      foreignColumns: [wards.id],
      name: "organizations_ward_id_wards_id_fk",
    }),
    foreignKey({
      columns: [table.divisionId],
      foreignColumns: [divisions.id],
      name: "organizations_division_id_divisions_id_fk",
    }),
    foreignKey({
      columns: [table.cellId],
      foreignColumns: [cells.id],
      name: "organizations_cell_id_cells_id_fk",
    }),
  ]
);

export const kpis = pgTable(
  "kpis",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    target: integer().notNull(),
    unit: text().notNull(),
    frequency: text().notNull(),
    organizationId: uuid("organization_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "kpis_organization_id_organizations_id_fk",
    }),
  ]
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    organizationId: uuid("organization_id").notNull(),
    userId: text("user_id").notNull(),
    role: userRole().default("organization_member").notNull(),
    lastAccessed: timestamp("last_accessed", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "organization_members_organization_id_organizations_id_fk",
    }),
  ]
);

export const parishes = pgTable(
  "parishes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    subCountyId: uuid("sub_county_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    districtId: uuid("district_id").notNull(),
    countyId: uuid("county_id").notNull(),
    countryId: uuid("country_id").notNull(),
  },
  table => [
    foreignKey({
      columns: [table.subCountyId],
      foreignColumns: [subcounties.id],
      name: "parishes_sub_county_id_subcounties_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "parishes_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.countyId],
      foreignColumns: [counties.id],
      name: "parishes_county_id_counties_id_fk",
    }),
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "parishes_country_id_countries_id_fk",
    }),
    unique("parishes_code_unique").on(table.code),
  ]
);

export const clusterUsers = pgTable(
  "cluster_users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clusterId: uuid("cluster_id").notNull(),
    userId: text("user_id").notNull(),
    role: userRole().default("cluster_manager").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "cluster_users_cluster_id_clusters_id_fk",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "cluster_users_user_id_users_id_fk",
    }),
  ]
);

export const districts = pgTable(
  "districts",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    countryId: uuid("country_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    region: text(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "districts_country_id_countries_id_fk",
    }),
    unique("districts_code_unique").on(table.code),
  ]
);

export const clusters = pgTable("clusters", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  about: text(),
  country: text().notNull(),
  districts: text().array().default([""]).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const participants = pgTable(
  "participants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    country: text().notNull(),
    district: text().notNull(),
    subCounty: text("sub_county").notNull(),
    parish: text().notNull(),
    village: text().notNull(),
    sex: text().notNull(),
    age: integer(),
    isPwd: text("is_pwd").default("no").notNull(),
    isMother: text("is_mother").default("no").notNull(),
    isRefugee: text("is_refugee").default("no").notNull(),
    designation: text().notNull(),
    enterprise: text().notNull(),
    contact: text().notNull(),
    isPermanentResident: text("is_permanent_resident").default("no").notNull(),
    areParentsAlive: text("are_parents_alive").default("no").notNull(),
    numberOfChildren: integer("number_of_children").default(0).notNull(),
    employmentStatus: text("employment_status").default("unemployed").notNull(),
    monthlyIncome: integer("monthly_income").default(0).notNull(),
    mainChallenge: text("main_challenge"),
    skillOfInterest: text("skill_of_interest"),
    expectedImpact: text("expected_impact"),
    isWillingToParticipate: text("is_willing_to_participate")
      .default("yes")
      .notNull(),
    organizationId: uuid("organization_id").notNull(),
    clusterId: uuid("cluster_id").notNull(),
    projectId: uuid("project_id").notNull(),
    noOfTrainings: integer("no_of_trainings").default(0).notNull(),
    isActive: text("is_active").default("yes").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    dateOfBirth: timestamp("date_of_birth", { mode: "string" }),
    disabilityType: text("disability_type"),
    wageEmploymentStatus: text("wage_employment_status"),
    wageEmploymentSector: text("wage_employment_sector"),
    wageEmploymentScale: text("wage_employment_scale"),
    selfEmploymentStatus: text("self_employment_status"),
    selfEmploymentSector: text("self_employment_sector"),
    businessScale: text("business_scale"),
    secondaryEmploymentStatus: text("secondary_employment_status"),
    secondaryEmploymentSector: text("secondary_employment_sector"),
    secondaryBusinessScale: text("secondary_business_scale"),
    accessedLoans: text("accessed_loans").default("no").notNull(),
    individualSaving: text("individual_saving").default("no").notNull(),
    groupSaving: text("group_saving").default("no").notNull(),
    locationSetting: text("location_setting"),
    maritalStatus: text("marital_status"),
    educationLevel: text("education_level"),
    sourceOfIncome: text("source_of_income"),
    nationality: text().default("Ugandan").notNull(),
    populationSegment: text("population_segment"),
    refugeeLocation: text("refugee_location"),
    isActiveStudent: text("is_active_student").default("no").notNull(),
    isSubscribedToVsla: text("is_subscribed_to_vsla").default("no").notNull(),
    vslaName: text("vsla_name"),
    isTeenMother: text("is_teen_mother").default("no").notNull(),
    ownsEnterprise: text("owns_enterprise").default("no").notNull(),
    enterpriseName: text("enterprise_name"),
    enterpriseSector: text("enterprise_sector"),
    enterpriseSize: text("enterprise_size"),
    enterpriseYouthMale: integer("enterprise_youth_male").default(0),
    enterpriseYouthFemale: integer("enterprise_youth_female").default(0),
    enterpriseAdults: integer("enterprise_adults").default(0),
    hasVocationalSkills: text("has_vocational_skills").default("no").notNull(),
    vocationalSkillsParticipations: text("vocational_skills_participations"),
    vocationalSkillsCompletions: text("vocational_skills_completions"),
    vocationalSkillsCertifications: text("vocational_skills_certifications"),
    hasSoftSkills: text("has_soft_skills").default("no").notNull(),
    softSkillsParticipations: text("soft_skills_participations"),
    softSkillsCompletions: text("soft_skills_completions"),
    softSkillsCertifications: text("soft_skills_certifications"),
    hasBusinessSkills: text("has_business_skills").default("no").notNull(),
    employmentType: text("employment_type"),
    employmentSector: text("employment_sector"),
    countryId: uuid("country_id"),
    districtId: uuid("district_id"),
    subcountyId: uuid("subcounty_id"),
    parishId: uuid("parish_id"),
    villageId: uuid("village_id"),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "participants_organization_id_organizations_id_fk",
    }),
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "participants_cluster_id_clusters_id_fk",
    }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "participants_project_id_projects_id_fk",
    }),
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "participants_country_id_countries_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "participants_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.subcountyId],
      foreignColumns: [subcounties.id],
      name: "participants_subcounty_id_subcounties_id_fk",
    }),
    foreignKey({
      columns: [table.parishId],
      foreignColumns: [parishes.id],
      name: "participants_parish_id_parishes_id_fk",
    }),
    foreignKey({
      columns: [table.villageId],
      foreignColumns: [villages.id],
      name: "participants_village_id_villages_id_fk",
    }),
  ]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    token: text().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "password_reset_tokens_user_id_users_id_fk",
    }).onDelete("cascade"),
  ]
);

export const projects = pgTable("projects", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  acronym: text().notNull(),
  description: text(),
  status: text().default("active").notNull(),
  startDate: timestamp("start_date", { mode: "string" }),
  endDate: timestamp("end_date", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: text().primaryKey().notNull(),
    name: text(),
    email: text().notNull(),
    password: text(),
    role: userRole().default("user").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  table => [unique("users_email_unique").on(table.email)]
);

export const villages = pgTable(
  "villages",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    parishId: uuid("parish_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    subCountyId: uuid("sub_county_id").notNull(),
    districtId: uuid("district_id").notNull(),
    countyId: uuid("county_id").notNull(),
    countryId: uuid("country_id").notNull(),
  },
  table => [
    foreignKey({
      columns: [table.parishId],
      foreignColumns: [parishes.id],
      name: "villages_parish_id_parishes_id_fk",
    }),
    foreignKey({
      columns: [table.subCountyId],
      foreignColumns: [subcounties.id],
      name: "villages_sub_county_id_subcounties_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "villages_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.countyId],
      foreignColumns: [counties.id],
      name: "villages_county_id_counties_id_fk",
    }),
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "villages_country_id_countries_id_fk",
    }),
    unique("villages_code_unique").on(table.code),
  ]
);

export const clusterMembers = pgTable(
  "cluster_members",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clusterId: uuid("cluster_id").notNull(),
    organizationId: uuid("organization_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "cluster_members_cluster_id_clusters_id_fk",
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "cluster_members_organization_id_organizations_id_fk",
    }),
  ]
);

export const cells = pgTable(
  "cells",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    countryId: uuid("country_id").notNull(),
    districtId: uuid("district_id").notNull(),
    countyId: uuid("county_id").notNull(),
    subCountyId: uuid("sub_county_id").notNull(),
    municipalityId: uuid("municipality_id"),
    cityId: uuid("city_id"),
    wardId: uuid("ward_id"),
    divisionId: uuid("division_id"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "cells_country_id_countries_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "cells_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.countyId],
      foreignColumns: [counties.id],
      name: "cells_county_id_counties_id_fk",
    }),
    foreignKey({
      columns: [table.subCountyId],
      foreignColumns: [subcounties.id],
      name: "cells_sub_county_id_subcounties_id_fk",
    }),
    foreignKey({
      columns: [table.municipalityId],
      foreignColumns: [municipalities.id],
      name: "cells_municipality_id_municipalities_id_fk",
    }),
    foreignKey({
      columns: [table.cityId],
      foreignColumns: [cities.id],
      name: "cells_city_id_cities_id_fk",
    }),
    foreignKey({
      columns: [table.wardId],
      foreignColumns: [wards.id],
      name: "cells_ward_id_wards_id_fk",
    }),
    foreignKey({
      columns: [table.divisionId],
      foreignColumns: [divisions.id],
      name: "cells_division_id_divisions_id_fk",
    }),
    unique("cells_code_unique").on(table.code),
  ]
);

export const trainings = pgTable(
  "trainings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    conceptNote: text("concept_note"),
    activityReport: text("activity_report"),
    trainingDate: timestamp("training_date", { mode: "string" }).notNull(),
    venue: text().notNull(),
    status: text().default("pending").notNull(),
    numberOfParticipants: integer("number_of_participants")
      .default(0)
      .notNull(),
    budget: integer(),
    organizationId: uuid("organization_id").notNull(),
    clusterId: uuid("cluster_id").notNull(),
    projectId: uuid("project_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "trainings_organization_id_organizations_id_fk",
    }),
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "trainings_cluster_id_clusters_id_fk",
    }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "trainings_project_id_projects_id_fk",
    }),
  ]
);

export const trainingParticipants = pgTable(
  "training_participants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    trainingId: uuid("training_id").notNull(),
    participantId: uuid("participant_id").notNull(),
    attendanceStatus: text("attendance_status").default("pending").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.trainingId],
      foreignColumns: [trainings.id],
      name: "training_participants_training_id_trainings_id_fk",
    }),
    foreignKey({
      columns: [table.participantId],
      foreignColumns: [participants.id],
      name: "training_participants_participant_id_participants_id_fk",
    }),
  ]
);

export const activities = pgTable(
  "activities",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: text().notNull(),
    description: text(),
    type: text().notNull(),
    status: text().default("planned").notNull(),
    startDate: timestamp("start_date", { mode: "string" }).notNull(),
    endDate: timestamp("end_date", { mode: "string" }),
    venue: text().notNull(),
    budget: integer(),
    actualCost: integer("actual_cost"),
    numberOfParticipants: integer("number_of_participants").default(0),
    objectives: text().array().default([""]),
    outcomes: text(),
    challenges: text(),
    recommendations: text(),
    attachments: text().array().default([""]),
    organizationId: uuid("organization_id").notNull(),
    clusterId: uuid("cluster_id"),
    projectId: uuid("project_id"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "activities_organization_id_organizations_id_fk",
    }),
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "activities_cluster_id_clusters_id_fk",
    }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "activities_project_id_projects_id_fk",
    }),
  ]
);

export const activityParticipants = pgTable(
  "activity_participants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    activityId: uuid("activity_id").notNull(),
    participantId: uuid("participant_id").notNull(),
    attendanceStatus: text("attendance_status").default("invited").notNull(),
    role: text().default("participant"),
    feedback: text(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.activityId],
      foreignColumns: [activities.id],
      name: "activity_participants_activity_id_activities_id_fk",
    }),
    foreignKey({
      columns: [table.participantId],
      foreignColumns: [participants.id],
      name: "activity_participants_participant_id_participants_id_fk",
    }),
  ]
);

export const conceptNotes = pgTable(
  "concept_notes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    activityId: uuid("activity_id").notNull(),
    content: text().notNull(),
    title: text().notNull(),
    chargeCode: text("charge_code"),
    activityLead: text("activity_lead"),
    submissionDate: timestamp("submission_date", { mode: "string" }),
    projectSummary: text("project_summary"),
    methodology: text(),
    requirements: text(),
    participantDetails: text("participant_details"),
    budgetItems: text("budget_items").array().default([""]),
    budgetNotes: text("budget_notes"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.activityId],
      foreignColumns: [activities.id],
      name: "concept_notes_activity_id_activities_id_fk",
    }),
  ]
);

export const activityReports = pgTable(
  "activity_reports",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    activityId: uuid("activity_id").notNull(),
    title: text().notNull(),
    executionDate: timestamp("execution_date", { mode: "string" }).notNull(),
    clusterName: text("cluster_name").notNull(),
    venue: text().notNull(),
    teamLeader: text("team_leader").notNull(),
    backgroundPurpose: text("background_purpose").notNull(),
    progressAchievements: text("progress_achievements").notNull(),
    challengesRecommendations: text("challenges_recommendations").notNull(),
    lessonsLearned: text("lessons_learned").notNull(),
    followUpActions: text("follow_up_actions").array().default([""]),
    actualCost: integer("actual_cost"),
    numberOfParticipants: integer("number_of_participants"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.activityId],
      foreignColumns: [activities.id],
      name: "activity_reports_activity_id_activities_id_fk",
    }),
  ]
);

export const municipalities = pgTable(
  "municipalities",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    countryId: uuid("country_id").notNull(),
    districtId: uuid("district_id").notNull(),
    countyId: uuid("county_id").notNull(),
    subCountyId: uuid("sub_county_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "municipalities_country_id_countries_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "municipalities_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.countyId],
      foreignColumns: [counties.id],
      name: "municipalities_county_id_counties_id_fk",
    }),
    foreignKey({
      columns: [table.subCountyId],
      foreignColumns: [subcounties.id],
      name: "municipalities_sub_county_id_subcounties_id_fk",
    }),
    unique("municipalities_code_unique").on(table.code),
  ]
);

export const counties = pgTable(
  "counties",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    countryId: uuid("country_id").notNull(),
    districtId: uuid("district_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "counties_country_id_countries_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "counties_district_id_districts_id_fk",
    }),
    unique("counties_code_unique").on(table.code),
  ]
);

export const subcounties = pgTable(
  "subcounties",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    countryId: uuid("country_id").notNull(),
    districtId: uuid("district_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    countyId: uuid("county_id").notNull(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "subcounties_country_id_countries_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "subcounties_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.countyId],
      foreignColumns: [counties.id],
      name: "subcounties_county_id_counties_id_fk",
    }),
    unique("subcounties_code_unique").on(table.code),
  ]
);

export const divisions = pgTable(
  "divisions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    countryId: uuid("country_id").notNull(),
    districtId: uuid("district_id").notNull(),
    countyId: uuid("county_id").notNull(),
    subCountyId: uuid("sub_county_id").notNull(),
    municipalityId: uuid("municipality_id"),
    cityId: uuid("city_id"),
    wardId: uuid("ward_id"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "divisions_country_id_countries_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "divisions_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.countyId],
      foreignColumns: [counties.id],
      name: "divisions_county_id_counties_id_fk",
    }),
    foreignKey({
      columns: [table.subCountyId],
      foreignColumns: [subcounties.id],
      name: "divisions_sub_county_id_subcounties_id_fk",
    }),
    foreignKey({
      columns: [table.municipalityId],
      foreignColumns: [municipalities.id],
      name: "divisions_municipality_id_municipalities_id_fk",
    }),
    foreignKey({
      columns: [table.cityId],
      foreignColumns: [cities.id],
      name: "divisions_city_id_cities_id_fk",
    }),
    foreignKey({
      columns: [table.wardId],
      foreignColumns: [wards.id],
      name: "divisions_ward_id_wards_id_fk",
    }),
    unique("divisions_code_unique").on(table.code),
  ]
);

export const cities = pgTable(
  "cities",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    countryId: uuid("country_id").notNull(),
    districtId: uuid("district_id").notNull(),
    countyId: uuid("county_id").notNull(),
    subCountyId: uuid("sub_county_id").notNull(),
    municipalityId: uuid("municipality_id"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "cities_country_id_countries_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "cities_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.countyId],
      foreignColumns: [counties.id],
      name: "cities_county_id_counties_id_fk",
    }),
    foreignKey({
      columns: [table.subCountyId],
      foreignColumns: [subcounties.id],
      name: "cities_sub_county_id_subcounties_id_fk",
    }),
    foreignKey({
      columns: [table.municipalityId],
      foreignColumns: [municipalities.id],
      name: "cities_municipality_id_municipalities_id_fk",
    }),
    unique("cities_code_unique").on(table.code),
  ]
);

export const wards = pgTable(
  "wards",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    countryId: uuid("country_id").notNull(),
    districtId: uuid("district_id").notNull(),
    countyId: uuid("county_id").notNull(),
    subCountyId: uuid("sub_county_id").notNull(),
    municipalityId: uuid("municipality_id"),
    cityId: uuid("city_id"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "wards_country_id_countries_id_fk",
    }),
    foreignKey({
      columns: [table.districtId],
      foreignColumns: [districts.id],
      name: "wards_district_id_districts_id_fk",
    }),
    foreignKey({
      columns: [table.countyId],
      foreignColumns: [counties.id],
      name: "wards_county_id_counties_id_fk",
    }),
    foreignKey({
      columns: [table.subCountyId],
      foreignColumns: [subcounties.id],
      name: "wards_sub_county_id_subcounties_id_fk",
    }),
    foreignKey({
      columns: [table.municipalityId],
      foreignColumns: [municipalities.id],
      name: "wards_municipality_id_municipalities_id_fk",
    }),
    foreignKey({
      columns: [table.cityId],
      foreignColumns: [cities.id],
      name: "wards_city_id_cities_id_fk",
    }),
    unique("wards_code_unique").on(table.code),
  ]
);

export const vslas = pgTable(
  "vslas",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    description: text(),
    organizationId: uuid("organization_id").notNull(),
    clusterId: uuid("cluster_id").notNull(),
    projectId: uuid("project_id").notNull(),
    country: text().notNull(),
    district: text().notNull(),
    subCounty: text("sub_county").notNull(),
    parish: text().notNull(),
    village: text().notNull(),
    address: text(),
    totalMembers: integer("total_members").default(0).notNull(),
    totalSavings: integer("total_savings").default(0).notNull(),
    totalLoans: integer("total_loans").default(0).notNull(),
    meetingFrequency: text("meeting_frequency").notNull(),
    meetingDay: text("meeting_day"),
    meetingTime: text("meeting_time"),
    status: text().default("active").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    primaryBusiness: text("primary_business").notNull(),
    primaryBusinessOther: text("primary_business_other"),
    region: text(),
    county: text(),
    meetingLocation: text("meeting_location"),
    formationDate: timestamp("formation_date", { mode: "string" }).notNull(),
    closingDate: timestamp("closing_date", { mode: "string" }),
    lc1ChairpersonName: text("lc1_chairperson_name"),
    lc1ChairpersonContact: text("lc1_chairperson_contact"),
    hasConstitution: text("has_constitution").default("no").notNull(),
    hasSignedConstitution: text("has_signed_constitution")
      .default("no")
      .notNull(),
    bankName: text("bank_name"),
    bankBranch: text("bank_branch"),
    bankAccountNumber: text("bank_account_number"),
    registrationCertificateNumber: text("registration_certificate_number"),
    saccoMember: text("sacco_member").default("no").notNull(),
    notes: text(),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "vslas_organization_id_organizations_id_fk",
    }),
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "vslas_cluster_id_clusters_id_fk",
    }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "vslas_project_id_projects_id_fk",
    }),
    unique("vslas_code_unique").on(table.code),
  ]
);

export const vslaMembers = pgTable(
  "vsla_members",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    vslaId: uuid("vsla_id").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text().notNull(),
    email: text(),
    role: text().default("member").notNull(),
    joinedDate: timestamp("joined_date", { mode: "string" }).notNull(),
    totalSavings: integer("total_savings").default(0).notNull(),
    totalLoans: integer("total_loans").default(0).notNull(),
    status: text().default("active").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.vslaId],
      foreignColumns: [vslas.id],
      name: "vsla_members_vsla_id_vslas_id_fk",
    }),
  ]
);

export const activitySessions = pgTable(
  "activity_sessions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    activityId: uuid("activity_id").notNull(),
    sessionDate: date("session_date").notNull(),
    sessionNumber: integer("session_number").notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    venue: text(),
    notes: text(),
    status: text().default("scheduled").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.activityId],
      foreignColumns: [activities.id],
      name: "activity_sessions_activity_id_activities_id_fk",
    }).onDelete("cascade"),
    unique("unique_activity_session_date").on(
      table.activityId,
      table.sessionDate
    ),
    unique("unique_activity_session_number").on(
      table.activityId,
      table.sessionNumber
    ),
  ]
);

export const dailyAttendance = pgTable(
  "daily_attendance",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    sessionId: uuid("session_id").notNull(),
    participantId: uuid("participant_id").notNull(),
    attendanceStatus: text("attendance_status").default("invited").notNull(),
    checkInTime: timestamp("check_in_time", { mode: "string" }),
    checkOutTime: timestamp("check_out_time", { mode: "string" }),
    notes: text(),
    recordedBy: text("recorded_by"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [activitySessions.id],
      name: "daily_attendance_session_id_activity_sessions_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.participantId],
      foreignColumns: [participants.id],
      name: "daily_attendance_participant_id_participants_id_fk",
    }).onDelete("cascade"),
    unique("unique_session_participant").on(
      table.sessionId,
      table.participantId
    ),
  ]
);
