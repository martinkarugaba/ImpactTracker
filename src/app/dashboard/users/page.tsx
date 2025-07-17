import { SiteHeader } from "@/features/dashboard/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/features/users/actions/users";
import { UsersClient } from "./page-client";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  try {
    console.log("Fetching users for dashboard..."); // Debug log
    const usersResult = await getUsers();
    console.log("Users result:", usersResult); // Debug log

    if (!usersResult.success) {
      throw new Error(usersResult.error || "Failed to fetch users");
    }

    return (
      <>
        <SiteHeader title="Users" />
        <div className="flex flex-1 flex-col px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <UsersClient users={usersResult.data} />
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error in users page:", error); // Debug log
    return (
      <>
        <SiteHeader title="Users" />
        <div className="container space-y-6 py-4">
          <div className="mx-auto max-w-7xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-destructive">
                  Error loading users data:{" "}
                  {error instanceof Error
                    ? error.message
                    : "Unknown error occurred"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }
}
