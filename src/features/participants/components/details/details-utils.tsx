"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0]?.toUpperCase() || ""}${lastName?.[0]?.toUpperCase() || ""}`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getStatusBadge = (
  status: string,
  type: "boolean" | "status" = "boolean"
) => {
  if (type === "boolean") {
    const isYes = status.toLowerCase() === "yes";
    return (
      <Badge
        variant={isYes ? "default" : "secondary"}
        className={
          isYes
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }
      >
        {isYes ? (
          <CheckCircle className="mr-1 h-3 w-3" />
        ) : (
          <XCircle className="mr-1 h-3 w-3" />
        )}
        {isYes ? "Yes" : "No"}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="capitalize">
      {status}
    </Badge>
  );
};

export const getGenderBadge = (sex: string) => {
  const isMale = sex.toLowerCase() === "male" || sex.toLowerCase() === "m";
  const isFemale = sex.toLowerCase() === "female" || sex.toLowerCase() === "f";

  if (isMale) {
    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Male
      </Badge>
    );
  }

  if (isFemale) {
    return (
      <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
        Female
      </Badge>
    );
  }

  return <Badge variant="outline">{sex}</Badge>;
};

export const getAgeBadge = (age: number | null) => {
  if (age === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Age Unknown
      </Badge>
    );
  }

  let className = "";

  if (age <= 35) {
    className =
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  } else if (age <= 50) {
    className =
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  } else {
    className =
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  }

  return (
    <Badge variant="secondary" className={className}>
      {age} years old
    </Badge>
  );
};
