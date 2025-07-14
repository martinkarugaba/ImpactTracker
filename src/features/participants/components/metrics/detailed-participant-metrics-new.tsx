import { type Participant } from "../../types/types";
import { useParticipantMetrics } from "./hooks/use-participant-metrics";
import { CompactMetricCard } from "@/components/ui/compact-metric-card";
import {
  Users,
  UserCheck,
  CircleUser,
  Gauge,
  Calendar,
  CalendarRange,
  UserPlus,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DetailedParticipantMetricsProps {
  participants: Participant[];
  isLoading: boolean;
  onFilterChange: (filter: {
    type: "gender" | "age" | "disability" | "all";
    value: string;
  }) => void;
  activeFilters: {
    gender?: string;
    age?: string;
    disability?: boolean;
  };
}

export function DetailedParticipantMetrics({
  participants,
  isLoading,
  onFilterChange,
  activeFilters,
}: DetailedParticipantMetricsProps) {
  // Get all metrics using the hook
  const metrics = useParticipantMetrics(participants);

  const {
    totalParticipants,
    totalFemales,
    totalMales,
    femalePercent,
    malePercent,
    femalesYoung,
    femalesOlder,
    malesYoung,
    malesOlder,
    youngFemalePercent,
    olderFemalePercent,
    youngMalePercent,
    olderMalePercent,
    disabled,
    disabledMales,
    disabledFemales,
    disabledPercent,
    disabledMalePercent,
    disabledFemalePercent,
    formatPercent,
  } = metrics;

  const hasActiveFilters =
    activeFilters.gender || activeFilters.age || activeFilters.disability;

  // Get current filter values for display
  const getCurrentGender = () => {
    if (activeFilters.gender === "female") return "Female";
    if (activeFilters.gender === "male") return "Male";
    return "All";
  };

  const getCurrentAgeGroup = () => {
    if (activeFilters.age?.includes("young")) return "Young (≤30)";
    if (activeFilters.age?.includes("older")) return "Older (>30)";
    return "All";
  };

  const getCurrentDisability = () => {
    if (activeFilters.disability === true) return "PWD Only";
    return "All";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Filter Controls Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Participant Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilterChange({ type: "all", value: "clear" })}
              className="text-muted-foreground h-8"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">
              Gender
            </label>
            <Select
              value={activeFilters.gender || "all"}
              onValueChange={value => {
                if (value === "all") {
                  onFilterChange({ type: "all", value: "clear" });
                } else {
                  onFilterChange({ type: "gender", value });
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age Group Filter */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">
              Age Group
            </label>
            <Select
              value={
                activeFilters.age?.includes("young")
                  ? "young"
                  : activeFilters.age?.includes("older")
                    ? "older"
                    : "all"
              }
              onValueChange={value => {
                if (value === "all") {
                  onFilterChange({ type: "all", value: "clear" });
                } else {
                  const gender = activeFilters.gender || "female";
                  onFilterChange({
                    type: "age",
                    value: `${value}-${gender}`,
                  });
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="young">Young (≤30)</SelectItem>
                <SelectItem value="older">Older (&gt;30)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Disability Filter */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">
              Disability Status
            </label>
            <Select
              value={activeFilters.disability === true ? "pwd" : "all"}
              onValueChange={value => {
                if (value === "all") {
                  onFilterChange({ type: "all", value: "clear" });
                } else {
                  onFilterChange({ type: "disability", value: "all" });
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select disability status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="pwd">PWD Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Active filters:
            </span>
            {activeFilters.gender && (
              <Badge variant="secondary" className="text-xs">
                Gender: {getCurrentGender()}
              </Badge>
            )}
            {activeFilters.age && (
              <Badge variant="secondary" className="text-xs">
                Age: {getCurrentAgeGroup()}
              </Badge>
            )}
            {activeFilters.disability && (
              <Badge variant="secondary" className="text-xs">
                Status: {getCurrentDisability()}
              </Badge>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Metrics Display */}
      <div className="space-y-6">
        {/* Primary Metrics */}
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-medium">
            Overview
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CompactMetricCard
              title="Total Participants"
              value={totalParticipants}
              isLoading={isLoading}
              icon={<Users size={16} />}
              iconColor="text-primary"
            />

            <CompactMetricCard
              title="Female"
              count={totalFemales}
              percent={formatPercent(femalePercent)}
              isLoading={isLoading}
              icon={<UserCheck size={16} />}
              iconColor="text-pink-500"
            />

            <CompactMetricCard
              title="Male"
              count={totalMales}
              percent={formatPercent(malePercent)}
              isLoading={isLoading}
              icon={<CircleUser size={16} />}
              iconColor="text-blue-500"
            />

            <CompactMetricCard
              title="PWD"
              count={disabled.length}
              percent={formatPercent(disabledPercent)}
              isLoading={isLoading}
              icon={<Gauge size={16} />}
              iconColor="text-purple-500"
            />
          </div>
        </div>

        {/* Age Demographics */}
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-medium">
            Age Demographics
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CompactMetricCard
              title="Young Women (≤30)"
              count={femalesYoung.length}
              percent={formatPercent(youngFemalePercent)}
              isLoading={isLoading}
              icon={<Calendar size={16} />}
              iconColor="text-pink-500"
            />

            <CompactMetricCard
              title="Older Women (&gt;30)"
              count={femalesOlder.length}
              percent={formatPercent(olderFemalePercent)}
              isLoading={isLoading}
              icon={<CalendarRange size={16} />}
              iconColor="text-pink-500"
            />

            <CompactMetricCard
              title="Young Men (≤30)"
              count={malesYoung.length}
              percent={formatPercent(youngMalePercent)}
              isLoading={isLoading}
              icon={<Calendar size={16} />}
              iconColor="text-blue-500"
            />

            <CompactMetricCard
              title="Older Men (&gt;30)"
              count={malesOlder.length}
              percent={formatPercent(olderMalePercent)}
              isLoading={isLoading}
              icon={<CalendarRange size={16} />}
              iconColor="text-blue-500"
            />
          </div>
        </div>

        {/* Disability Demographics */}
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-medium">
            Disability Demographics
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CompactMetricCard
              title="PWD Total"
              count={disabled.length}
              percent={formatPercent(disabledPercent)}
              isLoading={isLoading}
              icon={<Gauge size={16} />}
              iconColor="text-purple-500"
            />

            <CompactMetricCard
              title="Women with Disability"
              count={disabledFemales.length}
              percent={formatPercent(disabledFemalePercent)}
              isLoading={isLoading}
              icon={<UserPlus size={16} />}
              iconColor="text-pink-500"
            />

            <CompactMetricCard
              title="Men with Disability"
              count={disabledMales.length}
              percent={formatPercent(disabledMalePercent)}
              isLoading={isLoading}
              icon={<User size={16} />}
              iconColor="text-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
