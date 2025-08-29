"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { type MembersFilters } from "../actions/members";

interface MembersFiltersProps {
  filters: MembersFilters;
  onFiltersChange: (filters: MembersFilters) => void;
  isLoading: boolean;
}

const DISTRICTS = [
  "Kampala",
  "Wakiso",
  "Mukono",
  "Jinja",
  "Entebbe",
  "Mbarara",
  "Gulu",
  "Lira",
  "Arua",
  "Fort Portal",
  "Masaka",
  "Soroti",
  "Mbale",
  "Kasese",
  "Kabale",
  "Hoima",
  "Kitgum",
  "Moroto",
  "Adjumani",
  "Apac",
];

const COUNTRIES = [
  "Uganda",
  "Kenya",
  "Tanzania",
  "Rwanda",
  "Burundi",
  "South Sudan",
  "DRC",
];

export function MembersFilters({
  filters,
  onFiltersChange,
  isLoading,
}: MembersFiltersProps) {
  const handleFilterChange = (key: keyof MembersFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value && value !== ""
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search organizations..."
            value={filters.search || ""}
            onChange={e => handleFilterChange("search", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* District */}
        <div className="space-y-2">
          <Label>District</Label>
          <Select
            value={filters.district || "all"}
            onValueChange={value =>
              handleFilterChange("district", value === "all" ? "" : value)
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {DISTRICTS.map(district => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label>Country</Label>
          <Select
            value={filters.country || "all"}
            onValueChange={value =>
              handleFilterChange("country", value === "all" ? "" : value)
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {COUNTRIES.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
