import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/features/themes/providers/theme-provider";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ActiveThemeProvider } from "@/features/themes/components/active-theme";
import { QueryProvider } from "@/providers/query-provider";

// Configure the Inter font with fallback options
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false, // Disable preload to prevent build issues
  adjustFontFallback: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
  variable: "--font-inter", // Use CSS variable for more flexibility
});

export const metadata: Metadata = {
  title: "kpi-edge app",
  description: "Track your KPIs across organizations and projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ActiveThemeProvider>
                <SidebarProvider defaultOpen={true}>
                  <div className="w-full">{children}</div>
                  <Toaster />
                </SidebarProvider>
              </ActiveThemeProvider>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
