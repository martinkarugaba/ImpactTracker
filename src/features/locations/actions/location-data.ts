import { db } from "@/lib/db";
import {
  clusters,
  organizations,
  districts,
  subCounties,
  parishes,
  villages,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export interface LocationData {
  districts: Array<{ id: string; name: string; code: string }>;
  subCounties: Array<{ id: string; name: string; code: string }>;
  parishes: Array<{ id: string; name: string; code: string }>;
  villages: Array<{ id: string; name: string; code: string }>;
  countries: Array<{ id: string; name: string; code: string }>;
  // Code-to-name mappings for quick lookups
  districtCodes: Record<string, string>;
  subCountyCodes: Record<string, string>;
  parishCodes: Record<string, string>;
  villageCodes: Record<string, string>;
}

export async function getClusterLocationData(
  clusterId: string
): Promise<LocationData | null> {
  try {
    if (!clusterId) return null;

    // Get cluster to find districts
    const cluster = await db.query.clusters.findFirst({
      where: eq(clusters.id, clusterId),
      columns: { districts: true },
    });

    if (!cluster?.districts?.length) return null;

    // Get all districts in the cluster
    const clusterDistricts = await db.query.districts.findMany({
      where: inArray(districts.code, cluster.districts),
      columns: { id: true, name: true, code: true },
    });

    const districtIds = clusterDistricts.map(d => d.id);

    // Get all subcounties in these districts
    const clusterSubCounties = await db.query.subCounties.findMany({
      where: inArray(subCounties.district_id, districtIds),
      columns: { id: true, name: true, code: true },
    });

    const subCountyIds = clusterSubCounties.map(sc => sc.id);

    // Get all parishes in these subcounties
    const clusterParishes = await db.query.parishes.findMany({
      where: inArray(parishes.sub_county_id, subCountyIds),
      columns: { id: true, name: true, code: true },
    });

    const parishIds = clusterParishes.map(p => p.id);

    // Get all villages in these parishes
    const clusterVillages = await db.query.villages.findMany({
      where: inArray(villages.parish_id, parishIds),
      columns: { id: true, name: true, code: true },
    });

    // Get countries (usually just Uganda for this context)
    const clusterCountries = await db.query.countries.findMany({
      columns: { id: true, name: true, code: true },
    });

    // Create code-to-name mappings
    const districtCodes: Record<string, string> = {};
    clusterDistricts.forEach(d => {
      districtCodes[d.code] = d.name;
    });

    const subCountyCodes: Record<string, string> = {};
    clusterSubCounties.forEach(sc => {
      subCountyCodes[sc.code] = sc.name;
    });

    const parishCodes: Record<string, string> = {};
    clusterParishes.forEach(p => {
      parishCodes[p.code] = p.name;
    });

    const villageCodes: Record<string, string> = {};
    clusterVillages.forEach(v => {
      villageCodes[v.code] = v.name;
    });

    return {
      districts: clusterDistricts,
      subCounties: clusterSubCounties,
      parishes: clusterParishes,
      villages: clusterVillages,
      countries: clusterCountries,
      districtCodes,
      subCountyCodes,
      parishCodes,
      villageCodes,
    };
  } catch (error) {
    console.error("Error fetching cluster location data:", error);
    return null;
  }
}

export async function getOrganizationLocationData(
  organizationId: string
): Promise<LocationData | null> {
  try {
    if (!organizationId) return null;

    // Get organization to find operation subcounties
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: { operation_sub_counties: true, cluster_id: true },
    });

    if (!org) return null;

    // If organization has specific operation subcounties, use those
    let subCountyCodes: string[] = [];
    if (org.operation_sub_counties && org.operation_sub_counties.length > 0) {
      subCountyCodes = org.operation_sub_counties;
    } else if (org.cluster_id) {
      // Fall back to cluster districts
      return getClusterLocationData(org.cluster_id);
    } else {
      return null;
    }

    // Get subcounties by codes
    const orgSubCounties = await db.query.subCounties.findMany({
      where: inArray(subCounties.code, subCountyCodes),
      columns: { id: true, name: true, code: true, district_id: true },
    });

    const districtIds = [...new Set(orgSubCounties.map(sc => sc.district_id))];
    const subCountyIds = orgSubCounties.map(sc => sc.id);

    // Get districts
    const orgDistricts = await db.query.districts.findMany({
      where: inArray(districts.id, districtIds),
      columns: { id: true, name: true, code: true },
    });

    // Get parishes in these subcounties
    const orgParishes = await db.query.parishes.findMany({
      where: inArray(parishes.sub_county_id, subCountyIds),
      columns: { id: true, name: true, code: true },
    });

    const parishIds = orgParishes.map(p => p.id);

    // Get villages in these parishes
    const orgVillages = await db.query.villages.findMany({
      where: inArray(villages.parish_id, parishIds),
      columns: { id: true, name: true, code: true },
    });

    // Get countries
    const orgCountries = await db.query.countries.findMany({
      columns: { id: true, name: true, code: true },
    });

    // Create code-to-name mappings
    const districtCodes: Record<string, string> = {};
    orgDistricts.forEach(d => {
      districtCodes[d.code] = d.name;
    });

    const subCountyCodesMap: Record<string, string> = {};
    orgSubCounties.forEach(sc => {
      subCountyCodesMap[sc.code] = sc.name;
    });

    const parishCodes: Record<string, string> = {};
    orgParishes.forEach(p => {
      parishCodes[p.code] = p.name;
    });

    const villageCodes: Record<string, string> = {};
    orgVillages.forEach(v => {
      villageCodes[v.code] = v.name;
    });

    return {
      districts: orgDistricts,
      subCounties: orgSubCounties,
      parishes: orgParishes,
      villages: orgVillages,
      countries: orgCountries,
      districtCodes,
      subCountyCodes: subCountyCodesMap,
      parishCodes,
      villageCodes,
    };
  } catch (error) {
    console.error("Error fetching organization location data:", error);
    return null;
  }
}
