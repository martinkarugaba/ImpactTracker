import type { Metadata, Viewport } from "next";
import { Inter, Public_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/features/themes/providers/theme-provider";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ActiveThemeProvider } from "@/features/themes/components/active-theme";
import { QueryProvider } from "@/providers/query-provider";
import { GlobalImportProgress } from "@/features/participants/components/import/global-import-progress";

// Configure the Inter font with fallback options
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false, // Disable preload to prevent build issues
  adjustFontFallback: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
  variable: "--font-inter", // Use CSS variable for more flexibility
});

// Configure Public Sans font
const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  fallback: ["Noto Sans", "system-ui", "Arial", "sans-serif"],
  variable: "--font-public-sans", // Use CSS variable for more flexibility
});

export const metadata: Metadata = {
  title: "Impact Tracker",
  description:
    "Track your impact across organizations and projects with precision",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${publicSans.variable} font-sans`}
        suppressHydrationWarning
      >
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
                  <div className="safe-area-padding w-full">{children}</div>
                  <GlobalImportProgress />
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
