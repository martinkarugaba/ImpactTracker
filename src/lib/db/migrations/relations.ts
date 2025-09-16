import { relations } from "drizzle-orm/relations";
import {
  clusters,
  organizations,
  projects,
  municipalities,
  cities,
  wards,
  divisions,
  cells,
  kpis,
  organizationMembers,
  subcounties,
  parishes,
  districts,
  counties,
  countries,
  clusterUsers,
  users,
  participants,
  villages,
  passwordResetTokens,
  clusterMembers,
  trainings,
  trainingParticipants,
  activities,
  activityParticipants,
  conceptNotes,
  activityReports,
  vslas,
  vslaMembers,
  activitySessions,
  dailyAttendance,
} from "./schema";

export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    cluster: one(clusters, {
      fields: [organizations.clusterId],
      references: [clusters.id],
    }),
    project: one(projects, {
      fields: [organizations.projectId],
      references: [projects.id],
    }),
    municipality: one(municipalities, {
      fields: [organizations.municipalityId],
      references: [municipalities.id],
    }),
    city: one(cities, {
      fields: [organizations.cityId],
      references: [cities.id],
    }),
    ward: one(wards, {
      fields: [organizations.wardId],
      references: [wards.id],
    }),
    division: one(divisions, {
      fields: [organizations.divisionId],
      references: [divisions.id],
    }),
    cell: one(cells, {
      fields: [organizations.cellId],
      references: [cells.id],
    }),
    kpis: many(kpis),
    organizationMembers: many(organizationMembers),
    participants: many(participants),
    clusterMembers: many(clusterMembers),
    trainings: many(trainings),
    activities: many(activities),
    vslas: many(vslas),
  })
);

export const clustersRelations = relations(clusters, ({ many }) => ({
  organizations: many(organizations),
  clusterUsers: many(clusterUsers),
  participants: many(participants),
  clusterMembers: many(clusterMembers),
  trainings: many(trainings),
  activities: many(activities),
  vslas: many(vslas),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  organizations: many(organizations),
  participants: many(participants),
  trainings: many(trainings),
  activities: many(activities),
  vslas: many(vslas),
}));

export const municipalitiesRelations = relations(
  municipalities,
  ({ one, many }) => ({
    organizations: many(organizations),
    cells: many(cells),
    country: one(countries, {
      fields: [municipalities.countryId],
      references: [countries.id],
    }),
    district: one(districts, {
      fields: [municipalities.districtId],
      references: [districts.id],
    }),
    county: one(counties, {
      fields: [municipalities.countyId],
      references: [counties.id],
    }),
    subcounty: one(subcounties, {
      fields: [municipalities.subCountyId],
      references: [subcounties.id],
    }),
    divisions: many(divisions),
    cities: many(cities),
    wards: many(wards),
  })
);

export const citiesRelations = relations(cities, ({ one, many }) => ({
  organizations: many(organizations),
  cells: many(cells),
  divisions: many(divisions),
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [cities.districtId],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [cities.countyId],
    references: [counties.id],
  }),
  subcounty: one(subcounties, {
    fields: [cities.subCountyId],
    references: [subcounties.id],
  }),
  municipality: one(municipalities, {
    fields: [cities.municipalityId],
    references: [municipalities.id],
  }),
  wards: many(wards),
}));

export const wardsRelations = relations(wards, ({ one, many }) => ({
  organizations: many(organizations),
  cells: many(cells),
  divisions: many(divisions),
  country: one(countries, {
    fields: [wards.countryId],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [wards.districtId],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [wards.countyId],
    references: [counties.id],
  }),
  subcounty: one(subcounties, {
    fields: [wards.subCountyId],
    references: [subcounties.id],
  }),
  municipality: one(municipalities, {
    fields: [wards.municipalityId],
    references: [municipalities.id],
  }),
  city: one(cities, {
    fields: [wards.cityId],
    references: [cities.id],
  }),
}));

