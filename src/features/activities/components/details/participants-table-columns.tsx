import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, Phone, Edit, MessageSquare } from "lucide-react";
import { ActivityParticipant } from "../../types/types";

// Helper function to format phone numbers with leading zero
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "Not provided";

  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // If it's a Ugandan number (starts with 7, 6, or 5) and doesn't have country code
  if (cleaned.length === 9 && /^[756]/.test(cleaned)) {
    return `0${cleaned}`;
  }

  // If it already starts with 0
  if (cleaned.startsWith("0")) {
    return cleaned;
  }

  // If it has country code (256)
  if (cleaned.startsWith("256")) {
    return `0${cleaned.slice(3)}`;
  }

  // Return as is if we can't determine format
  return phone;
};

// Helper function to capitalize names
const capitalizeName = (name: string | null | undefined): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "attended":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "absent":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700";
    case "invited":
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "facilitator":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
    case "organizer":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
    case "speaker":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
    case "moderator":
      return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800";
    case "observer":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700";
    case "participant":
    default:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
  }
};

// Helper function to get sex color
const getSexColor = (sex: string) => {
  switch (sex?.toLowerCase()) {
    case "male":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "female":
      return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
};

// Helper function to format income
const formatIncome = (income: number | null | undefined): string => {
  if (!income || income === 0) return "Not specified";
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(income);
};

// Helper function to format employment status
const formatEmploymentStatus = (status: string | null | undefined): string => {
  if (!status) return "Not available";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, " ");
};

// Extended participant type to handle potentially missing fields
type ExtendedParticipant = {
  id: string;
  firstName: string;
  lastName: string;
  contact: string;
  designation: string;
  organizationName?: string;
  sex?: string;
  age?: number;
  enterprise?: string;
  employmentStatus?: string;
  monthlyIncome?: number;
};

interface ParticipantsTableColumnsProps {
  onEditParticipant?: (participant: ActivityParticipant) => void;
  onAddFeedback?: (participant: ActivityParticipant) => void;
}

export const createParticipantsTableColumns = ({
  onEditParticipant,
  onAddFeedback,
}: ParticipantsTableColumnsProps = {}): ColumnDef<ActivityParticipant>[] => [
  {
    accessorKey: "participantName",
    header: "Name",
    cell: ({ row }) => {
      const participant = row.original;
      const fullName = participant.participantName || "Unknown Participant";

      return (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {capitalizeName(fullName)}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "participantContact",
    header: "Contact",
    cell: ({ row }) => {
      const participant = row.original;
      const contact =
        participant.participant?.contact || participant.participantEmail;

      return (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatPhoneNumber(contact)}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "participant.sex",
    header: "Sex",
    cell: ({ row }) => {
      const participant = row.original.participant as ExtendedParticipant;
      const sex = participant?.sex || "Not available";
      return (
        <Badge variant="outline" className={getSexColor(sex)}>
          {sex === "Not available"
            ? sex
            : sex?.charAt(0).toUpperCase() + sex?.slice(1)}
        </Badge>
      );
    },
    enableSorting: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "participant.age",
    header: "Age",
    cell: ({ row }) => {
      const participant = row.original.participant as ExtendedParticipant;
      const age = participant?.age;
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {age ? `${age} years` : "Not available"}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "participant.enterprise",
    header: "Enterprise",
    cell: ({ row }) => {
      const participant = row.original.participant as ExtendedParticipant;
      const enterprise = participant?.enterprise || "Not available";
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
        >
          {enterprise}
        </Badge>
      );
    },
    enableSorting: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "participant.employmentStatus",
    header: "Employment",
    cell: ({ row }) => {
      const participant = row.original.participant as ExtendedParticipant;
      const status = participant?.employmentStatus;
      return <Badge variant="outline">{formatEmploymentStatus(status)}</Badge>;
    },
    enableSorting: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "participant.monthlyIncome",
    header: "Income",
    cell: ({ row }) => {
      const participant = row.original.participant as ExtendedParticipant;
      const income = participant?.monthlyIncome;
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatIncome(income)}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant="outline" className={getRoleColor(role)}>
          {role?.charAt(0).toUpperCase() + role?.slice(1).replace("_", " ")}
        </Badge>
      );
    },
    enableSorting: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "attendance_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("attendance_status") as string;
      return (
        <Badge variant="outline" className={getStatusColor(status)}>
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Badge>
      );
    },
    enableSorting: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "feedback",
    header: "Feedback",
    cell: ({ row }) => {
      const feedback = row.getValue("feedback") as string;
      return (
        <div className="max-w-xs">
          {feedback ? (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {feedback.length > 50
                ? `${feedback.substring(0, 50)}...`
                : feedback}
            </span>
          ) : (
            <span className="text-sm text-gray-400 italic dark:text-gray-500">
              No feedback
            </span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const participant = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEditParticipant && (
              <DropdownMenuItem
                onClick={() => onEditParticipant(participant)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit participant
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>Update status</DropdownMenuItem>
            {onAddFeedback && (
              <DropdownMenuItem
                onClick={() => onAddFeedback(participant)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Add feedback
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Remove participant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Default export for backward compatibility
export const participantsTableColumns = createParticipantsTableColumns();
