import { redirect } from "next/navigation";

export default function TrainingNewPage() {
  // Redirect to main trainings page since we now use a dialog
  redirect("/dashboard/trainings");
}
