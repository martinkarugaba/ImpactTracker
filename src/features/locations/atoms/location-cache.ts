import { atom } from "jotai";

// Location cache atoms for storing code-to-name mappings
export const districtCodeCacheAtom = atom<Record<string, string>>({});
export const subCountyCodeCacheAtom = atom<Record<string, string>>({});
export const parishCodeCacheAtom = atom<Record<string, string>>({});
export const villageCodeCacheAtom = atom<Record<string, string>>({});

// Location cache atoms for storing ID-to-name mappings
export const districtIdCacheAtom = atom<Record<string, string>>({});
export const subCountyIdCacheAtom = atom<Record<string, string>>({});
export const parishIdCacheAtom = atom<Record<string, string>>({});
export const villageIdCacheAtom = atom<Record<string, string>>({});
export const countryIdCacheAtom = atom<Record<string, string>>({});
