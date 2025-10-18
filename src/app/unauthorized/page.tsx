import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Unauthorized Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You don&apos;t have permission to access this page. Please contact
            your administrator if you believe this is a mistake.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Home Pge</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
