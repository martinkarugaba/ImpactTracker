import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/session-provider";
import { ActiveThemeProvider } from "@/features/themes/components/active-theme";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import type { Metadata } from "next";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Impact Tracker",
  description:
    "KPI Edge - Impact tracking platform for development organizations in Uganda/East Africa",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} bg-sidebar antialiased`}
        style={{ fontFamily: "var(--font-sans)" }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ActiveThemeProvider>
            <AuthProvider>
              <QueryProvider>
                <CalendarProvider>{children}</CalendarProvider>
              </QueryProvider>
            </AuthProvider>
          </ActiveThemeProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
