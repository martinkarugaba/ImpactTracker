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
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              M
            </Badge>
          );
        }

        if (isFemale) {
          return (
            <Badge
              variant="secondary"
              className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
            >
              F
            </Badge>
          );
        }

        return <Badge variant="outline">{sex.charAt(0).toUpperCase()}</Badge>;
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
          variant = "secondary";
          className =
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        } else if (ageNum <= 50) {
          variant = "secondary";
          className =
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        } else {
          variant = "secondary";
          className =
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
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
            <div className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded text-xs">
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
            variant="secondary"
            className="bg-purple-100 font-mono text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200"
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
              variant="secondary"
              className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
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
            color: "bg-green-100 text-green-800",
          },
          unemployed: {
            label: "Unemployed",
            color: "bg-red-100 text-red-800",
          },
          "self-employed": {
            label: "Self-Employed",
            color: "bg-blue-100 text-blue-800",
          },
          student: {
            label: "Student",
            color: "bg-purple-100 text-purple-800",
          },
          retired: {
            label: "Retired",
            color: "bg-gray-100 text-gray-800",
          },
        };

        const statusInfo =
          statusMap[employmentStatus as keyof typeof statusMap];

        if (!statusInfo) {
          return (
            <Badge variant="outline" className="max-w-[150px] truncate">
              {capitalizeWords(employmentStatus)}
            </Badge>
          );
        }

        return (
          <Badge
            variant="secondary"
            className={`${statusInfo.color} max-w-[150px] truncate`}
          >
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      id: "isSubscribedToVSLA",
      header: "VSLA",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.isSubscribedToVSLA,
      cell: ({ row }) => {
        const isSubscribed = row.original.isSubscribedToVSLA === "yes";
        const vslaName = row.original.vslaName;

        if (isSubscribed) {
          return (
            <div className="space-y-1">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ✓ Subscribed
              </Badge>
              {vslaName && (
                <div className="text-muted-foreground max-w-[100px] truncate text-xs">
                  {vslaName}
                </div>
              )}
            </div>
          );
        }

        return (
          <Badge variant="outline" className="text-gray-600">
            Not Subscribed
          </Badge>
        );
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
          single: { label: "Single", color: "bg-blue-100 text-blue-800" },
          married: { label: "Married", color: "bg-green-100 text-green-800" },
          divorced: {
            label: "Divorced",
            color: "bg-orange-100 text-orange-800",
          },
          widowed: { label: "Widowed", color: "bg-gray-100 text-gray-800" },
        };

        const statusInfo = statusMap[maritalStatus as keyof typeof statusMap];
        const displayText = statusInfo?.label || capitalizeWords(maritalStatus);
        const colorClass = statusInfo?.color || "bg-gray-100 text-gray-800";

        return (
          <Badge variant="secondary" className={colorClass}>
            {displayText}
          </Badge>
        );
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
          none: { label: "None", color: "bg-red-100 text-red-800" },
          primary: { label: "Primary", color: "bg-yellow-100 text-yellow-800" },
          secondary: { label: "Secondary", color: "bg-blue-100 text-blue-800" },
          tertiary: {
            label: "Tertiary",
            color: "bg-purple-100 text-purple-800",
          },
          university: {
            label: "University",
            color: "bg-green-100 text-green-800",
          },
        };

        const levelInfo = levelMap[educationLevel as keyof typeof levelMap];
        const displayText = levelInfo?.label || capitalizeWords(educationLevel);
        const colorClass = levelInfo?.color || "bg-gray-100 text-gray-800";

        return (
          <Badge variant="secondary" className={colorClass}>
            {displayText}
          </Badge>
        );
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
        const enterpriseName = row.original.enterpriseName;
        const enterpriseSector = row.original.enterpriseSector;

        if (ownsEnterprise) {
          return (
            <div className="space-y-1">
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800"
              >
                ✓ Owner
              </Badge>
              {enterpriseName && (
                <div
                  className="text-muted-foreground max-w-[100px] truncate text-xs"
                  title={enterpriseName}
                >
                  {enterpriseName}
                </div>
              )}
              {enterpriseSector && (
                <div className="text-muted-foreground text-xs">
                  {capitalizeWords(enterpriseSector)}
                </div>
              )}
            </div>
          );
        }

        return (
          <Badge variant="outline" className="text-gray-600">
            No Enterprise
          </Badge>
        );
      },
    },
    {
      id: "hasVocationalSkills",
      header: "Vocational Skills",
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.hasVocationalSkills,
      cell: ({ row }) => {
        const hasSkills = row.original.hasVocationalSkills === "yes";
        const participations = row.original.vocationalSkillsParticipations || 0;
        const completions = row.original.vocationalSkillsCompletions || 0;

        if (hasSkills) {
          return (
            <div className="space-y-1">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ✓ Has Skills
              </Badge>
              {(participations > 0 || completions > 0) && (
                <div className="text-muted-foreground text-xs">
                  {participations}P / {completions}C
                </div>
              )}
            </div>
          );
        }

        return (
          <Badge variant="outline" className="text-gray-600">
            No Skills
          </Badge>
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
            variant={hasSkills ? "secondary" : "outline"}
            className={
              hasSkills ? "bg-blue-100 text-blue-800" : "text-gray-600"
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
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800"
              >
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
          <Badge variant="outline" className="text-gray-600">
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
          youth: { label: "Youth", color: "bg-green-100 text-green-800" },
          women: { label: "Women", color: "bg-pink-100 text-pink-800" },
          pwd: { label: "PWD", color: "bg-purple-100 text-purple-800" },
          elderly: { label: "Elderly", color: "bg-orange-100 text-orange-800" },
          refugee: { label: "Refugee", color: "bg-red-100 text-red-800" },
          host: { label: "Host", color: "bg-blue-100 text-blue-800" },
        };

        const segmentInfo = segmentMap[segment as keyof typeof segmentMap];
        const displayText = segmentInfo?.label || capitalizeWords(segment);
        const colorClass = segmentInfo?.color || "bg-gray-100 text-gray-800";

        return (
          <Badge variant="secondary" className={colorClass}>
            {displayText}
          </Badge>
        );
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

        let colorClass = "bg-gray-100 text-gray-800";
        if (income < 100000) {
          colorClass = "bg-red-100 text-red-800";
        } else if (income < 500000) {
          colorClass = "bg-yellow-100 text-yellow-800";
        } else {
          colorClass = "bg-green-100 text-green-800";
        }

        return (
          <Badge variant="secondary" className={colorClass}>
            {formattedIncome}
          </Badge>
        );
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

        let colorClass = "bg-gray-100 text-gray-800";
        if (children === 0) {
          colorClass = "bg-blue-100 text-blue-800";
        } else if (children <= 2) {
          colorClass = "bg-green-100 text-green-800";
        } else if (children <= 4) {
          colorClass = "bg-yellow-100 text-yellow-800";
        } else {
          colorClass = "bg-red-100 text-red-800";
        }

        return (
          <Badge variant="secondary" className={colorClass}>
            {children}
          </Badge>
        );
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
            variant={isStudent ? "secondary" : "outline"}
            className={
              isStudent ? "bg-indigo-100 text-indigo-800" : "text-gray-600"
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
          <Badge variant="secondary" className="bg-pink-100 text-pink-800">
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
