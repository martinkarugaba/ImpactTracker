"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { City } from "../data-table/cities-columns";
import { createCity, updateCity } from "../../actions/cities";
import {
  getDistricts,
  getCountiesByDistrict,
  getSubCountiesByCounty,
  getMunicipalitiesBySubCounty,
} from "../../actions/dropdown-data";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";

// Define types without database dependencies to avoid client-side bundling issues
interface District {
  id: string;
  name: string;
  code: string;
  country_id: string;
  region?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

interface County {
  id: string;
  name: string;
  code: string;
  district_id: string;
  country_id: string;
  created_at?: Date | null;
  updated_at?: Date | null;
}

interface SubCounty {
  id: string;
  name: string;
  code: string;
  county_id: string;
  district_id: string;
  country_id: string;
  created_at?: Date | null;
  updated_at?: Date | null;
}

interface Municipality {
  id: string;
  name: string;
  code: string;
  district_id: string;
  sub_county_id?: string | null;
  country_id: string;
  created_at?: Date | null;
  updated_at?: Date | null;
}

interface Props {
  editData?: City | null;
}

export function AddCityDialog({ editData }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedSubCounty, setSelectedSubCounty] = useState<string>("");
  const [districtsList, setDistrictsList] = useState<District[]>([]);
  const [countiesList, setCountiesList] = useState<County[]>([]);
  const [subCountiesList, setSubCountiesList] = useState<SubCounty[]>([]);
  const [municipalitiesList, setMunicipalitiesList] = useState<Municipality[]>(
    []
  );

  useEffect(() => {
    // Fetch initial data
    async function fetchData() {
      const result = await getDistricts();
      if (result.success) {
        setDistrictsList(result.data);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Listen for edit event
    const handleEditEvent = (event: CustomEvent<City>) => {
      const city = event.detail;
      if (city) {
        setOpen(true);
        setSelectedDistrict(city.district_id || "");
        setSelectedCounty(city.county_id || "");
        setSelectedSubCounty(city.sub_county_id || "");
      }
    };

    window.addEventListener("editCity", handleEditEvent as EventListener);

    return () => {
      window.removeEventListener("editCity", handleEditEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    // Fetch counties when district changes
    async function fetchCounties() {
      if (selectedDistrict) {
        const result = await getCountiesByDistrict(selectedDistrict);
        if (result.success) {
          setCountiesList(result.data);
        }
      } else {
        setCountiesList([]);
      }
    }
    fetchCounties();
  }, [selectedDistrict]);

  useEffect(() => {
    // Fetch subcounties when county changes
    async function fetchSubCounties() {
      if (selectedCounty) {
        const result = await getSubCountiesByCounty(selectedCounty);
        if (result.success) {
          setSubCountiesList(result.data);
        }
      } else {
        setSubCountiesList([]);
      }
    }
    fetchSubCounties();
  }, [selectedCounty]);

  useEffect(() => {
    // Fetch municipalities when subcounty changes
    async function fetchMunicipalities() {
      if (selectedSubCounty) {
        const result = await getMunicipalitiesBySubCounty(selectedSubCounty);
        if (result.success) {
          setMunicipalitiesList(result.data);
        }
      } else {
        setMunicipalitiesList([]);
      }
    }
    fetchMunicipalities();
  }, [selectedSubCounty]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);

      try {
        const result = editData
          ? await updateCity(editData.id, formData)
          : await createCity(formData);

        if (result.success) {
          toast.success(
            `City ${editData ? "updated" : "created"} successfully`
          );
          setOpen(false);
          form.reset();
        } else {
          toast.error(`Failed to ${editData ? "update" : "create"} city`);
        }
      } catch (error) {
        console.error(error);
        toast.error(`Failed to ${editData ? "update" : "create"} city`);
      }
    },
    [editData]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{editData ? "Edit" : "Add City"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit" : "Add"} City</DialogTitle>
          <DialogDescription>
            {editData
              ? "Update the city details below."
              : "Add a new city by filling out the form below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <Input
            name="name"
            placeholder="City name"
            defaultValue={editData?.name}
            required
          />
          <Input
            name="code"
            placeholder="City code"
            defaultValue={editData?.code}
            required
          />
          <input
            type="hidden"
            name="countryId"
            value={editData?.country_id || ""}
          />
          <Select
            name="districtId"
            value={selectedDistrict}
            onValueChange={value => {
              setSelectedDistrict(value);
              setSelectedCounty("");
              setSelectedSubCounty("");
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districtsList.map(district => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            name="countyId"
            value={selectedCounty}
            onValueChange={value => {
              setSelectedCounty(value);
              setSelectedSubCounty("");
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select county" />
            </SelectTrigger>
            <SelectContent>
              {countiesList.map(county => (
                <SelectItem key={county.id} value={county.id}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            name="subCountyId"
            value={selectedSubCounty}
            onValueChange={setSelectedSubCounty}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub-county" />
            </SelectTrigger>
            <SelectContent>
              {subCountiesList.map(subCounty => (
                <SelectItem key={subCounty.id} value={subCounty.id}>
                  {subCounty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="municipalityId">
            <SelectTrigger>
              <SelectValue placeholder="Select municipality (optional)" />
            </SelectTrigger>
            <SelectContent>
              {municipalitiesList.map(municipality => (
                <SelectItem key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="submit">{editData ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
