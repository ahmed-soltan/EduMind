import { Brain, FileText } from "lucide-react";
import { IconCards } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useTenantUsage } from "../api/use-tenant-usage";

export const UsageTab = () => {
  const { data: tenantUsage, isLoading } = useTenantUsage();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Feature Usage
        </CardTitle>
        <CardDescription>
          Current usage across all features in your plan
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <UsageCardSkeleton />
            <UsageCardSkeleton />
            <UsageCardSkeleton />
            <UsageCardSkeleton />
          </>
        ) : (
          <>
            <UsageCard
              icon={Brain}
              title="Quiz Generation"
              usage={tenantUsage?.quizzes?.usage || 0}
              limit={tenantUsage?.quizzes?.limit === null ? Infinity : (tenantUsage?.quizzes?.limit || 0)}
              color="blue"
            />
            <UsageCard
              icon={FileText}
              title="Flashcard Decks"
              usage={tenantUsage?.decks?.usage || 0}
              limit={tenantUsage?.decks?.limit === null ? Infinity : (tenantUsage?.decks?.limit || 0)}
              color="green"
            />
            <UsageCard
              icon={IconCards}
              title="Flashcards"
              usage={tenantUsage?.flashcards?.usage || 0}
              limit={tenantUsage?.flashcards?.limit === null ? Infinity : (tenantUsage?.flashcards?.limit || 0)}
              color="purple"
            />
            <UsageCard
              icon={FileText}
              title="Documents"
              usage={tenantUsage?.documents?.usage || 0}
              limit={tenantUsage?.documents?.limit === null ? Infinity : (tenantUsage?.documents?.limit || 0)}
              color="orange"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

const UsageCard = ({
  icon: Icon,
  title,
  usage,
  limit,
  color = "blue",
}: {
  icon: any;
  title: string;
  usage: number;
  limit: number;
  color?: string;
}) => {
  const isUnlimited = limit === Infinity || limit === null;
  const percentage = isUnlimited ? 0 : Math.min((usage / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage > 80;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 text-${color}-600`} />
          <span className="font-medium">{title}</span>
        </div>
        <Badge variant={isNearLimit ? "destructive" : "secondary"}>
          {usage}/{isUnlimited ? "∞" : limit}
        </Badge>
      </div>
      <SimpleProgress value={usage} max={limit} isUnlimited={isUnlimited} />
      <div className="mt-2 text-sm text-muted-foreground">
        {isUnlimited 
          ? "Unlimited usage" 
          : `${Math.max(limit - usage, 0)} remaining`
        }
      </div>
    </Card>
  );
};

const SimpleProgress = ({
  value,
  max,
  isUnlimited = false,
  className,
}: {
  value: number;
  max: number;
  isUnlimited?: boolean;
  className?: string;
}) => {
  if (isUnlimited) {
    return (
      <div
        className={`w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 ${className}`}
      >
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: '100%' }}
        />
      </div>
    );
  }

  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 ${className}`}
    >
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const UsageCardSkeleton = () => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <Skeleton className="w-full h-2 rounded-full" />
      <div className="mt-2">
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  );
};
