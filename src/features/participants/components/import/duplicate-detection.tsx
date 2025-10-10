"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconUserCheck,
  IconUserX,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { type ParticipantFormValues } from "../participant-form";

export interface DuplicateMatch {
  importRow: ParticipantFormValues;
  existingParticipant: {
    id: string;
    firstName: string;
    lastName: string;
    contact: string;
    dateOfBirth: string | null;
    district: string | null;
    subCounty: string | null;
    created_at: string;
  };
  matchScore: number;
  matchReasons: string[];
}

export interface DuplicateAnalysisResult {
  exactDuplicates: DuplicateMatch[];
  potentialDuplicates: DuplicateMatch[];
  uniqueRecords: ParticipantFormValues[];
  skippedCount: number;
}

interface DuplicateDetectionProps {
  analysis: DuplicateAnalysisResult;
  onProceedWithSelection: (selectedRecords: ParticipantFormValues[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DuplicateDetection({
  analysis,
  onProceedWithSelection,
  onCancel,
  isLoading = false,
}: DuplicateDetectionProps) {
  const [selectedUniqueRecords, setSelectedUniqueRecords] = useState<
    Set<number>
  >(new Set(analysis.uniqueRecords.map((_, index) => index)));
  const [selectedPotentialDuplicates, setSelectedPotentialDuplicates] =
    useState<Set<number>>(new Set());

  const handleUniqueRecordToggle = (index: number) => {
    const newSet = new Set(selectedUniqueRecords);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedUniqueRecords(newSet);
  };

  const handlePotentialDuplicateToggle = (index: number) => {
    const newSet = new Set(selectedPotentialDuplicates);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedPotentialDuplicates(newSet);
  };

  const handleSelectAllUnique = () => {
    if (selectedUniqueRecords.size === analysis.uniqueRecords.length) {
      setSelectedUniqueRecords(new Set());
    } else {
      setSelectedUniqueRecords(
        new Set(analysis.uniqueRecords.map((_, index) => index))
      );
    }
  };

  const handleSelectAllPotential = () => {
    if (
      selectedPotentialDuplicates.size === analysis.potentialDuplicates.length
    ) {
      setSelectedPotentialDuplicates(new Set());
    } else {
      setSelectedPotentialDuplicates(
        new Set(analysis.potentialDuplicates.map((_, index) => index))
      );
    }
  };

  const handleProceed = () => {
    const recordsToImport: ParticipantFormValues[] = [];

    // Add selected unique records
    selectedUniqueRecords.forEach(index => {
      recordsToImport.push(analysis.uniqueRecords[index]);
    });

    // Add selected potential duplicates
    selectedPotentialDuplicates.forEach(index => {
      recordsToImport.push(analysis.potentialDuplicates[index].importRow);
    });

    onProceedWithSelection(recordsToImport);
  };

  const totalSelected =
    selectedUniqueRecords.size + selectedPotentialDuplicates.size;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <IconUserCheck className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm font-medium text-green-900">
                Unique Records
              </div>
              <div className="text-2xl font-bold text-green-700">
                {analysis.uniqueRecords.length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-sm font-medium text-yellow-900">
                Potential Duplicates
              </div>
              <div className="text-2xl font-bold text-yellow-700">
                {analysis.potentialDuplicates.length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <IconUserX className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-sm font-medium text-red-900">
                Exact Duplicates
              </div>
              <div className="text-2xl font-bold text-red-700">
                {analysis.exactDuplicates.length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <IconInfoCircle className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-blue-900">
                Will Import
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {totalSelected}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <IconInfoCircle className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Duplicate Detection Results
            </h4>
            <p className="mt-1 text-xs text-blue-700">
              We found {analysis.exactDuplicates.length} exact duplicates
              (automatically skipped) and {analysis.potentialDuplicates.length}{" "}
              potential duplicates. Review and select which records to import.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="unique" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unique" className="flex items-center gap-2">
            <IconUserCheck className="h-4 w-4" />
            Unique Records ({analysis.uniqueRecords.length})
          </TabsTrigger>
          <TabsTrigger value="potential" className="flex items-center gap-2">
            <IconAlertTriangle className="h-4 w-4" />
            Potential Duplicates ({analysis.potentialDuplicates.length})
          </TabsTrigger>
          <TabsTrigger value="exact" className="flex items-center gap-2">
            <IconUserX className="h-4 w-4" />
            Exact Duplicates ({analysis.exactDuplicates.length})
          </TabsTrigger>
        </TabsList>

        {/* Unique Records Tab */}
        <TabsContent value="unique" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                New Records ({analysis.uniqueRecords.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllUnique}
              >
                {selectedUniqueRecords.size === analysis.uniqueRecords.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Import</TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[100px]">Contact</TableHead>
                    <TableHead className="min-w-[120px]">
                      Date of Birth
                    </TableHead>
                    <TableHead className="min-w-[100px]">District</TableHead>
                    <TableHead className="min-w-[120px]">Subcounty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.uniqueRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUniqueRecords.has(index)}
                          onCheckedChange={() =>
                            handleUniqueRecordToggle(index)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.firstName} {record.lastName}
                      </TableCell>
                      <TableCell>{record.contact || "—"}</TableCell>
                      <TableCell>
                        {record.dateOfBirth ? (
                          new Date(record.dateOfBirth).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>{record.district}</TableCell>
                      <TableCell>{record.subCounty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Potential Duplicates Tab */}
        <TabsContent value="potential" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Potential Duplicates ({analysis.potentialDuplicates.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllPotential}
              >
                {selectedPotentialDuplicates.size ===
                analysis.potentialDuplicates.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="space-y-4">
              {analysis.potentialDuplicates.map((duplicate, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedPotentialDuplicates.has(index)}
                      onCheckedChange={() =>
                        handlePotentialDuplicateToggle(index)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          Match Score: {duplicate.matchScore}%
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {duplicate.matchReasons.map((reason, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Import Record */}
                        <div className="rounded border border-blue-200 bg-blue-50 p-3">
                          <h4 className="mb-2 text-sm font-medium text-blue-900">
                            New Record
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div>
                              <strong>Name:</strong>{" "}
                              {duplicate.importRow.firstName}{" "}
                              {duplicate.importRow.lastName}
                            </div>
                            <div>
                              <strong>Contact:</strong>{" "}
                              {duplicate.importRow.contact || "—"}
                            </div>
                            <div>
                              <strong>DOB:</strong>{" "}
                              {duplicate.importRow.dateOfBirth || "—"}
                            </div>
                            <div>
                              <strong>Location:</strong>{" "}
                              {duplicate.importRow.district},{" "}
                              {duplicate.importRow.subCounty}
                            </div>
                          </div>
                        </div>

                        {/* Existing Record */}
                        <div className="rounded border border-gray-200 bg-gray-50 p-3">
                          <h4 className="mb-2 text-sm font-medium text-gray-900">
                            Existing Record
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div>
                              <strong>Name:</strong>{" "}
                              {duplicate.existingParticipant.firstName}{" "}
                              {duplicate.existingParticipant.lastName}
                            </div>
                            <div>
                              <strong>Contact:</strong>{" "}
                              {duplicate.existingParticipant.contact || "—"}
                            </div>
                            <div>
                              <strong>DOB:</strong>{" "}
                              {duplicate.existingParticipant.dateOfBirth || "—"}
                            </div>
                            <div>
                              <strong>Location:</strong>{" "}
                              {duplicate.existingParticipant.district ??
                                "Unknown"}
                              ,{" "}
                              {duplicate.existingParticipant.subCounty ??
                                "Unknown"}
                            </div>
                            <div>
                              <strong>Created:</strong>{" "}
                              {new Date(
                                duplicate.existingParticipant.created_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Exact Duplicates Tab */}
        <TabsContent value="exact" className="mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Exact Duplicates ({analysis.exactDuplicates.length}) -
              Automatically Skipped
            </h3>

            <div className="space-y-4">
              {analysis.exactDuplicates.map((duplicate, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Exact Match</Badge>
                      <span className="text-sm text-red-700">
                        This record will be skipped
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Import Record */}
                      <div className="rounded border border-blue-200 bg-blue-50 p-3">
                        <h4 className="mb-2 text-sm font-medium text-blue-900">
                          Import Record
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <strong>Name:</strong>{" "}
                            {duplicate.importRow.firstName}{" "}
                            {duplicate.importRow.lastName}
                          </div>
                          <div>
                            <strong>Contact:</strong>{" "}
                            {duplicate.importRow.contact || "—"}
                          </div>
                          <div>
                            <strong>DOB:</strong>{" "}
                            {duplicate.importRow.dateOfBirth || "—"}
                          </div>
                          <div>
                            <strong>Location:</strong>{" "}
                            {duplicate.importRow.district},{" "}
                            {duplicate.importRow.subCounty}
                          </div>
                        </div>
                      </div>

                      {/* Existing Record */}
                      <div className="rounded border border-gray-200 bg-gray-50 p-3">
                        <h4 className="mb-2 text-sm font-medium text-gray-900">
                          Existing Record
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <strong>Name:</strong>{" "}
                            {duplicate.existingParticipant.firstName}{" "}
                            {duplicate.existingParticipant.lastName}
                          </div>
                          <div>
                            <strong>Contact:</strong>{" "}
                            {duplicate.existingParticipant.contact || "—"}
                          </div>
                          <div>
                            <strong>DOB:</strong>{" "}
                            {duplicate.existingParticipant.dateOfBirth || "—"}
                          </div>
                          <div>
                            <strong>Location:</strong>{" "}
                            {duplicate.existingParticipant.district ??
                              "Unknown"}
                            ,{" "}
                            {duplicate.existingParticipant.subCounty ??
                              "Unknown"}
                          </div>
                          <div>
                            <strong>Created:</strong>{" "}
                            {new Date(
                              duplicate.existingParticipant.created_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-600">
          Selected: {totalSelected} records | Skipped:{" "}
          {analysis.exactDuplicates.length} exact duplicates
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={totalSelected === 0 || isLoading}
          >
            {isLoading ? "Importing..." : `Import ${totalSelected} Records`}
          </Button>
        </div>
      </div>
    </div>
  );
}
