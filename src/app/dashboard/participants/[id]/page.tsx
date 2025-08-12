import { ParticipantDetails } from "@/features/participants/components/participant-details";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { getParticipant } from "@/features/participants/actions/get-participant";
import { notFound } from "next/navigation";

interface ParticipantDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ParticipantDetailsPage({
  params,
}: ParticipantDetailsPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Fetch participant data to get their name for the header
  const participantResult = await getParticipant(id);

  if (!participantResult.success || !participantResult.data) {
    notFound();
  }

  const participant = participantResult.data;
  const participantName = `${participant.firstName} ${participant.lastName}`;

  return (
    <>
      <SiteHeader title={participantName} />
      <div className="container mx-auto px-6 py-6">
        <ParticipantDetails
          participantId={id}
          showActions={true}
          className="mx-auto max-w-7xl"
        />
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: ParticipantDetailsPageProps) {
  const { id } = await params;

  // Fetch participant data to get their name for the title
  const participantResult = await getParticipant(id);

  if (!participantResult.success || !participantResult.data) {
    return {
      title: "Participant Not Found",
      description: "The requested participant could not be found",
    };
  }

  const participant = participantResult.data;
  const participantName = `${participant.firstName} ${participant.lastName}`;

  return {
    title: `${participantName} - Participant Details`,
    description: `View detailed information about ${participantName}`,
  };
}