export const divisionsRelations = relations(divisions, ({ one, many }) => ({
  organizations: many(organizations),
  cells: many(cells),
  country: one(countries, {
    fields: [divisions.countryId],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [divisions.districtId],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [divisions.countyId],
    references: [counties.id],
  }),
  subcounty: one(subcounties, {
    fields: [divisions.subCountyId],
    references: [subcounties.id],
  }),
  municipality: one(municipalities, {
    fields: [divisions.municipalityId],
    references: [municipalities.id],
  }),
  city: one(cities, {
    fields: [divisions.cityId],
    references: [cities.id],
  }),
  ward: one(wards, {
    fields: [divisions.wardId],
    references: [wards.id],
  }),
}));

export const cellsRelations = relations(cells, ({ one, many }) => ({
  organizations: many(organizations),
  country: one(countries, {
    fields: [cells.countryId],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [cells.districtId],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [cells.countyId],
    references: [counties.id],
  }),
  subcounty: one(subcounties, {
    fields: [cells.subCountyId],
    references: [subcounties.id],
  }),
  municipality: one(municipalities, {
    fields: [cells.municipalityId],
    references: [municipalities.id],
  }),
  city: one(cities, {
    fields: [cells.cityId],
    references: [cities.id],
  }),
  ward: one(wards, {
    fields: [cells.wardId],
    references: [wards.id],
  }),
  division: one(divisions, {
    fields: [cells.divisionId],
    references: [divisions.id],
  }),
}));

export const kpisRelations = relations(kpis, ({ one }) => ({
  organization: one(organizations, {
    fields: [kpis.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
  })
);

export const parishesRelations = relations(parishes, ({ one, many }) => ({
  subcounty: one(subcounties, {
    fields: [parishes.subCountyId],
    references: [subcounties.id],
  }),
  district: one(districts, {
    fields: [parishes.districtId],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [parishes.countyId],
    references: [counties.id],
  }),
  country: one(countries, {
    fields: [parishes.countryId],
    references: [countries.id],
  }),
  participants: many(participants),
  villages: many(villages),
}));

export const subcountiesRelations = relations(subcounties, ({ one, many }) => ({
  parishes: many(parishes),
  participants: many(participants),
  villages: many(villages),
  cells: many(cells),
  municipalities: many(municipalities),
  country: one(countries, {
    fields: [subcounties.countryId],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [subcounties.districtId],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [subcounties.countyId],
    references: [counties.id],
  }),
  divisions: many(divisions),
  cities: many(cities),
  wards: many(wards),
}));

export const districtsRelations = relations(districts, ({ one, many }) => ({
  parishes: many(parishes),
  country: one(countries, {
    fields: [districts.countryId],
    references: [countries.id],
  }),
  participants: many(participants),
  villages: many(villages),
  cells: many(cells),
  municipalities: many(municipalities),
  counties: many(counties),
  subcounties: many(subcounties),
  divisions: many(divisions),
  cities: many(cities),
  wards: many(wards),
}));

export const countiesRelations = relations(counties, ({ one, many }) => ({
  parishes: many(parishes),
  villages: many(villages),
  cells: many(cells),
  municipalities: many(municipalities),
  country: one(countries, {
    fields: [counties.countryId],
    references: [countries.id],
  }),
  district: one(districts, {
    fields: [counties.districtId],
    references: [districts.id],
  }),
  subcounties: many(subcounties),
  divisions: many(divisions),
  cities: many(cities),
  wards: many(wards),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  parishes: many(parishes),
  districts: many(districts),
  participants: many(participants),
  villages: many(villages),
  cells: many(cells),
  municipalities: many(municipalities),
  counties: many(counties),
  subcounties: many(subcounties),
  divisions: many(divisions),
  cities: many(cities),
  wards: many(wards),
}));

export const clusterUsersRelations = relations(clusterUsers, ({ one }) => ({
  cluster: one(clusters, {
    fields: [clusterUsers.clusterId],
    references: [clusters.id],
  }),
  user: one(users, {
    fields: [clusterUsers.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  clusterUsers: many(clusterUsers),
  passwordResetTokens: many(passwordResetTokens),
}));

export const participantsRelations = relations(
  participants,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [participants.organizationId],
      references: [organizations.id],
    }),
    cluster: one(clusters, {
      fields: [participants.clusterId],
      references: [clusters.id],
    }),
    project: one(projects, {
      fields: [participants.projectId],
      references: [projects.id],
    }),
    country: one(countries, {
      fields: [participants.countryId],
      references: [countries.id],
    }),
    district: one(districts, {
      fields: [participants.districtId],
      references: [districts.id],
    }),
    subcounty: one(subcounties, {
      fields: [participants.subcountyId],
      references: [subcounties.id],
    }),
    parish: one(parishes, {
      fields: [participants.parishId],
      references: [parishes.id],
    }),
    village: one(villages, {
      fields: [participants.villageId],
      references: [villages.id],
    }),
    trainingParticipants: many(trainingParticipants),
    activityParticipants: many(activityParticipants),
    dailyAttendances: many(dailyAttendance),
  })
);

export const villagesRelations = relations(villages, ({ one, many }) => ({
  participants: many(participants),
  parish: one(parishes, {
    fields: [villages.parishId],
    references: [parishes.id],
  }),
  subcounty: one(subcounties, {
    fields: [villages.subCountyId],
    references: [subcounties.id],
  }),
  district: one(districts, {
    fields: [villages.districtId],
    references: [districts.id],
  }),
  county: one(counties, {
    fields: [villages.countyId],
    references: [counties.id],
  }),
  country: one(countries, {
    fields: [villages.countryId],
    references: [countries.id],
  }),
}));

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
);

export const clusterMembersRelations = relations(clusterMembers, ({ one }) => ({
  cluster: one(clusters, {
    fields: [clusterMembers.clusterId],
    references: [clusters.id],
  }),
  organization: one(organizations, {
    fields: [clusterMembers.organizationId],
    references: [organizations.id],
  }),
}));

export const trainingsRelations = relations(trainings, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [trainings.organizationId],
    references: [organizations.id],
  }),
  cluster: one(clusters, {
    fields: [trainings.clusterId],
    references: [clusters.id],
  }),
  project: one(projects, {
    fields: [trainings.projectId],
    references: [projects.id],
  }),
  trainingParticipants: many(trainingParticipants),
}));

