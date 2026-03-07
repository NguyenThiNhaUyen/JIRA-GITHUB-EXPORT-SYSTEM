// Chart skeleton loader
import { Skeleton } from "./skeleton.jsx";

export function ChartSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-64 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

