import {
  IconActivity,
  IconBuildings,
  IconCashBanknote,
  IconDashboard,
  IconHelp,
  IconLocation,
  IconNote,
  IconReport,
  IconUsers,
  IconUsersGroup,
  IconCertificate,
} from "@tabler/icons-react";

export const navigationData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Clusters",
      url: "/dashboard/clusters",
      icon: IconBuildings,
    },
    {
      title: "Organisations",
      url: "/dashboard/organizations",
      icon: IconBuildings,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: IconNote,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    },
    {
      title: "Locations",
      url: "/dashboard/locations",
      icon: IconLocation,
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
  kpis: [
    {
      name: "Overview",
      url: "/dashboard/user-overview",
      icon: IconDashboard,
    },
    {
      name: "Participants",
      url: "/dashboard/participants",
      icon: IconUsersGroup,
    },
    {
      name: "Activities",
      url: "/dashboard/activities",
      icon: IconActivity,
    },
    {
      name: "Interventions",
      url: "/dashboard/interventions",
      icon: IconCertificate,
    },
    {
      name: "VSLAs",
      url: "/dashboard/vslas",
      icon: IconCashBanknote,
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Concept notes",
      url: "/dashboard/concept-notes",
      icon: IconNote,
    },
  ],
};
