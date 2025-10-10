"use client";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { ugandaSubCounties } from "@/data/uganda-subcounties";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useOrganizationForm } from "../form-context/form-provider";
import { Combobox } from "@/components/ui/combobox";
import type { LocationInfo } from "../form-context/types";
import { MultiSelectCombobox } from "./MultiSelectCombobox";

export function LocationForm() {
  const {
    form,
    countries,
    districts,
    currentCountry,
    currentDistrict,
    districtSubCounties,
    handleCountrySelect,
    handleDistrictSelect,
    setDistrictSubCounties,
  } = useOrganizationForm();

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [filteredSubcounties, setFilteredSubcounties] = useState<
    { name: string; districtName: string }[]
  >([]);

  // Get subcounties for the selected district from our Uganda data
  const getSubcountiesForDistrict = (districtName: string) => {
    return ugandaSubCounties.filter(
      sc => sc.districtName.toLowerCase() === districtName.toLowerCase()
    );
  };

  // When a district is selected, prepare its subcounties
  useEffect(() => {
    if (selectedDistrict) {
      const subcounties = getSubcountiesForDistrict(selectedDistrict);
      setFilteredSubcounties(subcounties);
    } else {
      setFilteredSubcounties([]);
    }
  }, [selectedDistrict]);

  // Group districts by first letter for better organization
  // const groupedDistricts = useMemo(() => {
  //   const grouped: Record<string, LocationInfo[]> = {};
  //   districts.forEach((district: LocationInfo) => {
  //     const firstLetter = district.name[0].toUpperCase();
  //     if (!grouped[firstLetter]) {
  //       grouped[firstLetter] = [];
  //     }
  //     grouped[firstLetter].push(district);
  //   });
  //   return grouped;
  // }, [districts]);

  // Keep track of selected subcounties for UI feedback
  const selectedSubCounties = form.watch("operation_sub_counties") || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Location</CardTitle>
        <CardDescription>
          Select the country, district and sub-counties where this organization
          operates
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6">
        {/* Country Selection */}
        <FormField
          control={form.control}
          name="country"
          render={() => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Combobox
                  options={countries.map((country: LocationInfo) => ({
                    value: country.code,
                    label: country.name,
                  }))}
                  value={currentCountry?.code}
                  onValueChange={value => {
                    const country = countries.find(
                      (c: LocationInfo) => c.code === value
                    );
                    if (country) {
                      handleCountrySelect(country.code, country.name);
                    }
                  }}
                  placeholder="Select a country"
                  emptyMessage="No country found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* District Selection */}
        {currentCountry && (
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <FormControl>
                  <Combobox
                    options={districts.map((district: LocationInfo) => ({
                      value: district.code,
                      label: district.name,
                    }))}
                    value={field.value?.[0] || ""}
                    onValueChange={value => {
                      const district = districts.find(
                        (d: LocationInfo) => d.code === value
                      );
                      if (district) {
                        setSelectedDistrict(district.name);
                        handleDistrictSelect(district.code, district.name);
                      }
                    }}
                    placeholder="Select a district"
                    emptyMessage="No district found."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Sub-counties Selection */}
        {selectedDistrict && (
          <FormField
            control={form.control}
            name="operation_sub_counties"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Sub-Counties</FormLabel>
                </div>
                <FormControl>
                  <MultiSelectCombobox
                    options={filteredSubcounties.map(subCounty => ({
                      value: subCounty.name,
                      label: subCounty.name,
                    }))}
                    selected={Array.isArray(field.value) ? field.value : []}
                    onChange={selected => {
                      form.setValue("operation_sub_counties", selected);

                      // Update the district subcounties map
                      if (currentDistrict?.code) {
                        setDistrictSubCounties({
                          ...districtSubCounties,
                          [currentDistrict.code]: selected,
                        });
                      }
                    }}
                    placeholder="Select sub-counties"
                    emptyText={
                      filteredSubcounties.length > 0
                        ? "No sub-counties matched your search"
                        : "No sub-counties found for this district"
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Selected Sub-counties Summary */}
        {Array.isArray(selectedSubCounties) &&
          selectedSubCounties.length > 0 && (
            <div className="rounded-md border p-4">
              <h4 className="mb-2 text-sm font-medium">
                Selected Sub-Counties:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSubCounties.map((subCounty: string) => (
                  <Badge
                    key={subCounty}
                    variant="secondary"
                    className="cursor-pointer px-2 py-1"
                    onClick={() => {
                      const newSelection = selectedSubCounties.filter(
                        (sc: string) => sc !== subCounty
                      );
                      form.setValue("operation_sub_counties", newSelection);

                      if (currentDistrict?.code) {
                        const updatedDistrictSubcounties = {
                          ...districtSubCounties,
                          [currentDistrict.code]:
                            districtSubCounties[currentDistrict.code]?.filter(
                              (sc: string) => sc !== subCounty
                            ) || [],
                        };
                        setDistrictSubCounties(updatedDistrictSubcounties);
                      }
                    }}
                  >
                    {subCounty}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
