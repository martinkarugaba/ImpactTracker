"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import type {
  OrganizationFormContextType,
  OrganizationFormValues,
  OrganizationData,
  LocationInfo,
} from "./types";
import { organizationFormSchema } from "./types";
import type { Project } from "@/features/projects/types";
import type { Cluster } from "@/features/clusters/types";
import { getCountries } from "@/features/locations/actions/countries";
import { getDistricts } from "@/features/locations/actions/districts";
import { getSubCounties } from "@/features/locations/actions/subcounties";
import { getProjects } from "@/features/projects/actions/projects";
import {
  countriesAtom,
  districtsAtom,
  subCountiesAtom,
  currentCountryAtom,
  currentDistrictAtom,
  districtSubCountiesAtom,
} from "@/features/organizations/atoms/organization-form";

interface FormProviderProps extends React.PropsWithChildren {
  initialData?: OrganizationData;
  clusters: Cluster[];
  defaultClusterId?: string;
  isLoading?: boolean;
}

const FormContext = createContext<OrganizationFormContextType | undefined>(
  undefined
) as React.Context<OrganizationFormContextType>;

// Ensure non-nullable context by providing initial values
// const defaultContextValue: OrganizationFormContextType = {
//   form: null as unknown as UseFormReturn<OrganizationFormValues>,
//   isLoading: false,
//   projects: [],
//   clusters: [],
//   countries: [],
//   districts: [],
//   availableSubCounties: [],
//   currentCountry: null,
//   currentDistrict: null,
//   districtSubCounties: {},
//   selectedClusterIds: [],
//   setSelectedClusterIds: (ids: string[]): void => {},
//   handleCountrySelect: async (
//     countryCode: string,
//     countryName: string
//   ): Promise<void> => Promise.resolve(),
//   handleDistrictSelect: async (
//     districtCode: string,
//     districtName: string
//   ): Promise<void> => Promise.resolve(),
//   handleSubCountySelect: async (subCountyName: string): Promise<void> =>
//     Promise.resolve(),
//   handleFinishCountry: async (): Promise<void> => Promise.resolve(),
//   handleAddDistrict: async (): Promise<void> => Promise.resolve(),
//   setDistrictSubCounties: (value: Record<string, string[]>): void => {},
// };

