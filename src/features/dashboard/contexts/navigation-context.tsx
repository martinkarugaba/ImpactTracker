"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isCurrentPage?: boolean;
}

interface NavigationContextValue {
  // Page title
  title: string;
  setTitle: (title: string) => void;

  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;

  // Back navigation
  showBackButton: boolean;
  setShowBackButton: (show: boolean) => void;
  backHref?: string;
  setBackHref: (href?: string) => void;

  // Navigation actions
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<BreadcrumbItem[]>(
    []
  );
  const [showBackButton, setShowBackButton] = useState(false);
  const [backHref, setBackHref] = useState<string | undefined>();

  const router = useRouter();
  const pathname = usePathname();

  // Clear custom breadcrumbs when pathname changes to allow auto-generation
  useEffect(() => {
    setCustomBreadcrumbs([]);
  }, [pathname]);

  const goBack = useCallback(() => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  }, [backHref, router]);

  // Auto-generate breadcrumbs from pathname if none are set
  const getAutoBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    if (customBreadcrumbs.length > 0) return customBreadcrumbs;

    const formatSegmentLabel = (segment: string): string => {
      // Handle UUIDs and specific cases
      if (
        segment.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        return "Details";
      }

      // Convert kebab-case to Title Case
      return segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const segments = pathname.split("/").filter(Boolean);
    const autoBreadcrumbs: BreadcrumbItem[] = [];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip the first 'dashboard' segment as we don't want it in breadcrumbs
      if (segment === "dashboard") return;

      const isLast = index === segments.length - 1;
      const label = formatSegmentLabel(segment);

      autoBreadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isCurrentPage: isLast,
      });
    });

    return autoBreadcrumbs;
  }, [pathname, customBreadcrumbs]);

  // Reset custom breadcrumbs when pathname changes
  const breadcrumbs = useMemo(() => {
    return getAutoBreadcrumbs();
  }, [getAutoBreadcrumbs]);

  return (
    <NavigationContext.Provider
      value={{
        title,
        setTitle,
        breadcrumbs,
        setBreadcrumbs: setCustomBreadcrumbs,
        showBackButton,
        setShowBackButton,
        backHref,
        setBackHref,
        goBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

// Convenience hook for setting page info
export function usePageInfo() {
  const { setTitle, setBreadcrumbs, setShowBackButton, setBackHref } =
    useNavigation();

  const setPageInfo = useCallback(
    (info: {
      title: string;
      breadcrumbs?: BreadcrumbItem[];
      showBackButton?: boolean;
      backHref?: string;
    }) => {
      setTitle(info.title);
      if (info.breadcrumbs) setBreadcrumbs(info.breadcrumbs);
      if (info.showBackButton !== undefined)
        setShowBackButton(info.showBackButton);
      if (info.backHref !== undefined) setBackHref(info.backHref);
    },
    [setTitle, setBreadcrumbs, setShowBackButton, setBackHref]
  );

  return { setPageInfo };
}

// Hook for backward compatibility
export function usePageTitle() {
  const { title, setTitle } = useNavigation();
  return { title, setTitle };
}
