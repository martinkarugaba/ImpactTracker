import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
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
  age: integer("age").notNull(),
  isPWD: text("is_pwd").notNull().default("no"),
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
