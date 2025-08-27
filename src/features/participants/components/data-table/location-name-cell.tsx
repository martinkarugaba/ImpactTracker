"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDistrictName,
  getSubCountyName,
  getCountryName,
} from "../../actions/location-lookup";

export enum LocationType {
  District = "district",
  SubCounty = "subCounty",
  Country = "country",
}

type LocationNameCellProps = {
  id: string;
  type: LocationType;
  fallbackValue?: string;
  className?: string;
};

export function LocationNameCell({
  id,
  type,
  fallbackValue = "—",
  className = "max-w-[200px] truncate",
}: LocationNameCellProps) {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) {
      setName(fallbackValue);
      setIsLoading(false);
      return;
    }

    // Check if it's already a name (not a UUID)
    if (!id.includes("-")) {
      setName(formatLocationName(id));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch the location name based on type
    const fetchLocationName = async () => {
      try {
        let result;

        switch (type) {
          case LocationType.District:
            result = await getDistrictName(id);
            break;
          case LocationType.SubCounty:
            result = await getSubCountyName(id);
            break;
          case LocationType.Country:
            result = await getCountryName(id);
            break;
          default:
            result = null;
        }

        if (result?.name) {
          setName(formatLocationName(result.name));
        } else {
          setName(fallbackValue);
        }
      } catch (error) {
        console.error(`Error fetching ${type} name:`, error);
        setName(fallbackValue);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationName();
  }, [id, type, fallbackValue]);

  if (isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  return (
    <div className={className} title={name || fallbackValue}>
      {name || fallbackValue}
    </div>
  );
}

// Helper function to format location name with proper capitalization
function formatLocationName(name: string): string {
  if (!name) return "";

  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
