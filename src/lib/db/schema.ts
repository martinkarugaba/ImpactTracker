import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  date,
  time,
  unique,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  acronym: text("acronym").notNull(),
  cluster_id: uuid("cluster_id").references(() => clusters.id),
  project_id: uuid("project_id").references(() => projects.id),
  country: text("country").notNull(),
  district: text("district").notNull(),
  sub_county_id: text("sub_county_id").notNull(),
  municipality_id: uuid("municipality_id").references(() => municipalities.id),
  city_id: uuid("city_id").references(() => cities.id),
  ward_id: uuid("ward_id").references(() => wards.id),
  division_id: uuid("division_id").references(() => divisions.id),
  cell_id: uuid("cell_id").references(() => cells.id),
  operation_sub_counties: text("operation_sub_counties")
    .array()
    .notNull()
    .default([]),
  parish: text("parish").notNull(),
  village: text("village").notNull(),
  address: text("address").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const clusters = pgTable("clusters", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  about: text("about"),
  country: text("country").notNull(),
  districts: text("districts").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kpis = pgTable("kpis", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  target: integer("target").notNull(),
  unit: text("unit").notNull(),
  frequency: text("frequency").notNull(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  acronym: text("acronym").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRole = pgEnum("user_role", [
  "super_admin",
  "cluster_manager",
  "organization_admin",
  "organization_member",
  "user",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: userRole("role").default("user").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  user_id: text("user_id").notNull(), // Clerk user ID
  role: userRole("role").notNull().default("organization_member"),
  last_accessed: timestamp("last_accessed"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country").notNull(),
  district: text("district").notNull(),
  subCounty: text("sub_county").notNull(),
  parish: text("parish").notNull(),
  village: text("village").notNull(),
  sex: text("sex").notNull(),
  age: integer("age") /* Lines 115-116 omitted */,
  dateOfBirth: timestamp("date_of_birth"),
  isPWD: text("is_pwd").notNull().default("no"),
  disabilityType: text("disability_type"), // New field for type of disability
  isMother: text("is_mother").notNull().default("no"),
  isRefugee: text("is_refugee").notNull().default("no"),
  designation: text("designation").notNull(),
  enterprise: text("enterprise").notNull(),
  contact: text("contact").notNull(),
  isPermanentResident: text("is_permanent_resident").notNull().default("no"),
  areParentsAlive: text("are_parents_alive").notNull().default("no"),
  numberOfChildren: integer("number_of_children").notNull().default(0),
  employmentStatus: text("employment_status").notNull().default("unemployed"),
  monthlyIncome: integer("monthly_income").notNull().default(0),

  // New employment tracking fields
  wageEmploymentStatus: text("wage_employment_status"), // "employed", "new_job", "sustained_job", "improved_job"
  wageEmploymentSector: text("wage_employment_sector"), // "petty_trade", "food_drinks", "manufacturing", "agribusiness", etc.
  wageEmploymentScale: text("wage_employment_scale"), // "micro", "small", "medium", "large"

  selfEmploymentStatus: text("self_employment_status"), // "self_employed", "new_business", "sustained_business", "improved_business"
  selfEmploymentSector: text("self_employment_sector"), // "petty_trade", "food_drinks", "agriculture", "crafts", etc.
  businessScale: text("business_scale"), // "micro", "small", "medium", "large"

  secondaryEmploymentStatus: text("secondary_employment_status"), // "secondary_employed", "new_secondary_job", "sustained_secondary_job", "improved_secondary_job"
  secondaryEmploymentSector: text("secondary_employment_sector"), // "retail", "services", "transport", etc.
  secondaryBusinessScale: text("secondary_business_scale"), // "micro", "small", "medium", "large"

  // Financial inclusion fields
  accessedLoans: text("accessed_loans").notNull().default("no"), // "yes", "no"
  individualSaving: text("individual_saving").notNull().default("no"), // "yes", "no"
  groupSaving: text("group_saving").notNull().default("no"), // "yes", "no" (VSLA/group saving)

  // Location classification
  locationSetting: text("location_setting"), // "urban", "rural"

  mainChallenge: text("main_challenge"),
  skillOfInterest: text("skill_of_interest"),
  expectedImpact: text("expected_impact"),
  isWillingToParticipate: text("is_willing_to_participate")
    .notNull()
    .default("yes"),
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  cluster_id: uuid("cluster_id")
    .references(() => clusters.id)
    .notNull(),
  project_id: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  noOfTrainings: integer("no_of_trainings").notNull().default(0),
  isActive: text("is_active").notNull().default("yes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const clusterMembers = pgTable("cluster_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  cluster_id: uuid("cluster_id")
    .references(() => clusters.id)
    .notNull(),
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const clusterUsers = pgTable("cluster_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  cluster_id: uuid("cluster_id")
    .references(() => clusters.id)
    .notNull(),
  user_id: text("user_id")
    .references(() => users.id)
    .notNull(),
  role: userRole("role").notNull().default("cluster_manager"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  token: text("token").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const countries = pgTable("countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const districts = pgTable("districts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  region: text("region"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const counties = pgTable("counties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const parishes = pgTable("parishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  sub_county_id: uuid("sub_county_id")
    .references(() => subCounties.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  county_id: uuid("county_id")
    .references(() => counties.id)
    .notNull(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const villages = pgTable("villages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  parish_id: uuid("parish_id")
    .references(() => parishes.id)
    .notNull(),
  sub_county_id: uuid("sub_county_id")
    .references(() => subCounties.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  county_id: uuid("county_id")
    .references(() => counties.id)
    .notNull(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const subCounties = pgTable("subcounties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  county_id: uuid("county_id")
    .references(() => counties.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const municipalities = pgTable("municipalities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  county_id: uuid("county_id")
    .references(() => counties.id)
    .notNull(),
  sub_county_id: uuid("sub_county_id")
    .references(() => subCounties.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const cities = pgTable("cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  county_id: uuid("county_id")
    .references(() => counties.id)
    .notNull(),
  sub_county_id: uuid("sub_county_id")
    .references(() => subCounties.id)
    .notNull(),
  municipality_id: uuid("municipality_id").references(() => municipalities.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const wards = pgTable("wards", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  county_id: uuid("county_id")
    .references(() => counties.id)
    .notNull(),
  sub_county_id: uuid("sub_county_id")
    .references(() => subCounties.id)
    .notNull(),
  municipality_id: uuid("municipality_id").references(() => municipalities.id),
  city_id: uuid("city_id").references(() => cities.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const divisions = pgTable("divisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  county_id: uuid("county_id")
    .references(() => counties.id)
    .notNull(),
  sub_county_id: uuid("sub_county_id")
    .references(() => subCounties.id)
    .notNull(),
  municipality_id: uuid("municipality_id").references(() => municipalities.id),
  city_id: uuid("city_id").references(() => cities.id),
  ward_id: uuid("ward_id").references(() => wards.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const cells = pgTable("cells", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country_id: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  district_id: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  county_id: uuid("county_id")
    .references(() => counties.id)
    .notNull(),
  sub_county_id: uuid("sub_county_id")
    .references(() => subCounties.id)
    .notNull(),
  municipality_id: uuid("municipality_id").references(() => municipalities.id),
  city_id: uuid("city_id").references(() => cities.id),
  ward_id: uuid("ward_id").references(() => wards.id),
  division_id: uuid("division_id").references(() => divisions.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Add relations for administrative divisions
export const countriesRelations = relations(countries, ({ many }) => ({
  districts: many(districts),
}));

export const districtsRelations = relations(districts, ({ one, many }) => ({
  country: one(countries, {
    fields: [districts.country_id],
    references: [countries.id],
  }),
  subCounties: many(subCounties),
  counties: many(counties),
}));

export const countiesRelations = relations(counties, ({ one, many }) => ({
  country: one(countries, {
    fields: [counties.country_id],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [counties.district_id],
    references: [districts.id],
  }),
  subCounties: many(subCounties),
}));

export const parishesRelations = relations(parishes, ({ one, many }) => ({
  subCounty: one(subCounties, {
    fields: [parishes.sub_county_id],
    references: [subCounties.id],
  }),
  district: one(districts, {
    fields: [parishes.district_id],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [parishes.county_id],
    references: [counties.id],
  }),
  country: one(countries, {
    fields: [parishes.country_id],
    references: [countries.id],
  }),
  villages: many(villages),
}));

export const villagesRelations = relations(villages, ({ one }) => ({
  parish: one(parishes, {
    fields: [villages.parish_id],
    references: [parishes.id],
  }),
  subCounty: one(subCounties, {
    fields: [villages.sub_county_id],
    references: [subCounties.id],
  }),
  district: one(districts, {
    fields: [villages.district_id],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [villages.county_id],
    references: [counties.id],
  }),
  country: one(countries, {
    fields: [villages.country_id],
    references: [countries.id],
  }),
}));

export const subCountiesRelations = relations(subCounties, ({ one }) => ({
  country: one(countries, {
    fields: [subCounties.country_id],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [subCounties.district_id],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [subCounties.county_id],
    references: [counties.id],
  }),
}));

// Relations
export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    cluster: one(clusters, {
      fields: [organizations.cluster_id],
      references: [clusters.id],
    }),
    project: one(projects, {
      fields: [organizations.project_id],
      references: [projects.id],
    }),
    members: many(organizationMembers),
  })
);

export const clustersRelations = relations(clusters, ({ many }) => ({
  organizations: many(organizations),
  participants: many(participants),
  members: many(clusterMembers),
  users: many(clusterUsers),
}));

export const kpisRelations = relations(kpis, ({ one }) => ({
  organization: one(organizations, {
    fields: [kpis.organizationId],
    references: [organizations.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  organizations: many(organizations),
  participants: many(participants),
}));

export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizationMembers),
  clusters: many(clusterUsers),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organization_id],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.user_id],
      references: [users.id],
    }),
  })
);

export const clusterMembersRelations = relations(clusterMembers, ({ one }) => ({
  cluster: one(clusters, {
    fields: [clusterMembers.cluster_id],
    references: [clusters.id],
  }),
  organization: one(organizations, {
    fields: [clusterMembers.organization_id],
    references: [organizations.id],
  }),
}));

export const clusterUsersRelations = relations(clusterUsers, ({ one }) => ({
  cluster: one(clusters, {
    fields: [clusterUsers.cluster_id],
    references: [clusters.id],
  }),
  user: one(users, {
    fields: [clusterUsers.user_id],
    references: [users.id],
  }),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  cluster: one(clusters, {
    fields: [participants.cluster_id],
    references: [clusters.id],
  }),
  project: one(projects, {
    fields: [participants.project_id],
    references: [projects.id],
  }),
}));

// Add relations for new tables
export const municipalitiesRelations = relations(municipalities, ({ one }) => ({
  country: one(countries, {
    fields: [municipalities.country_id],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [municipalities.district_id],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [municipalities.county_id],
    references: [counties.id],
  }),
  subCounty: one(subCounties, {
    fields: [municipalities.sub_county_id],
    references: [subCounties.id],
  }),
}));

export const citiesRelations = relations(cities, ({ one }) => ({
  country: one(countries, {
    fields: [cities.country_id],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [cities.district_id],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [cities.county_id],
    references: [counties.id],
  }),
  subCounty: one(subCounties, {
    fields: [cities.sub_county_id],
    references: [subCounties.id],
  }),
  municipality: one(municipalities, {
    fields: [cities.municipality_id],
    references: [municipalities.id],
  }),
}));

export const wardsRelations = relations(wards, ({ one }) => ({
  country: one(countries, {
    fields: [wards.country_id],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [wards.district_id],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [wards.county_id],
    references: [counties.id],
  }),
  subCounty: one(subCounties, {
    fields: [wards.sub_county_id],
    references: [subCounties.id],
  }),
  municipality: one(municipalities, {
    fields: [wards.municipality_id],
    references: [municipalities.id],
  }),
  city: one(cities, {
    fields: [wards.city_id],
    references: [cities.id],
  }),
}));

export const divisionsRelations = relations(divisions, ({ one }) => ({
  country: one(countries, {
    fields: [divisions.country_id],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [divisions.district_id],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [divisions.county_id],
    references: [counties.id],
  }),
  subCounty: one(subCounties, {
    fields: [divisions.sub_county_id],
    references: [subCounties.id],
  }),
  municipality: one(municipalities, {
    fields: [divisions.municipality_id],
    references: [municipalities.id],
  }),
  city: one(cities, {
    fields: [divisions.city_id],
    references: [cities.id],
  }),
  ward: one(wards, {
    fields: [divisions.ward_id],
    references: [wards.id],
  }),
}));

// Add relations for cells
export const cellsRelations = relations(cells, ({ one }) => ({
  country: one(countries, {
    fields: [cells.country_id],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [cells.district_id],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [cells.county_id],
    references: [counties.id],
  }),
  subCounty: one(subCounties, {
    fields: [cells.sub_county_id],
    references: [subCounties.id],
  }),
  municipality: one(municipalities, {
    fields: [cells.municipality_id],
    references: [municipalities.id],
  }),
  city: one(cities, {
    fields: [cells.city_id],
    references: [cities.id],
  }),
  ward: one(wards, {
    fields: [cells.ward_id],
    references: [wards.id],
  }),
  division: one(divisions, {
    fields: [cells.division_id],
    references: [divisions.id],
  }),
}));

export const trainings = pgTable("trainings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  conceptNote: text("concept_note"),
  activityReport: text("activity_report"),
  trainingDate: timestamp("training_date").notNull(),
  venue: text("venue").notNull(),
  status: text("status").notNull().default("pending"),
  numberOfParticipants: integer("number_of_participants").notNull().default(0),
  budget: integer("budget"),
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  cluster_id: uuid("cluster_id")
    .references(() => clusters.id)
    .notNull(),
  project_id: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const trainingParticipants = pgTable("training_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  training_id: uuid("training_id")
    .references(() => trainings.id)
    .notNull(),
  participant_id: uuid("participant_id")
    .references(() => participants.id)
    .notNull(),
  attendance_status: text("attendance_status").notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const trainingsRelations = relations(trainings, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [trainings.organization_id],
    references: [organizations.id],
  }),
  cluster: one(clusters, {
    fields: [trainings.cluster_id],
    references: [clusters.id],
  }),
  project: one(projects, {
    fields: [trainings.project_id],
    references: [projects.id],
  }),
  trainingParticipants: many(trainingParticipants),
}));

export const trainingParticipantsRelations = relations(
  trainingParticipants,
  ({ one }) => ({
    training: one(trainings, {
      fields: [trainingParticipants.training_id],
      references: [trainings.id],
    }),
    participant: one(participants, {
      fields: [trainingParticipants.participant_id],
      references: [participants.id],
    }),
  })
);

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // meeting, workshop, field_visit, etc.
  status: text("status").notNull().default("planned"), // planned, ongoing, completed, cancelled
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  venue: text("venue").notNull(),
  budget: integer("budget"),
  actualCost: integer("actual_cost"),
  numberOfParticipants: integer("number_of_participants").default(0),
  objectives: text("objectives").array().default([]),
  outcomes: text("outcomes"),
  challenges: text("challenges"),
  recommendations: text("recommendations"),
  attachments: text("attachments").array().default([]),
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  cluster_id: uuid("cluster_id").references(() => clusters.id),
  project_id: uuid("project_id").references(() => projects.id),
  created_by: text("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const activityParticipants = pgTable("activity_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  activity_id: uuid("activity_id")
    .references(() => activities.id)
    .notNull(),
  participant_id: uuid("participant_id")
    .references(() => participants.id)
    .notNull(),
  attendance_status: text("attendance_status").notNull().default("invited"), // invited, attended, absent
  role: text("role").default("participant"), // participant, facilitator, organizer
  feedback: text("feedback"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [activities.organization_id],
    references: [organizations.id],
  }),
  cluster: one(clusters, {
    fields: [activities.cluster_id],
    references: [clusters.id],
  }),
  project: one(projects, {
    fields: [activities.project_id],
    references: [projects.id],
  }),
  activityParticipants: many(activityParticipants),
  conceptNotes: many(conceptNotes),
  activityReports: many(activityReports),
  activitySessions: many(activitySessions),
}));

export const activityParticipantsRelations = relations(
  activityParticipants,
  ({ one }) => ({
    activity: one(activities, {
      fields: [activityParticipants.activity_id],
      references: [activities.id],
    }),
    participant: one(participants, {
      fields: [activityParticipants.participant_id],
      references: [participants.id],
    }),
  })
);

export const conceptNotes = pgTable("concept_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  activity_id: uuid("activity_id")
    .references(() => activities.id)
    .notNull(),
  content: text("content").notNull(),
  title: text("title").notNull(),
  charge_code: text("charge_code"),
  activity_lead: text("activity_lead"),
  submission_date: timestamp("submission_date"),
  project_summary: text("project_summary"),
  methodology: text("methodology"),
  requirements: text("requirements"),
  participant_details: text("participant_details"),
  budget_items: text("budget_items").array().default([]),
  budget_notes: text("budget_notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const conceptNotesRelations = relations(conceptNotes, ({ one }) => ({
  activity: one(activities, {
    fields: [conceptNotes.activity_id],
    references: [activities.id],
  }),
}));

export const activityReports = pgTable("activity_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  activity_id: uuid("activity_id")
    .references(() => activities.id)
    .notNull(),
  title: text("title").notNull(),
  execution_date: timestamp("execution_date").notNull(),
  cluster_name: text("cluster_name").notNull(),
  venue: text("venue").notNull(),
  team_leader: text("team_leader").notNull(),
  background_purpose: text("background_purpose").notNull(),
  progress_achievements: text("progress_achievements").notNull(),
  challenges_recommendations: text("challenges_recommendations").notNull(),
  lessons_learned: text("lessons_learned").notNull(),
  follow_up_actions: text("follow_up_actions").array().default([]), // JSON string array of follow-up actions
  actual_cost: integer("actual_cost"),
  number_of_participants: integer("number_of_participants"),
  created_by: text("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const vslas = pgTable("vslas", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Basic Information
  name: text("name").notNull(), // Group name
  code: text("code").notNull().unique(),
  description: text("description"),
  primary_business: text("primary_business").notNull(), // Agriculture, Bakery, Basket weaving, Boda-boda, Catering and cookery, Hairdressing and cosmetology, Leather and craft making, Others
  primary_business_other: text("primary_business_other"), // Specify if "Others" is selected

  // Organization/Project References
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  cluster_id: uuid("cluster_id")
    .references(() => clusters.id)
    .notNull(),
  project_id: uuid("project_id")
    .references(() => projects.id)
    .notNull(),

  // Location Information
  country: text("country").notNull(),
  region: text("region"), // New field for region
  district: text("district").notNull(),
  county: text("county"), // New field for county
  sub_county: text("sub_county").notNull(),
  parish: text("parish").notNull(),
  village: text("village").notNull(),
  address: text("address"),

  // Financial Information
  total_members: integer("total_members").notNull().default(0),
  total_savings: integer("total_savings").notNull().default(0),
  total_loans: integer("total_loans").notNull().default(0),

  // Meeting Information
  meeting_frequency: text("meeting_frequency").notNull(), // weekly, monthly, etc.
  meeting_day: text("meeting_day"), // monday, tuesday, etc.
  meeting_time: text("meeting_time"),
  meeting_location: text("meeting_location"), // New field for meeting location

  // Dates
  formation_date: timestamp("formation_date").notNull(), // Formation date
  closing_date: timestamp("closing_date"), // Closing date (optional)

  // Local Leadership
  lc1_chairperson_name: text("lc1_chairperson_name"), // LC1 Chairperson Name
  lc1_chairperson_contact: text("lc1_chairperson_contact"), // LC1 Chairperson Contact

  // Governance
  has_constitution: text("has_constitution").notNull().default("no"), // yes/no - VSLA has a constitution
  has_signed_constitution: text("has_signed_constitution")
    .notNull()
    .default("no"), // yes/no - VSLA has a signed constitution

  // Banking Information
  bank_name: text("bank_name"), // Bank name
  bank_branch: text("bank_branch"), // Bank branch
  bank_account_number: text("bank_account_number"), // Bank account number
  registration_certificate_number: text("registration_certificate_number"), // Registration certificate number

  // SACCO Information
  sacco_member: text("sacco_member").notNull().default("no"), // yes/no - SACCO Member

  // Additional Information
  notes: text("notes"), // Notes

  // System fields
  status: text("status").notNull().default("active"), // active, inactive, suspended
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const vslaMembers = pgTable("vsla_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  vsla_id: uuid("vsla_id")
    .references(() => vslas.id)
    .notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  role: text("role").notNull().default("member"), // chairperson, secretary, treasurer, member
  joined_date: timestamp("joined_date").notNull(),
  total_savings: integer("total_savings").notNull().default(0),
  total_loans: integer("total_loans").notNull().default(0),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const activityReportsRelations = relations(
  activityReports,
  ({ one }) => ({
    activity: one(activities, {
      fields: [activityReports.activity_id],
      references: [activities.id],
    }),
  })
);

// Activity Sessions Table - For multi-day activities
export const activitySessions = pgTable(
  "activity_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    activity_id: uuid("activity_id")
      .references(() => activities.id, { onDelete: "cascade" })
      .notNull(),
    session_date: date("session_date").notNull(),
    session_number: integer("session_number").notNull(),
    start_time: time("start_time"),
    end_time: time("end_time"),
    venue: text("venue"),
    notes: text("notes"),
    status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, postponed
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  table => ({
    uniqueActivitySessionDate: unique("unique_activity_session_date").on(
      table.activity_id,
      table.session_date
    ),
    uniqueActivitySessionNumber: unique("unique_activity_session_number").on(
      table.activity_id,
      table.session_number
    ),
  })
);

// Daily Attendance Table - For tracking daily attendance per session
export const dailyAttendance = pgTable(
  "daily_attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    session_id: uuid("session_id")
      .references(() => activitySessions.id, { onDelete: "cascade" })
      .notNull(),
    participant_id: uuid("participant_id")
      .references(() => participants.id, { onDelete: "cascade" })
      .notNull(),
    attendance_status: text("attendance_status").notNull().default("invited"), // invited, attended, absent, late, excused
    check_in_time: timestamp("check_in_time"),
    check_out_time: timestamp("check_out_time"),
    notes: text("notes"),
    recorded_by: text("recorded_by"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  table => ({
    uniqueSessionParticipant: unique("unique_session_participant").on(
      table.session_id,
      table.participant_id
    ),
  })
);

// Activity Sessions Relations
export const activitySessionsRelations = relations(
  activitySessions,
  ({ one, many }) => ({
    activity: one(activities, {
      fields: [activitySessions.activity_id],
      references: [activities.id],
    }),
    dailyAttendance: many(dailyAttendance),
  })
);

// Daily Attendance Relations
export const dailyAttendanceRelations = relations(
  dailyAttendance,
  ({ one }) => ({
    session: one(activitySessions, {
      fields: [dailyAttendance.session_id],
      references: [activitySessions.id],
    }),
    participant: one(participants, {
      fields: [dailyAttendance.participant_id],
      references: [participants.id],
    }),
  })
);

export const vslasRelations = relations(vslas, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [vslas.organization_id],
    references: [organizations.id],
  }),
  cluster: one(clusters, {
    fields: [vslas.cluster_id],
    references: [clusters.id],
  }),
  project: one(projects, {
    fields: [vslas.project_id],
    references: [projects.id],
  }),
  members: many(vslaMembers),
}));

export const vslaMembersRelations = relations(vslaMembers, ({ one }) => ({
  vsla: one(vslas, {
    fields: [vslaMembers.vsla_id],
    references: [vslas.id],
  }),
}));
