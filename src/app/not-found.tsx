import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, LogIn, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-4xl font-bold tracking-tight text-foreground">
              404
            </CardTitle>
            <CardDescription className="mt-2 text-xl text-muted-foreground">
              Oops! The page you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="text-center">
              <p className="mb-6 text-muted-foreground">
                The page you requested could not be found. It might have been
                moved, deleted, or you may have mistyped the URL.
              </p>
            </div>

            {/* Public Navigation Options */}
            <div className="space-y-4">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Where would you like to go?
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-12 justify-start gap-3 border-border/50 hover:border-border hover:bg-accent/50"
                >
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Home Page
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 justify-start gap-3 border-border/50 hover:border-border hover:bg-accent/50"
                >
                  <Link href="/auth/login">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 justify-start gap-3 border-border/50 hover:border-border hover:bg-accent/50"
                >
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 justify-start gap-3 border-border/50 hover:border-border hover:bg-accent/50"
                >
                  <Link href="/auth/register">
                    <LogIn className="h-4 w-4" />
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>

            {/* Main Actions */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button asChild className="h-12 flex-1 gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-12 flex-1 gap-2">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <div className="border-t border-border/50 pt-4">
              <p className="text-center text-sm text-muted-foreground">
                If you believe this is an error, please contact support or try
                refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
