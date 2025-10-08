import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { OrganizationFormValues } from "./form-context/types";
import type { ICity, ICountry, IState } from "country-state-city";

interface LocationDetailsProps {
  form: UseFormReturn<OrganizationFormValues>;
  countries: ICountry[];
  districts: IState[];
  availableSubCounties: ICity[];
  currentCountry: { code: string; name: string } | null;
  currentDistrict: { code: string; name: string } | null;
  districtSubCounties: Record<string, string[]>;
  handleCountrySelect: (countryCode: string, countryName: string) => void;
  handleDistrictSelect: (districtCode: string, districtName: string) => void;
  handleSubCountySelect: (subCountyName: string) => void;
  handleFinishCountry: () => void;
  handleAddDistrict: () => void;
  setDistrictSubCounties: (value: Record<string, string[]>) => void;
}

export function LocationDetails({
  form,
  countries,
  districts,
  availableSubCounties,
  currentCountry,
  currentDistrict,
  districtSubCounties,
  handleCountrySelect,
  handleDistrictSelect,
  handleSubCountySelect,
  handleFinishCountry,
  handleAddDistrict,
  setDistrictSubCounties,
}: LocationDetailsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Location Details</h3>
      <div className="grid grid-cols-1 gap-4">
        {/* Country Selection */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select Country</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value?.[0] || "Select a country"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search countries..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {countries.map(country => (
                        <CommandItem
                          value={country.name}
                          key={country.isoCode}
                          onSelect={() =>
                            handleCountrySelect(country.isoCode, country.name)
                          }
                        >
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* District and Sub-counties Selection */}
        {currentCountry && (
          <div className="animate-in slide-in-from-top-2 space-y-4 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Selected Country: {currentCountry.name}
              </h4>
              <Button
                type="button"
                variant="outline"
                onClick={handleFinishCountry}
                size="sm"
              >
                Change Country
              </Button>
            </div>

            {!currentDistrict ? (
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select District</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            Select a district
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search districts..." />
                          <CommandEmpty>No district found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {districts.map(district => (
                              <CommandItem
                                value={district.name}
                                key={district.isoCode}
                                onSelect={() =>
                                  handleDistrictSelect(
                                    district.isoCode,
                                    district.name
                                  )
                                }
                              >
                                {district.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="animate-in slide-in-from-top-2 space-y-4 duration-300">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Current District: {currentDistrict.name}
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDistrict}
                    size="sm"
                  >
                    Add Another District
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="operation_sub_counties"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Sub-Counties</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              Select sub-counties
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search sub-counties..." />
                            <CommandEmpty>No sub-county found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {availableSubCounties.map(subCounty => (
                                <CommandItem
                                  value={subCounty.name}
                                  key={subCounty.name}
                                  onSelect={() =>
                                    handleSubCountySelect(subCounty.name)
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (
                                        districtSubCounties[
                                          currentDistrict.code
                                        ] || []
                                      ).includes(subCounty.name)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {subCounty.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="mt-2">
                        <h5 className="mb-2 text-sm font-medium">
                          Selected Sub-Counties:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {(
                            districtSubCounties[currentDistrict.code] || []
                          ).map(subCountyName => (
                            <Badge
                              key={subCountyName}
                              variant="secondary"
                              className="animate-in fade-in-0 cursor-pointer duration-300"
                              onClick={() => {
                                const updatedSubCounties = districtSubCounties[
                                  currentDistrict.code
                                ].filter((sc: string) => sc !== subCountyName);
                                setDistrictSubCounties({
                                  ...districtSubCounties,
                                  [currentDistrict.code]: updatedSubCounties,
                                });
                                const currentValues =
                                  form.getValues("operation_sub_counties") ||
                                  [];
                                const allSubCounties = currentValues.filter(
                                  (sc: string) => sc !== subCountyName
                                );
                                form.setValue(
                                  "operation_sub_counties",
                                  allSubCounties
                                );
                              }}
                            >
                              {subCountyName}
                              <X className="ml-1 h-3 w-3" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Summary of selected locations */}
        {(form.getValues("country")?.length > 0 ||
          form.getValues("district")?.length > 0) && (
          <div className="animate-in fade-in-50 mt-4 rounded-lg border p-4 duration-300">
            <h4 className="mb-2 text-sm font-medium">Selected Locations:</h4>
            {form.getValues("country")?.map(countryName => (
              <div key={countryName} className="mb-4">
                <h5 className="text-sm font-medium">{countryName}</h5>
                <div className="ml-4">
                  {form.getValues("district")?.map(districtName => (
                    <div key={districtName} className="mt-2">
                      <span className="text-sm">{districtName}</span>
                      <div className="ml-4 flex flex-wrap gap-1">
                        {Object.values(districtSubCounties)
                          .filter(subCounties => subCounties.length > 0)
                          .flatMap(subCounties =>
                            subCounties.map((subCounty: string) => (
                              <Badge
                                key={subCounty}
                                variant="outline"
                                className="text-xs"
                              >
                                {subCounty}
                              </Badge>
                            ))
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
