import { atom } from "jotai";
import type { Intervention } from "../types/types";

export const interventionsAtom = atom<Intervention[] | null>(null);
export const interventionsLoadingAtom = atom<boolean>(false);
