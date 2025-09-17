"use server";

import { db } from "@/lib/db";
import {
  projects,
  participants,
  organizationMembers,
  clusterUsers,
} from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/features/auth/auth";
import { Project } from "../types";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  acronym: z.string().min(1, "Acronym is required"),
  description: z.string().nullable(),
  status: z.enum(["active", "completed", "on-hold"]).default("active"),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

type CreateProjectInput = z.infer<typeof createProjectSchema>;

export async function createProject(data: CreateProjectInput) {
  try {
    const validatedData = createProjectSchema.parse(data);

    const [project] = await db
      .insert(projects)
      .values(validatedData)
      .returning();

    // Cast the status field to the expected type
    const typedProject: Project = {
      ...project,
      status: project.status as "active" | "completed" | "on-hold",
    };

    revalidatePath("/dashboard/projects");
    return { success: true, data: typedProject };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProject(
  id: string,
  data: Partial<CreateProjectInput>
) {
  try {
    const validatedData = createProjectSchema.partial().parse(data);

    const [project] = await db
      .update(projects)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    // Cast the status field to the expected type
    const typedProject: Project = {
      ...project,
      status: project.status as "active" | "completed" | "on-hold",
    };

    revalidatePath("/dashboard/projects");
    return { success: true, data: typedProject };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(id: string) {
  try {
    await db.delete(projects).where(eq(projects.id, id));
    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

export async function getProjects() {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get user's organization and cluster context
    let userOrgId: string | undefined;
    let userClusterIds: string[] = [];

    // For non-super_admin users, find their organization and clusters
    if (session.user.role !== "super_admin") {
      // Get user's organization
      const userMembership = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.user_id, session.user.id),
      });
      userOrgId = userMembership?.organization_id;

      // Get user's clusters
      const userClusters = await db.query.clusterUsers.findMany({
        where: eq(clusterUsers.user_id, session.user.id),
      });
      userClusterIds = userClusters.map(uc => uc.cluster_id);
    }

    let projectsList: Array<{
      id: string;
      name: string;
      acronym: string;
      description: string | null;
      status: string;
      startDate: Date | null;
      endDate: Date | null;
      createdAt: Date | null;
      updatedAt: Date | null;
    }>;

    if (session.user.role === "super_admin") {
      // Super admin can see all projects
      projectsList = await db.select().from(projects);
    } else if (userClusterIds.length > 0 || userOrgId) {
      // Find projects that are linked to participants in user's authorized clusters/organizations
      const participantProjects = await db
        .selectDistinct({ project_id: participants.project_id })
        .from(participants)
        .where(
          userOrgId && userClusterIds.length > 0
            ? sql`(
                ${participants.organization_id} = ${userOrgId}
                OR ${participants.cluster_id} = ANY(${userClusterIds})
              )`
            : userOrgId
              ? eq(participants.organization_id, userOrgId)
              : sql`${participants.cluster_id} = ANY(${userClusterIds})`
        );

      const projectIds = participantProjects
        .map(p => p.project_id)
        .filter(id => id !== null) as string[];

      if (projectIds.length > 0) {
        projectsList = await db
          .select()
          .from(projects)
          .where(inArray(projects.id, projectIds));
      } else {
        projectsList = [];
      }
    } else {
      // User has no organization or cluster access
      projectsList = [];
    }

    const typedProjects = projectsList.map(project => ({
      ...project,
      status: project.status as "active" | "completed" | "on-hold",
    }));

    return { success: true, data: typedProjects };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}

export async function getProject(id: string) {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Cast the status field to the expected type
    const typedProject: Project = {
      ...project,
      status: project.status as "active" | "completed" | "on-hold",
    };

    return { success: true, data: typedProject };
  } catch (error) {
    console.error("Error fetching project:", error);
    return { success: false, error: "Failed to fetch project" };
  }
}
