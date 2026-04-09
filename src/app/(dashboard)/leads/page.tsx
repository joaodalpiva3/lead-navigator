import { Suspense } from "react";
import { LeadsContent } from "@/components/leads/leads-content";

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <div className="h-10 w-[280px] animate-pulse rounded-md bg-slate-200" />
          <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-slate-200" />
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        </div>
      }
    >
      <LeadsContent />
    </Suspense>
  );
}
