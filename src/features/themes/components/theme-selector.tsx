"use client";

import { useEffect, useState } from "react";
import { THEMES } from "../lib/themes";
import { useThemeConfig } from "./active-theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="h-8 w-32" />;
  }

  return (
    <Select value={activeTheme} onValueChange={setActiveTheme}>
      <SelectTrigger className="h-8 w-auto border bg-transparent text-foreground">
        <span className="hidden text-muted-foreground sm:block">
          Select a theme:
        </span>
        <SelectValue placeholder="Select a theme:" />
      </SelectTrigger>
      <SelectContent align="end">
        {THEMES.map(theme => (
          <SelectItem key={theme.name} value={theme.value}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