export const trainingParticipantsRelations = relations(
  trainingParticipants,
  ({ one }) => ({
    training: one(trainings, {
      fields: [trainingParticipants.trainingId],
      references: [trainings.id],
    }),
    participant: one(participants, {
      fields: [trainingParticipants.participantId],
      references: [participants.id],
    }),
  })
);

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [activities.organizationId],
    references: [organizations.id],
  }),
  cluster: one(clusters, {
    fields: [activities.clusterId],
    references: [clusters.id],
  }),
  project: one(projects, {
    fields: [activities.projectId],
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
      fields: [activityParticipants.activityId],
      references: [activities.id],
    }),
    participant: one(participants, {
      fields: [activityParticipants.participantId],
      references: [participants.id],
    }),
  })
);

export const conceptNotesRelations = relations(conceptNotes, ({ one }) => ({
  activity: one(activities, {
    fields: [conceptNotes.activityId],
    references: [activities.id],
  }),
}));

export const activityReportsRelations = relations(
  activityReports,
  ({ one }) => ({
    activity: one(activities, {
      fields: [activityReports.activityId],
      references: [activities.id],
    }),
  })
);

export const vslasRelations = relations(vslas, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [vslas.organizationId],
    references: [organizations.id],
  }),
  cluster: one(clusters, {
    fields: [vslas.clusterId],
    references: [clusters.id],
  }),
  project: one(projects, {
    fields: [vslas.projectId],
    references: [projects.id],
  }),
  vslaMembers: many(vslaMembers),
}));

export const vslaMembersRelations = relations(vslaMembers, ({ one }) => ({
  vsla: one(vslas, {
    fields: [vslaMembers.vslaId],
    references: [vslas.id],
  }),
}));

export const activitySessionsRelations = relations(
  activitySessions,
  ({ one, many }) => ({
    activity: one(activities, {
      fields: [activitySessions.activityId],
      references: [activities.id],
    }),
    dailyAttendances: many(dailyAttendance),
  })
);

export const dailyAttendanceRelations = relations(
  dailyAttendance,
  ({ one }) => ({
    activitySession: one(activitySessions, {
      fields: [dailyAttendance.sessionId],
      references: [activitySessions.id],
    }),
    participant: one(participants, {
      fields: [dailyAttendance.participantId],
      references: [participants.id],
    }),
  })
);
