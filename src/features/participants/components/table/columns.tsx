"use client";

import { type ColumnDef, type Table, type Row } from "@tanstack/react-table";
import { type Participant } from "../../types/types";
import { type LocationNames } from "../../hooks/use-location-names";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { capitalizeWords, calculateAge, formatContact } from "@/lib/utils";
import {
  User,
  UserCheck,
  MapPin,
  Building2,
  FolderOpen,
  Phone,
  Briefcase,
  Store,
  Users,
  Flag,
} from "lucide-react";
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
      header: () => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Name
        </div>
      ),
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
      header: () => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Gender
        </div>
      ),
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
      header: () => (
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Age
        </div>
      ),
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
      id: "district",
      header: () => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          District
        </div>
      ),
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
      id: "subCounty",
      header: () => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Sub County
        </div>
      ),
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
          <div
            className="text-muted-foreground max-w-[200px] truncate"
            title={capitalizedName}
          >
            {capitalizedName}
          </div>
        );
      },
    },
    {
      id: "country",
      header: () => (
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Country
        </div>
      ),
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => {
        const countryId = row.country;
        return locationNames?.countries[countryId] || countryId || "—";
      },
      cell: ({ row }) => {
        const countryId = row.original.country;
        const countryName =
          locationNames?.countries[countryId] || countryId || "—";

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              {countryName}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "organization",
      header: () => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Organization
        </div>
      ),
      enableHiding: true,
      enableSorting: true,
      accessorFn: row => row.organizationName || row.organization_id,
      cell: ({ row }) => {
        const name =
          row.original.organizationName || row.original.organization_id;
        const acronym = name
          .split(/\s+/)
          .map(word => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 3);

        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {acronym}
            </div>
            <div className="max-w-[150px] truncate text-sm" title={name}>
              {name}
            </div>
          </div>
        );
      },
    },
    {
      id: "project",
      header: () => (
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Project
        </div>
      ),
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
      accessorKey: "designation",
      header: () => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Designation
        </div>
      ),
      enableHiding: true,
      enableSorting: true,
      cell: ({ row }) => {
        const designation = row.original.designation;
        if (!designation) return "—";

        return (
          <Badge variant="outline" className="max-w-[150px] truncate">
            {designation}
          </Badge>
        );
      },
    },
    {
      accessorKey: "enterprise",
      header: () => (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          Enterprise
        </div>
      ),
      enableHiding: true,
      enableSorting: true,
      cell: ({ row }) => {
        const enterprise = row.original.enterprise;
        if (!enterprise) return "—";

        return (
          <div className="flex items-center gap-2">
            <div className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {enterprise}
            </div>
          </div>
        );
      },
    },
    {
      id: "contact",
      header: () => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Contact
        </div>
      ),
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
