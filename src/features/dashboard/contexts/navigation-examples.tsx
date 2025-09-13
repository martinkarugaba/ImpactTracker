// Example usage of the enhanced navigation system

import {
  usePageInfo,
  useNavigation,
} from "@/features/dashboard/contexts/navigation-context";
import { useEffect } from "react";
import { Calendar, Users } from "lucide-react";

// Example 1: Simple page with auto-generated breadcrumbs
export function SimplePageExample() {
  const { setPageInfo } = usePageInfo();

  useEffect(() => {
    setPageInfo({
      title: "Activities Overview",
      // Breadcrumbs will be auto-generated from URL if not provided
    });
  }, [setPageInfo]);

  return <div>Your page content</div>;
}

// Example 2: Details page with custom breadcrumbs and back button
export function DetailsPageExample({
  itemId,
  itemName,
}: {
  itemId: string;
  itemName: string;
}) {
  const { setPageInfo } = usePageInfo();

  useEffect(() => {
    setPageInfo({
      title: itemName,
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        {
          label: "Activities",
          href: "/dashboard/activities",
          icon: <Calendar className="h-4 w-4" />,
        },
        { label: itemName, isCurrentPage: true },
      ],
      showBackButton: true,
      backHref: "/dashboard/activities", // Optional: specific back URL
    });
  }, [itemId, itemName, setPageInfo]);

  return <div>Your details page content</div>;
}

// Example 3: Nested details page
export function NestedDetailsExample({
  activityId,
  activityName,
  participantId,
  participantName,
}: {
  activityId: string;
  activityName: string;
  participantId: string;
  participantName: string;
}) {
  const { setPageInfo } = usePageInfo();

  useEffect(() => {
    setPageInfo({
      title: `${participantName} - Participation Details`,
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Activities", href: "/dashboard/activities" },
        {
          label: activityName,
          href: `/dashboard/activities/${activityId}`,
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          label: "Participants",
          href: `/dashboard/activities/${activityId}/participants`,
        },
        {
          label: participantName,
          isCurrentPage: true,
          icon: <Users className="h-4 w-4" />,
        },
      ],
      showBackButton: true,
      backHref: `/dashboard/activities/${activityId}`,
    });
  }, [activityId, activityName, participantId, participantName, setPageInfo]);

  return <div>Your nested details content</div>;
}

// Example 4: Using navigation context directly for programmatic navigation
export function NavigationExample() {
  const { goBack, breadcrumbs, showBackButton } = useNavigation();

  const handleCustomBack = () => {
    // Custom logic before going back
    console.log("Going back from:", breadcrumbs[breadcrumbs.length - 1]?.label);
    goBack();
  };

  return (
    <div>
      {showBackButton && (
        <button onClick={handleCustomBack}>Custom Back Button</button>
      )}
      {/* Your content */}
    </div>
  );
}
