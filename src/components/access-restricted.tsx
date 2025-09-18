import { Lock } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const AccessRestricted = ({ feature }: { feature: string }) => {
  const router = useRouter();
  return (
    <Card className="mx-5 border-red-200 bg-gradient-to-r from-red-50 to-red-100/5 dark:from-red-950/20 dark:to-red-900/5 dark:border-red-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Access Restricted
              </h3>
              <Badge
                variant="outline"
                className="border-red-300 text-red-700 dark:border-red-600 dark:text-red-300"
              >
                Permission Required
              </Badge>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              You don't have permission to {feature}. Please contact your
              team administrator to request access to the {feature} feature.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
