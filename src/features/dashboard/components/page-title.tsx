"use client";

import { useEffect } from "react";
import { usePageTitle } from "../contexts/navigation-context";

interface PageTitleProps {
  title: string;
}

export function PageTitle({ title }: PageTitleProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title);
    return () => setTitle(""); // Clean up when component unmounts
  }, [title, setTitle]);

  return null; // This component doesn't render anything
}
