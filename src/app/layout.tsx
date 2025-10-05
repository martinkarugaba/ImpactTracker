import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/session-provider";
import { ActiveThemeProvider } from "@/features/themes/components/active-theme";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSans.className} ${fontMono.variable} bg-sidebar font-sans antialiased`}
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