export function OrganizationFormProvider({
  children,
  initialData,
  clusters,
  defaultClusterId,
  isLoading = false,
}: FormProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClusterIds, setSelectedClusterIds] = useState<string[]>(
    initialData?.cluster_id ? [initialData.cluster_id] : []
  );

  // Location states from atoms
  const [countries, setCountries] = useAtom(countriesAtom);
  const [districts, setDistricts] = useAtom(districtsAtom);
  const [_availableSubCounties, setAvailableSubCounties] =
    useAtom(subCountiesAtom);
  const [currentCountry, setCurrentCountry] = useAtom(currentCountryAtom);
  const [currentDistrict, setCurrentDistrict] = useAtom(currentDistrictAtom);
  const [districtSubCounties, setDistrictSubCounties] = useAtom(
    districtSubCountiesAtom
  );
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Initialize form with zodResolver and default values
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          acronym: initialData.acronym || "",
          cluster_id: initialData.cluster_id || null,
          selected_cluster_ids: initialData.cluster_id
            ? [initialData.cluster_id]
            : [],
          project_id: initialData.project_id || null,
          country: initialData.country ? [initialData.country] : [],
          district: initialData.district ? [initialData.district] : [],
          sub_county_id: initialData.sub_county_id || "",
          operation_sub_counties: initialData.operation_sub_counties || [],
          parish: initialData.parish || "",
          village: initialData.village || "",
          address: initialData.address || "",
        }
      : {
          name: "",
          acronym: "",
          cluster_id: defaultClusterId || null,
          selected_cluster_ids: defaultClusterId ? [defaultClusterId] : [],
          project_id: null,
          country: [],
          district: [],
          sub_county_id: "",
          operation_sub_counties: [],
          parish: "",
          village: "",
          address: "",
        },
  });

  // Fetch countries and projects on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch countries and projects separately to handle type conversion properly
        const result = await getCountries().catch((error: unknown) => {
          console.error("Error fetching countries:", error);
          return { success: false, data: { data: [] } };
        });

        const fetchedCountries = result.data?.data || [];

        // Convert to ICountry compatible format
        const formattedCountries = fetchedCountries.map(
          (country: { name: string; code: string }) => ({
            name: country.name,
            isoCode: country.code,
            phonecode: "",
            flag: "",
            currency: "",
            latitude: "",
            longitude: "",
          })
        );

        setCountries(formattedCountries);

        // Fetch projects separately
        const projectsResult = await getProjects().catch((error: unknown) => {
          console.error("Error fetching projects:", error);
          return { success: false, data: [] };
        });

        if (projectsResult.success && projectsResult.data) {
          setProjects(projectsResult.data);
        }
      } catch (error: unknown) {
        console.error("Error in fetchInitialData:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchInitialData();
  }, [setCountries, setProjects]);

  // Handler for country selection
  const handleCountrySelect = useCallback(
    async (countryCode: string, countryName: string) => {
      const selectedCountry: LocationInfo = {
        code: countryCode,
        name: countryName,
      };
      setCurrentCountry(selectedCountry);
      setCurrentDistrict(null);
      setDistricts([]);
      setAvailableSubCounties([]);

      try {
        const result = await getDistricts({ countryId: countryCode });
        const fetchedDistricts = result.data?.data || [];

        // Convert to IState compatible format
        const formattedDistricts = fetchedDistricts.map(
          (district: { name: string; code: string }) => ({
            name: district.name,
            isoCode: district.code,
            countryCode: countryCode,
            stateCode: district.code,
          })
        );

        setDistricts(formattedDistricts);
      } catch (error: unknown) {
        console.error("Error fetching districts:", error);
      }
    },
    [
      setCurrentCountry,
      setCurrentDistrict,
      setDistricts,
      setAvailableSubCounties,
    ]
  );

  // Handler for district selection
  const handleDistrictSelect = useCallback(
    async (districtCode: string, districtName: string) => {
      const selectedDistrict: LocationInfo = {
        code: districtCode,
        name: districtName,
      };
      setCurrentDistrict(selectedDistrict);
      setAvailableSubCounties([]);

      if (!currentCountry?.code) {
        console.error("No country selected");
        return;
      }

      try {
        // Get sub-counties for this district and store them
        const result = await getSubCounties({
          districtId: districtCode,
        });
        const subCountyData = result.data?.data || [];
        // Store names for the UI
        const subCountyNames = subCountyData.map(
          (city: { name: string }) => city.name
        );
        setDistrictSubCounties({
          ...districtSubCounties,
          [districtCode]: subCountyNames,
        });

        // Convert to ICity compatible format for the atom
        const formattedSubCounties = subCountyData.map(
          (sc: { name: string }) => ({
            name: sc.name,
            stateCode: districtCode,
            countryCode: currentCountry.code,
            latitude: "",
            longitude: "",
          })
        );

        setAvailableSubCounties(formattedSubCounties);
      } catch (error: unknown) {
        console.error("Error fetching sub-counties:", error);
      }
    },
    [
      currentCountry?.code,
      setCurrentDistrict,
      setAvailableSubCounties,
      districtSubCounties,
      setDistrictSubCounties,
    ]
  );

  // Handler for sub-county selection
  const handleSubCountySelect = useCallback(async (subCountyName: string) => {
    // Implementation would go here
    console.log(`Selected sub-county: ${subCountyName}`);
    // You can add form setting logic here if needed
  }, []);

  // Handler for finishing country selection
  const handleFinishCountry = useCallback(async () => {
    // Implementation for finalizing country selection
    console.log("Country selection finished");
  }, []);

  // Handler for adding a district
  const handleAddDistrict = useCallback(async () => {
    // Implementation for adding a new district
    console.log("Add district action triggered");
  }, []);

  // Now that handleCountrySelect is defined, set initial country and district if provided
  useEffect(() => {
    const setupInitialLocation = async () => {
      if (initialData && countries.length > 0) {
        const country = countries.find(c => c.isoCode === initialData.country);
        if (country) {
          const locationInfo = { code: country.isoCode, name: country.name };
          setCurrentCountry(locationInfo);
          await handleCountrySelect(country.isoCode, country.name);
        }
      }
    };

    setupInitialLocation();
  }, [countries, initialData, handleCountrySelect, setCurrentCountry]);

  // Convert ICountry[] to LocationInfo[]
  const countriesAsLocationInfo: LocationInfo[] = countries.map(country => ({
    code: country.isoCode,
    name: country.name,
  }));

  // Convert IState[] to LocationInfo[]
  const districtsAsLocationInfo: LocationInfo[] = districts.map(district => ({
    code: district.isoCode,
    name: district.name,
  }));

  const value: OrganizationFormContextType = {
    form,
    isLoading: isLoading || loadingProjects,
    projects,
    clusters,
    countries: countriesAsLocationInfo,
    districts: districtsAsLocationInfo,
    availableSubCounties: currentDistrict
      ? districtSubCounties[currentDistrict.code] || []
      : [],
    currentCountry,
    currentDistrict,
    districtSubCounties,
    selectedClusterIds,
    setSelectedClusterIds,
    handleCountrySelect,
    handleDistrictSelect,
    handleSubCountySelect,
    handleFinishCountry,
    handleAddDistrict,
    setDistrictSubCounties,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useOrganizationForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error(
      "useOrganizationForm must be used within a OrganizationFormProvider"
    );
  }
  return context;
}
