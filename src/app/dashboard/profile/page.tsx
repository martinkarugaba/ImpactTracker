import { auth } from "@/features/auth/auth";
import { ProfileContainer } from "@/features/profile/components/profile-container";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Restrict to super admin only during development
  if (session.user.role !== "super_admin") {
    redirect("/dashboard");
  }

  return <ProfileContainer />;
}
