import {
  IconActivity,
  IconBuildings,
  IconCamera,
  IconCashBanknote,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconHelp,
  IconLocation,
  IconNote,
  IconReport,
  IconSearch,
  IconSettings,
  IconTarget,
  IconTrain,
  IconUsers,
  IconUsersGroup,
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
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: IconFolder,
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
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  kpis: [
    {
      name: "Dashboard",
      url: "/dashboard/kpis-overview",
      icon: IconDatabase,
    },
    {
      name: "Participants",
      url: "/dashboard/participants",
      icon: IconUsersGroup,
    },
    {
      name: "Trainings",
      url: "/dashboard/trainings",
      icon: IconTrain,
    },
    {
      name: "Targets",
      url: "/dashboard/targets",
      icon: IconTarget,
    },
    {
      name: "Activity Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Activities",
      url: "/dashboard/activities",
      icon: IconActivity,
    },
    {
      name: "Concept notes",
      url: "/ dashboard/concept-notes",
      icon: IconNote,
    },
    {
      name: "VSLAs",
      url: "/dashboard/vslas",
      icon: IconCashBanknote,
    },
    {
      name: "Photos",
      url: "/dashboard/photos",
      icon: IconCamera,
    },
  ],
};
