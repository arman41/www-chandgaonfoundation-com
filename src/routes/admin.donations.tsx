import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/admin/donations")({
  component: Page,
});

function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold capitalize">donations</h1>
      <p className="text-sm text-muted-foreground mt-1">এই বিভাগটি পরবর্তী ফেজে যোগ করা হবে।</p>
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <Construction className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">শীঘ্রই আসছে</p>
        <p className="text-xs text-muted-foreground mt-1">Phase 2–5 এ সম্পূর্ণ ফিচার যোগ হবে।</p>
      </div>
    </div>
  );
}
