import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Home,
  Users,
  BarChart3,
  Building2,
  MapPin,
  Calendar,
  UserCheck,
  Coins,
} from "lucide-react";

const DashboardNotFound = () => {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="mx-auto w-full max-w-3xl">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-8 text-center">
            <div className="bg-destructive/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-10 w-10" />
            </div>
            <CardTitle className="text-foreground text-4xl font-bold tracking-tight">
              Dashboard Page Not Found
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-xl">
              The dashboard page you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                This section of the dashboard might have been moved, renamed, or
                is temporarily unavailable. Try one of the options below to
                continue.
              </p>
            </div>

            {/* Dashboard Navigation Grid */}
            <div className="space-y-4">
              <h3 className="text-foreground mb-4 text-lg font-semibold">
                Available Dashboard Sections
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    Dashboard Home
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/participants">
                    <Users className="h-4 w-4" />
                    Participants
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/projects">
                    <BarChart3 className="h-4 w-4" />
                    Projects
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/activities">
                    <Calendar className="h-4 w-4" />
                    Activities
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/organizations">
                    <Building2 className="h-4 w-4" />
                    Organizations
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/clusters">
                    <BarChart3 className="h-4 w-4" />
                    Clusters
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/locations">
                    <MapPin className="h-4 w-4" />
                    Locations
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/trainings">
                    <UserCheck className="h-4 w-4" />
                    Trainings
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/vslas">
                    <Coins className="h-4 w-4" />
                    VSLAs
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/users">
                    <Users className="h-4 w-4" />
                    Users
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:border-border hover:bg-accent/50 h-12 justify-start gap-3"
                >
                  <Link href="/dashboard/overview">
                    <BarChart3 className="h-4 w-4" />
                    Overview
                  </Link>
                </Button>
              </div>
            </div>

            {/* Main Actions */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button asChild className="h-12 flex-1 gap-2">
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                  Return to Dashboard
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-12 flex-1 gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <div className="border-border/50 border-t pt-4">
              <p className="text-muted-foreground text-center text-sm">
                If you expected to find a page here, please check the URL or
                contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardNotFound;
