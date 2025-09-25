"use client";

import { useAtomValue, useSetAtom } from "jotai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  participantFiltersAtom,
  updateFilterAtom,
} from "../../../atoms/participants-atoms";
import { type ParticipantFilters as ParticipantFiltersType } from "../../../types/types";

interface AdvancedFiltersProps {
  isLoading?: boolean;
}

export function AdvancedFilters({ isLoading = false }: AdvancedFiltersProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);

  const handleFilterUpdate = (
    key: keyof ParticipantFiltersType,
    value: string
  ) => {
    updateFilter({ key, value });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Advanced Filters
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Income Range */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Monthly Income
          </label>
          <Select
            value={filters.monthlyIncomeRange}
            onValueChange={value =>
              handleFilterUpdate("monthlyIncomeRange", value)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Income range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Income Levels</SelectItem>
              <SelectItem value="0-500000">UGX 0 - 500K</SelectItem>
              <SelectItem value="500000-1000000">UGX 500K - 1M</SelectItem>
              <SelectItem value="1000000-2000000">UGX 1M - 2M</SelectItem>
              <SelectItem value="2000000+">UGX 2M+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Children Range */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Number of Children
          </label>
          <Select
            value={filters.numberOfChildrenRange}
            onValueChange={value =>
              handleFilterUpdate("numberOfChildrenRange", value)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Children count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Number</SelectItem>
              <SelectItem value="0">No Children</SelectItem>
              <SelectItem value="1-2">1-2 Children</SelectItem>
              <SelectItem value="3-5">3-5 Children</SelectItem>
              <SelectItem value="6+">6+ Children</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Training Count Range */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Training Count
          </label>
          <Select
            value={filters.noOfTrainingsRange}
            onValueChange={value =>
              handleFilterUpdate("noOfTrainingsRange", value)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Training count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Count</SelectItem>
              <SelectItem value="0">No Training</SelectItem>
              <SelectItem value="1-2">1-2 Trainings</SelectItem>
              <SelectItem value="3-5">3-5 Trainings</SelectItem>
              <SelectItem value="6+">6+ Trainings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employment Type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Employment Type
          </label>
          <Select
            value={filters.employmentType || "all"}
            onValueChange={value => handleFilterUpdate("employmentType", value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="informal">Informal</SelectItem>
              <SelectItem value="self-employed">Self-Employed</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Inclusion Section */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Financial Inclusion
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Accessed Loans */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Accessed Loans
            </label>
            <Select
              value={filters.accessedLoans || "all"}
              onValueChange={value =>
                handleFilterUpdate("accessedLoans", value)
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Loan access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="yes">Has Accessed Loans</SelectItem>
                <SelectItem value="no">No Loan Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Individual Saving */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Individual Saving
            </label>
            <Select
              value={filters.individualSaving || "all"}
              onValueChange={value =>
                handleFilterUpdate("individualSaving", value)
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Individual saving" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="yes">Has Individual Savings</SelectItem>
                <SelectItem value="no">No Individual Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group Saving */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Group Saving
            </label>
            <Select
              value={filters.groupSaving || "all"}
              onValueChange={value => handleFilterUpdate("groupSaving", value)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Group saving" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="yes">Has Group Savings</SelectItem>
                <SelectItem value="no">No Group Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
