import { type ParticipantFormValues } from "../participant-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

interface DataPreviewProps {
  data: ParticipantFormValues[];
  projects: { id: string; name: string }[];
  countryOptions: { value: string; label: string }[];
  selectedCountry: string;
  selectedProject: string;
  selectedDistrict: string;
  selectedSubCounty: string;
  onCountrySelect: (value: string) => void;
  onProjectSelect: (value: string) => void;
  onDistrictSelect: (value: string) => void;
  onSubCountySelect: (value: string) => void;
  onSearchCountry: (searchTerm: string) => void;
  onSearchDistrict: (searchTerm: string) => void;
  onSearchSubCounty: (searchTerm: string) => void;
  districtOptions: { value: string; label: string }[];
  subCountyOptions: { value: string; label: string }[];
  isLoadingCountries: boolean;
  isLoadingDistricts: boolean;
  isLoadingSubCounties: boolean;
}

export function DataPreview({
  data,
  projects = [],
  countryOptions = [],
  selectedCountry,
  selectedProject,
  selectedDistrict,
  selectedSubCounty,
  onCountrySelect,
  onProjectSelect,
  onDistrictSelect,
  onSubCountySelect,
  onSearchCountry,
  onSearchDistrict,
  onSearchSubCounty,
  districtOptions = [],
  subCountyOptions = [],
  isLoadingCountries = false,
  isLoadingDistricts = false,
  isLoadingSubCounties = false,
}: DataPreviewProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          Showing first 5 of {data.length} participants
        </CardDescription>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project">
                Select Project for All Participants
              </Label>
              <Combobox
                options={projects.map(project => ({
                  value: project.id,
                  label: project.name,
                }))}
                value={selectedProject}
                onValueChange={onProjectSelect}
                placeholder="Select a project"
                emptyMessage="No projects found."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Select Country for All Participants
              </Label>
              <Combobox
                options={countryOptions}
                value={selectedCountry}
                onValueChange={onCountrySelect}
                onSearchChange={onSearchCountry}
                placeholder="Type to search countries"
                emptyMessage={
                  isLoadingCountries
                    ? "Loading countries..."
                    : "No matching countries found"
                }
                disabled={isLoadingCountries}
                className="w-full"
              />
              {isLoadingCountries && (
                <div className="text-muted-foreground flex animate-pulse items-center gap-2 text-sm">
                  <div className="bg-muted h-2 w-2 rounded-full"></div>
                  <span>Loading countries, please wait...</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="district">
                Select District for All Participants
              </Label>
              <Combobox
                options={districtOptions}
                value={selectedDistrict}
                onValueChange={onDistrictSelect}
                onSearchChange={onSearchDistrict}
                placeholder={
                  !selectedCountry
                    ? "Select a country first, then search for districts"
                    : "Type to search districts"
                }
                emptyMessage={
                  !selectedCountry
                    ? "Please select a country first"
                    : isLoadingDistricts
                      ? "Loading..."
                      : "No districts found for this country"
                }
                disabled={isLoadingDistricts} // Allow typing even without country selected
                className="w-full"
              />
              {isLoadingDistricts && (
                <div className="text-muted-foreground flex animate-pulse items-center gap-2 text-sm">
                  <div className="bg-muted h-2 w-2 rounded-full"></div>
                  <span>Loading districts, please wait...</span>
                </div>
              )}
              {!selectedCountry && selectedDistrict && (
                <div className="text-xs text-amber-500">
                  Please select a country to confirm district selection
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCounty">
                Select Sub-County for All Participants
              </Label>
              <Combobox
                options={subCountyOptions}
                value={selectedSubCounty}
                onValueChange={onSubCountySelect}
                onSearchChange={onSearchSubCounty}
                placeholder={
                  !selectedDistrict
                    ? "Select a district first, then search for sub-counties"
                    : "Type to search sub-counties"
                }
                emptyMessage={
                  !selectedDistrict
                    ? "Please select a district first"
                    : isLoadingSubCounties
                      ? "Loading..."
                      : "No sub-counties found for this district"
                }
                disabled={isLoadingSubCounties} // Allow typing even without district selected
                className="w-full"
              />
              {isLoadingSubCounties && (
                <div className="text-muted-foreground flex animate-pulse items-center gap-2 text-sm">
                  <div className="bg-muted h-2 w-2 rounded-full"></div>
                  <span>Loading sub-counties, please wait...</span>
                </div>
              )}
              {!selectedDistrict && selectedSubCounty && (
                <div className="text-xs text-amber-500">
                  Please select a district to confirm sub-county selection
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Enterprise</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Parish</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{`${row.firstName} ${row.lastName}`}</TableCell>
                  <TableCell>{row.sex}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.contact}</TableCell>
                  <TableCell>{row.designation || "—"}</TableCell>
                  <TableCell>{row.enterprise || "—"}</TableCell>
                  <TableCell>{row.village || "—"}</TableCell>
                  <TableCell>{row.parish || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-muted-foreground mt-4 text-sm">
          Showing 5 of {data.length} participants to be imported. All data will
          be assigned to the selected Project, Country, District, and
          Sub-County.
        </div>
      </CardContent>
    </Card>
  );
}
