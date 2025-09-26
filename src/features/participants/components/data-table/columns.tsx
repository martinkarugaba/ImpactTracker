"use client";

import { type ColumnDef, type Table, type Row } from "@tanstack/react-table";
import { type Participant } from "../../types/types";
import { type LocationNames } from "../../hooks/use-location-names";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { capitalizeWords, calculateAge, formatContact } from "@/lib/utils";
import { Phone, Flag } from "lucide-react";
import { ActionCell } from "./action-cell";

interface GetParticipantColumnsProps {
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
  onView: (participant: Participant) => void;
  locationNames?: LocationNames;
}

export function getParticipantColumns({
  onEdit,
  onDelete,
  onView,
  locationNames,
}: GetParticipantColumnsProps): ColumnDef<Participant>[] {
  return [
    {
      id: "select",
      header: ({ table }: { table: Table<Participant> }) => (
        <div className="flex items-center justify-center px-4">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: boolean) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }: { row: Row<Participant> }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "fullName",
      header: "Name",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => {
        const firstName = capitalizeWords(row.firstName || "");
        const lastName = capitalizeWords(row.lastName || "");
        return `${firstName} ${lastName}`;
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
            {capitalizeWords(row.original.firstName || "")?.[0]?.toUpperCase()}
            {capitalizeWords(row.original.lastName || "")?.[0]?.toUpperCase()}
          </div>
          <div className="font-medium">
            {capitalizeWords(row.original.firstName || "")}{" "}
            {capitalizeWords(row.original.lastName || "")}
          </div>
        </div>
      ),
    },
    {
      id: "sex",
      header: "Gender",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.sex,
      cell: ({ row }) => {
        const sex = row.original.sex;
        if (!sex) return "";

        const isMale =
          sex.toLowerCase() === "male" || sex.toLowerCase() === "m";
        const isFemale =
          sex.toLowerCase() === "female" || sex.toLowerCase() === "f";

        if (isMale) {
          return (
            <Badge
              variant="outline"
              className="border-blue-300 bg-blue-50/50 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
            >
              M
            </Badge>
          );
        }

        if (isFemale) {
          return (
            <Badge
              variant="outline"
              className="border-pink-300 bg-pink-50/50 text-pink-700 hover:bg-pink-50 dark:border-pink-600 dark:bg-pink-950/20 dark:text-pink-400"
            >
              F
            </Badge>
          );
        }

        return <Badge>{sex.charAt(0).toUpperCase()}</Badge>;
      },
    },
    {
      id: "age",
      header: "Age",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => {
        // Try to calculate age from date of birth first
        if (row.dateOfBirth) {
          const calculatedAge = calculateAge(row.dateOfBirth);
          if (calculatedAge !== null) {
            return calculatedAge;
          }
        }
        // Fall back to stored age if dateOfBirth is null or invalid
        return row.age || 0;
      },
      cell: ({ row }) => {
        let age = 0;

        // Try to calculate age from date of birth first
        if (row.original.dateOfBirth) {
          const calculatedAge = calculateAge(row.original.dateOfBirth);
          if (calculatedAge !== null) {
            age = calculatedAge;
          } else {
            age = row.original.age || 0;
          }
        } else {
          age = row.original.age || 0;
        }

        if (!age && age !== 0) return "—";

        const ageNum = Number(age);
        let variant: "default" | "secondary" | "destructive" | "outline" =
          "outline";
        let className = "";

        if (ageNum <= 35) {
          variant = "outline";
          className =
            "border-green-300 bg-green-50/50 text-green-700 hover:bg-green-50 dark:border-green-600 dark:bg-green-950/20 dark:text-green-400";
        } else if (ageNum <= 50) {
          variant = "outline";
          className =
            "border-yellow-300 bg-yellow-50/50 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400";
        } else {
          variant = "outline";
          className =
            "border-orange-300 bg-orange-50/50 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:bg-orange-950/20 dark:text-orange-400";
        }

        return (
          <Badge variant={variant} className={className}>
            {age}
          </Badge>
        );
      },
    },
    {
      id: "contact",
      header: "Contact",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => formatContact(row.contact || ""),
      cell: ({ row }) => {
        const contact = row.original.contact;
        if (!contact) return "—";

        const formattedContact = formatContact(contact);

        return (
          <div className="flex items-center gap-2 font-mono text-sm">
            <Phone className="text-muted-foreground h-3 w-3" />
            {formattedContact}
          </div>
        );
      },
    },
    {
      id: "district",
      header: "District",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => {
        const districtId = row.district;
        const districtName =
          locationNames?.districts[districtId] || districtId || "—";
        return capitalizeWords(districtName);
      },
      cell: ({ row }) => {
        const districtId = row.original.district;
        const districtName =
          locationNames?.districts[districtId] || districtId || "—";
        const capitalizedName = capitalizeWords(districtName);

        return (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-xs text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Flag className="h-3 w-3" />
            </div>
            <div className="max-w-[200px] truncate" title={capitalizedName}>
              {capitalizedName}
            </div>
          </div>
        );
      },
    },
    {
      id: "organization",
      header: "Organization",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.organizationName || row.organization_id,
      cell: ({ row }) => {
        const name =
          row.original.organizationName || row.original.organization_id;

        if (!name) return <span className="text-muted-foreground">-</span>;

        // Generate acronym from organization name
        const acronym = name
          .split(/\s+/)
          .map(word => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 4); // Allow up to 4 characters for better readability

        return (
          <Badge
            variant="outline"
            className="border-purple-300 bg-purple-50/50 font-mono text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:bg-purple-950/20 dark:text-purple-400"
            title={name}
          >
            {acronym}
          </Badge>
        );
      },
    },
    {
      id: "project",
      header: "Project",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.projectAcronym || "UNK",
      cell: ({ row }) => {
        const acronym = row.original.projectAcronym || "UNK";
        const name = row.original.projectName || "Unknown";

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-300 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
              title={name}
            >
              {acronym}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "employmentStatus",
      header: "Employment Status",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.employmentStatus,
      cell: ({ row }) => {
        const employmentStatus = row.original.employmentStatus;
        if (!employmentStatus) return "—";

        const statusMap = {
          employed: {
            label: "Employed",
            color:
              "bg-green-600/80 text-white hover:bg-green-700/80 dark:bg-green-700/80 dark:hover:bg-green-800/80",
          },
          unemployed: {
            label: "Unemployed",
            color:
              "bg-red-600/80 text-white hover:bg-red-700/80 dark:bg-red-700/80 dark:hover:bg-red-800/80",
          },
          "self-employed": {
            label: "Self-Employed",
            color:
              "bg-blue-600/80 text-white hover:bg-blue-700/80 dark:bg-blue-700/80 dark:hover:bg-blue-800/80",
          },
          student: {
            label: "Student",
            color:
              "bg-purple-600/80 text-white hover:bg-purple-700/80 dark:bg-purple-700/80 dark:hover:bg-purple-800/80",
          },
          retired: {
            label: "Retired",
            color:
              "bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80",
          },
        };

        const statusInfo =
          statusMap[employmentStatus as keyof typeof statusMap];

        if (!statusInfo) {
          return (
            <Badge className="max-w-[150px] truncate">
              {capitalizeWords(employmentStatus)}
            </Badge>
          );
        }

        return (
          <Badge className={`${statusInfo.color} max-w-[150px] truncate`}>
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      id: "isSubscribedToVSLA",
      header: "VSLA Member",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.isSubscribedToVSLA,
      cell: ({ row }) => {
        const isSubscribed = row.original.isSubscribedToVSLA === "yes";

        if (isSubscribed) {
          return (
            <Badge className="bg-green-600/80 text-white hover:bg-green-700/80 dark:bg-green-700/80 dark:hover:bg-green-800/80">
              ✓ Member
            </Badge>
          );
        }

        return (
          <Badge className="bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80">
            Not Member
          </Badge>
        );
      },
    },
    {
      id: "vslaName",
      header: "VSLA Name",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.vslaName || "",
      cell: ({ row }) => {
        const vslaName = row.original.vslaName;
        const isSubscribed = row.original.isSubscribedToVSLA === "yes";

        if (isSubscribed && vslaName) {
          return (
            <div className="max-w-[150px] truncate text-sm" title={vslaName}>
              {vslaName}
            </div>
          );
        }

        return <span className="text-muted-foreground text-sm">—</span>;
      },
    },
    {
      id: "subCounty",
      header: "Sub County",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => {
        const subCountyId = row.subCounty;
        const subCountyName =
          locationNames?.subCounties[subCountyId] || subCountyId || "—";
        return capitalizeWords(subCountyName);
      },
      cell: ({ row }) => {
        const subCountyId = row.original.subCounty;
        const subCountyName =
          locationNames?.subCounties[subCountyId] || subCountyId || "—";
        const capitalizedName = capitalizeWords(subCountyName);

        return (
          <div className="max-w-[150px] truncate" title={capitalizedName}>
            {capitalizedName}
          </div>
        );
      },
    },
    {
      id: "parish",
      header: "Parish",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => capitalizeWords(row.parish || ""),
      cell: ({ row }) => {
        const parish = capitalizeWords(row.original.parish || "");
        return (
          <div className="max-w-[120px] truncate" title={parish}>
            {parish || "—"}
          </div>
        );
      },
    },
    {
      id: "village",
      header: "Village",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => capitalizeWords(row.village || ""),
      cell: ({ row }) => {
        const village = capitalizeWords(row.original.village || "");
        return (
          <div className="max-w-[120px] truncate" title={village}>
            {village || "—"}
          </div>
        );
      },
    },
    {
      id: "maritalStatus",
      header: "Marital Status",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.maritalStatus,
      cell: ({ row }) => {
        const maritalStatus = row.original.maritalStatus;
        if (!maritalStatus) return "—";

        const statusMap = {
          single: {
            label: "Single",
            color:
              "bg-blue-600/80 text-white hover:bg-blue-700/80 dark:bg-blue-700/80 dark:hover:bg-blue-800/80",
          },
          married: {
            label: "Married",
            color:
              "bg-green-600/80 text-white hover:bg-green-700/80 dark:bg-green-700/80 dark:hover:bg-green-800/80",
          },
          divorced: {
            label: "Divorced",
            color:
              "bg-orange-600/80 text-white hover:bg-orange-700/80 dark:bg-orange-700/80 dark:hover:bg-orange-800/80",
          },
          widowed: {
            label: "Widowed",
            color:
              "bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80",
          },
        };

        const statusInfo = statusMap[maritalStatus as keyof typeof statusMap];
        const displayText = statusInfo?.label || capitalizeWords(maritalStatus);
        const colorClass =
          statusInfo?.color ||
          "bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80";

        return <Badge className={colorClass}>{displayText}</Badge>;
      },
    },
    {
      id: "educationLevel",
      header: "Education",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.educationLevel,
      cell: ({ row }) => {
        const educationLevel = row.original.educationLevel;
        if (!educationLevel) return "—";

        const levelMap = {
          none: {
            label: "None",
            color:
              "bg-red-600/80 text-white hover:bg-red-700/80 dark:bg-red-700/80 dark:hover:bg-red-800/80",
          },
          primary: {
            label: "Primary",
            color:
              "bg-yellow-600/80 text-white hover:bg-yellow-700/80 dark:bg-yellow-700/80 dark:hover:bg-yellow-800/80",
          },
          secondary: {
            label: "Secondary",
            color:
              "bg-blue-600/80 text-white hover:bg-blue-700/80 dark:bg-blue-700/80 dark:hover:bg-blue-800/80",
          },
          tertiary: {
            label: "Tertiary",
            color:
              "bg-purple-600/80 text-white hover:bg-purple-700/80 dark:bg-purple-700/80 dark:hover:bg-purple-800/80",
          },
          university: {
            label: "University",
            color:
              "bg-green-600/80 text-white hover:bg-green-700/80 dark:bg-green-700/80 dark:hover:bg-green-800/80",
          },
        };

        const levelInfo = levelMap[educationLevel as keyof typeof levelMap];
        const displayText = levelInfo?.label || capitalizeWords(educationLevel);
        const colorClass =
          levelInfo?.color ||
          "bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80";

        return <Badge className={colorClass}>{displayText}</Badge>;
      },
    },
    {
      id: "ownsEnterprise",
      header: "Enterprise Owner",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.ownsEnterprise,
      cell: ({ row }) => {
        const ownsEnterprise = row.original.ownsEnterprise === "yes";

        if (ownsEnterprise) {
          return (
            <Badge className="bg-emerald-600/80 text-white hover:bg-emerald-700/80 dark:bg-emerald-700/80 dark:hover:bg-emerald-800/80">
              ✓ Owner
            </Badge>
          );
        }

        return (
          <Badge className="border-gray-200 bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80">
            No Enterprise
          </Badge>
        );
      },
    },
    {
      id: "enterpriseName",
      header: "Enterprise Name",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.enterpriseName || "",
      cell: ({ row }) => {
        const enterpriseName = row.original.enterpriseName;
        const ownsEnterprise = row.original.ownsEnterprise === "yes";

        if (ownsEnterprise && enterpriseName) {
          return (
            <div
              className="max-w-[150px] truncate text-sm"
              title={enterpriseName}
            >
              {enterpriseName}
            </div>
          );
        }

        return <span className="text-muted-foreground text-sm">—</span>;
      },
    },
    {
      id: "vocationalSkillsParticipations",
      header: "Vocational Skills - Participations",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.vocationalSkillsParticipations?.length || 0,
      cell: ({ row }) => {
        const participations =
          row.original.vocationalSkillsParticipations || [];

        if (participations.length === 0) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }

        return (
          <div className="space-y-1">
            <Badge className="bg-blue-600/80 text-white hover:bg-blue-700/80 dark:bg-blue-700/80 dark:hover:bg-blue-800/80">
              {participations.length} Skills
            </Badge>
            <div className="max-w-[150px] text-xs">
              {participations.slice(0, 2).join(", ")}
              {participations.length > 2 &&
                ` +${participations.length - 2} more`}
            </div>
          </div>
        );
      },
    },
    {
      id: "vocationalSkillsCompletions",
      header: "Vocational Skills - Completions",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.vocationalSkillsCompletions?.length || 0,
      cell: ({ row }) => {
        const completions = row.original.vocationalSkillsCompletions || [];

        if (completions.length === 0) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }

        return (
          <div className="space-y-1">
            <Badge className="bg-green-600/80 text-white hover:bg-green-700/80 dark:bg-green-700/80 dark:hover:bg-green-800/80">
              {completions.length} Completed
            </Badge>
            <div
              className="max-w-[150px] truncate text-xs"
              title={
                completions.slice(0, 2).join(", ") +
                (completions.length > 2
                  ? ` +${completions.length - 2} more`
                  : "")
              }
            >
              {completions.slice(0, 2).join(", ")}
              {completions.length > 2 && ` +${completions.length - 2} more`}
            </div>
          </div>
        );
      },
    },
    {
      id: "vocationalSkillsCertifications",
      header: "Vocational Skills - Certifications",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.vocationalSkillsCertifications?.length || 0,
      cell: ({ row }) => {
        const certifications =
          row.original.vocationalSkillsCertifications || [];

        if (certifications.length === 0) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }

        return (
          <div className="space-y-1">
            <Badge className="bg-amber-600/80 text-white hover:bg-amber-700/80 dark:bg-amber-700/80 dark:hover:bg-amber-800/80">
              {certifications.length} Certified
            </Badge>
            <div
              className="max-w-[150px] truncate text-xs"
              title={
                certifications.slice(0, 2).join(", ") +
                (certifications.length > 2
                  ? ` +${certifications.length - 2} more`
                  : "")
              }
            >
              {certifications.slice(0, 2).join(", ")}
              {certifications.length > 2 &&
                ` +${certifications.length - 2} more`}
            </div>
          </div>
        );
      },
    },
    {
      id: "softSkillsParticipations",
      header: "Soft Skills - Participations",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.softSkillsParticipations?.length || 0,
      cell: ({ row }) => {
        const participations = row.original.softSkillsParticipations || [];

        if (participations.length === 0) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }

        return (
          <div className="space-y-1">
            <Badge className="bg-purple-600/80 text-white hover:bg-purple-700/80 dark:bg-purple-700/80 dark:hover:bg-purple-800/80">
              {participations.length} Skills
            </Badge>
            <div
              className="max-w-[150px] truncate text-xs"
              title={
                participations.slice(0, 2).join(", ") +
                (participations.length > 2
                  ? ` +${participations.length - 2} more`
                  : "")
              }
            >
              {participations.slice(0, 2).join(", ")}
              {participations.length > 2 &&
                ` +${participations.length - 2} more`}
            </div>
          </div>
        );
      },
    },
    {
      id: "softSkillsCompletions",
      header: "Soft Skills - Completions",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.softSkillsCompletions?.length || 0,
      cell: ({ row }) => {
        const completions = row.original.softSkillsCompletions || [];

        if (completions.length === 0) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }

        return (
          <div className="space-y-1">
            <Badge className="bg-indigo-600/80 text-white hover:bg-indigo-700/80 dark:bg-indigo-700/80 dark:hover:bg-indigo-800/80">
              {completions.length} Completed
            </Badge>
            <div
              className="max-w-[150px] truncate text-xs"
              title={
                completions.slice(0, 2).join(", ") +
                (completions.length > 2
                  ? ` +${completions.length - 2} more`
                  : "")
              }
            >
              {completions.slice(0, 2).join(", ")}
              {completions.length > 2 && ` +${completions.length - 2} more`}
            </div>
          </div>
        );
      },
    },
    {
      id: "softSkillsCertifications",
      header: "Soft Skills - Certifications",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.softSkillsCertifications?.length || 0,
      cell: ({ row }) => {
        const certifications = row.original.softSkillsCertifications || [];

        if (certifications.length === 0) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }

        return (
          <div className="space-y-1">
            <Badge className="bg-cyan-600/80 text-white hover:bg-cyan-700/80 dark:bg-cyan-700/80 dark:hover:bg-cyan-800/80">
              {certifications.length} Certified
            </Badge>
            <div
              className="max-w-[150px] truncate text-xs"
              title={
                certifications.slice(0, 2).join(", ") +
                (certifications.length > 2
                  ? ` +${certifications.length - 2} more`
                  : "")
              }
            >
              {certifications.slice(0, 2).join(", ")}
              {certifications.length > 2 &&
                ` +${certifications.length - 2} more`}
            </div>
          </div>
        );
      },
    },
    {
      id: "hasBusinessSkills",
      header: "Business Skills",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.hasBusinessSkills,
      cell: ({ row }) => {
        const hasSkills = row.original.hasBusinessSkills === "yes";
        return (
          <Badge
            variant={hasSkills ? "outline" : "outline"}
            className={
              hasSkills
                ? "bg-emerald-600/80 text-white hover:bg-emerald-700/80 dark:bg-emerald-700/80 dark:hover:bg-emerald-800/80"
                : "border-gray-200 bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80"
            }
          >
            {hasSkills ? "✓ Has Skills" : "No Skills"}
          </Badge>
        );
      },
    },
    {
      id: "isPWD",
      header: "PWD",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.isPWD,
      cell: ({ row }) => {
        const isPWD = row.original.isPWD === "yes";
        const disabilityType = row.original.disabilityType;

        if (isPWD) {
          return (
            <div className="space-y-1">
              <Badge className="bg-purple-600/80 text-white hover:bg-purple-700/80 dark:bg-purple-700/80 dark:hover:bg-purple-800/80">
                ✓ PWD
              </Badge>
              {disabilityType && (
                <div
                  className="text-muted-foreground max-w-[100px] truncate text-xs"
                  title={disabilityType}
                >
                  {capitalizeWords(disabilityType)}
                </div>
              )}
            </div>
          );
        }

        return (
          <Badge className="border-gray-200 bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80">
            No
          </Badge>
        );
      },
    },
    {
      id: "populationSegment",
      header: "Population Segment",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.populationSegment,
      cell: ({ row }) => {
        const segment = row.original.populationSegment;
        if (!segment) return "—";

        const segmentMap = {
          youth: {
            label: "Youth",
            color:
              "bg-green-600/80 text-white hover:bg-green-700/80 dark:bg-green-700/80 dark:hover:bg-green-800/80",
          },
          women: {
            label: "Women",
            color:
              "bg-pink-600/80 text-white hover:bg-pink-700/80 dark:bg-pink-700/80 dark:hover:bg-pink-800/80",
          },
          pwd: {
            label: "PWD",
            color:
              "bg-purple-600/80 text-white hover:bg-purple-700/80 dark:bg-purple-700/80 dark:hover:bg-purple-800/80",
          },
          elderly: {
            label: "Elderly",
            color:
              "bg-orange-600/80 text-white hover:bg-orange-700/80 dark:bg-orange-700/80 dark:hover:bg-orange-800/80",
          },
          refugee: {
            label: "Refugee",
            color:
              "bg-red-600/80 text-white hover:bg-red-700/80 dark:bg-red-700/80 dark:hover:bg-red-800/80",
          },
          host: {
            label: "Host",
            color:
              "bg-blue-600/80 text-white hover:bg-blue-700/80 dark:bg-blue-700/80 dark:hover:bg-blue-800/80",
          },
        };

        const segmentInfo = segmentMap[segment as keyof typeof segmentMap];
        const displayText = segmentInfo?.label || capitalizeWords(segment);
        const colorClass = segmentInfo?.color || "bg-gray-100 text-gray-800";

        return <Badge className={colorClass}>{displayText}</Badge>;
      },
    },
    {
      id: "monthlyIncome",
      header: "Monthly Income",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.monthlyIncome,
      cell: ({ row }) => {
        const income = row.original.monthlyIncome;
        if (!income || income === 0) return "—";

        // Format income with thousand separators
        const formattedIncome = new Intl.NumberFormat("en-UG", {
          style: "currency",
          currency: "UGX",
          minimumFractionDigits: 0,
        }).format(income);

        let colorClass =
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700";
        if (income < 100000) {
          colorClass =
            "bg-red-600/80 text-white hover:bg-red-700/80 dark:bg-red-700/80 dark:hover:bg-red-800/80";
        } else if (income < 500000) {
          colorClass =
            "bg-yellow-600/80 text-white hover:bg-yellow-700/80 dark:bg-yellow-700/80 dark:hover:bg-yellow-800/80";
        } else {
          colorClass =
            "bg-green-600/80 text-white hover:bg-green-700/80 dark:bg-green-700/80 dark:hover:bg-green-800/80";
        }

        return <Badge className={colorClass}>{formattedIncome}</Badge>;
      },
    },
    {
      id: "designation",
      header: "Designation",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => capitalizeWords(row.designation || ""),
      cell: ({ row }) => {
        const designation = capitalizeWords(row.original.designation || "");
        return (
          <div className="max-w-[150px] truncate" title={designation}>
            {designation || "—"}
          </div>
        );
      },
    },
    {
      id: "enterprise",
      header: "Enterprise",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => capitalizeWords(row.enterprise || ""),
      cell: ({ row }) => {
        const enterprise = capitalizeWords(row.original.enterprise || "");
        return (
          <div className="max-w-[150px] truncate" title={enterprise}>
            {enterprise || "—"}
          </div>
        );
      },
    },
    {
      id: "numberOfChildren",
      header: "Children",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.numberOfChildren,
      cell: ({ row }) => {
        const children = row.original.numberOfChildren;
        if (children === null || children === undefined) return "—";

        let colorClass =
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700";
        if (children === 0) {
          colorClass =
            "bg-blue-600/80 text-white hover:bg-blue-700/80 dark:bg-blue-700/80 dark:hover:bg-blue-800/80";
        } else if (children <= 2) {
          colorClass =
            "bg-green-600/80 text-white hover:bg-green-700/80 dark:bg-green-700/80 dark:hover:bg-green-800/80";
        } else if (children <= 4) {
          colorClass =
            "bg-yellow-600/80 text-white hover:bg-yellow-700/80 dark:bg-yellow-700/80 dark:hover:bg-yellow-800/80";
        } else {
          colorClass =
            "bg-red-600/80 text-white hover:bg-red-700/80 dark:bg-red-700/80 dark:hover:bg-red-800/80";
        }

        return <Badge className={colorClass}>{children}</Badge>;
      },
    },
    {
      id: "isActiveStudent",
      header: "Student",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.isActiveStudent,
      cell: ({ row }) => {
        const isStudent = row.original.isActiveStudent === "yes";
        return (
          <Badge
            className={
              isStudent
                ? "bg-indigo-600/80 text-white hover:bg-indigo-700/80 dark:bg-indigo-700/80 dark:hover:bg-indigo-800/80"
                : "border-gray-200 bg-gray-600/80 text-white hover:bg-gray-700/80 dark:bg-gray-700/80 dark:hover:bg-gray-800/80"
            }
          >
            {isStudent ? "✓ Student" : "Not Student"}
          </Badge>
        );
      },
    },
    {
      id: "isTeenMother",
      header: "Teen Mother",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.isTeenMother,
      cell: ({ row }) => {
        const isTeenMother = row.original.isTeenMother === "yes";
        if (!isTeenMother) return "—";
        return (
          <Badge className="bg-pink-600/80 text-white hover:bg-pink-700/80 dark:bg-pink-700/80 dark:hover:bg-pink-800/80">
            ✓ Teen Mother
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => (
        <ActionCell
          participant={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ),
    },
  ];
}
