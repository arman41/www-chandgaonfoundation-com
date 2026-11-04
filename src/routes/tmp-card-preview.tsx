import { createFileRoute } from "@tanstack/react-router";
import { MemberSmartCard } from "@/components/MemberSmartCard";
import { VolunteerSmartCard } from "@/components/VolunteerSmartCard";

export const Route = createFileRoute("/tmp-card-preview")({
  component: Page,
});

function Page() {
  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6 bg-background min-h-screen">
      <VolunteerSmartCard
        data={{ volunteer_code: "CGF-V-001001", name: "Md. Arman Hossain", role: "স্বেচ্ছাসেবক", area: "চাঁদগাঁও", photo_url: null, blood_group: "A+", joined_at: "2026-01-15", expires_at: "2027-01-15" }}
        side="front"
      />
      <MemberSmartCard
        data={{ member_code: "CGF-001001", name: "Md. Arman Hossain", role: "সদস্য", area: "চাঁদগাঁও", photo_url: null, join_date: "2026-01-15" }}
        side="front"
      />
      <MemberSmartCard
        data={{ member_code: "CGF-001001", name: "Md. Arman Hossain", role: "সদস্য", area: "চাঁদগাঁও", photo_url: null, join_date: "2026-01-15" }}
        side="back"
      />
    </div>
  );
}

