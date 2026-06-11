import { QRCanvas } from "@/components/QRCanvas";
import floodAsset from "@/assets/flood-relief.jpg.asset.json";


export type VolunteerCardData = {
  volunteer_code: string | null;
  name: string;
  role: string | null;
  area: string | null;
  photo_url: string | null;
  blood_group: string | null;
  joined_at: string | null;
  expires_at: string | null;
  assigned_task?: string | null;
  skills?: string | null;
};

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  const dt = new Date(d);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = String(dt.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

/**
 * Premium "Visa / Mastercard"-inspired smart ID card (navy/blue).
 * Aspect ratio matches ISO/IEC 7810 ID-1 (85.6 × 53.98 mm ≈ 1.586:1).
 */
export function VolunteerSmartCard({
  data,
  verifyUrl,
  org = "চাঁদগাঁও ফাউন্ডেশন",
  side = "front",
}: {
  data: VolunteerCardData;
  verifyUrl?: string;
  org?: string;
  side?: "front" | "back";
}) {
  if (side === "back") return <CardBack data={data} verifyUrl={verifyUrl} org={org} />;
  return <CardFront data={data} verifyUrl={verifyUrl} org={org} />;
}

function CardFront({ data, verifyUrl, org }: { data: VolunteerCardData; verifyUrl?: string; org: string }) {
  const initial = data.name?.charAt(0) ?? "V";
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl text-white"
      style={{
        aspectRatio: "1.586 / 1",
        background:
          "radial-gradient(120% 80% at 0% 0%, #1e3a8a 0%, transparent 55%)," +
          "radial-gradient(120% 80% at 100% 100%, #0c2340 0%, transparent 55%)," +
          "linear-gradient(135deg, #0a1530 0%, #0c2340 45%, #1b3a6b 100%)",
        boxShadow:
          "0 30px 60px -25px rgba(8,16,40,.55), 0 10px 25px -10px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)",
      }}
    >
      {/* subtle gold accent line at top */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3%] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #c9a14a 25%, #f7e07a 50%, #c9a14a 75%, transparent 100%)",
          opacity: 0.85,
        }}
      />

      {/* Foundation activity photo — subtle background overlay */}
      <img
        src={floodAsset.url}
        alt=""
        aria-hidden
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ opacity: 0.18, mixBlendMode: "screen" }}
      />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(10,21,48,.55) 0%, rgba(12,35,64,.35) 50%, rgba(27,58,107,.55) 100%)" }} />

      {/* Guilloché lines */}
      <svg aria-hidden className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 252" preserveAspectRatio="none">
        <defs>
          <pattern id="gl" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <path d="M0 3 H6" stroke="white" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="400" height="252" fill="url(#gl)" />
      </svg>

      {/* Top row: brand only (PLATINUM moved below to avoid photo overlap) */}
      <div className="absolute top-[8%] left-[6%] right-[32%]">
        <p className="text-[8px] sm:text-[10px] tracking-[0.3em] uppercase opacity-90">Volunteer ID</p>
        <h3 className="text-[13px] sm:text-base font-bold leading-tight mt-0.5 truncate">{org}</h3>
        <div
          className="mt-1.5 inline-block px-2 py-0.5 rounded-md text-[8px] sm:text-[10px] font-extrabold tracking-widest"
          style={{
            background: "linear-gradient(135deg, #f7e07a, #c9a14a)",
            color: "#3a2a08",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 2px 6px rgba(0,0,0,.25)",
          }}
        >
          PLATINUM
        </div>
      </div>

      {/* Chip */}
      <div
        className="absolute top-[40%] left-[6%] w-[14%] aspect-[4/3] rounded-md"
        style={{
          background:
            "linear-gradient(135deg,#e9d27a 0%,#c9a14a 45%,#8d6b1a 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.3), 0 2px 6px rgba(0,0,0,.4)",
        }}
      >
        <div className="absolute inset-[12%] grid grid-cols-3 gap-[2px] opacity-60">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-[rgba(0,0,0,.35)] rounded-[1px]" />
          ))}
        </div>
      </div>

      {/* Contactless waves */}
      <svg aria-hidden className="absolute top-[42%] left-[22%] w-[8%] opacity-80" viewBox="0 0 24 24" fill="none">
        <path d="M6 8c3 2 3 8 0 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10 5c5 3 5 11 0 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14 2c7 4 7 16 0 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      {/* Photo */}
      <div
        className="absolute top-[8%] right-[6%] w-[22%] aspect-square rounded-xl overflow-hidden border"
        style={{ borderColor: "rgba(255,215,130,.7)", boxShadow: "0 4px 14px rgba(0,0,0,.35)" }}
      >
        {data.photo_url ? (
          <img src={data.photo_url} alt={data.name} crossOrigin="anonymous" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/10 text-2xl font-extrabold">
            {initial}
          </div>
        )}
      </div>

      {/* Card number (volunteer code) — embossed */}
      <div className="absolute left-[6%] right-[6%] top-[60%]">
        <p
          className="font-mono font-extrabold tracking-[0.18em] text-[15px] sm:text-[22px]"
          style={{
            textShadow:
              "0 1px 0 rgba(255,255,255,.25), 0 2px 0 rgba(0,0,0,.5), 0 4px 10px rgba(0,0,0,.35)",
            letterSpacing: "0.18em",
          }}
        >
          {(data.volunteer_code ?? "CGF-V-XXXXXX").replace(/-/g, " · ")}
        </p>
      </div>

      {/* Bottom row: holder + valid + blood */}
      <div className="absolute left-[6%] right-[6%] bottom-[6%] flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[7px] sm:text-[9px] tracking-[0.25em] uppercase opacity-70">Volunteer</p>
          <p className="text-[12px] sm:text-base font-bold truncate uppercase tracking-wide">{data.name}</p>
          <p className="text-[9px] sm:text-[11px] opacity-80 truncate">
            {(data.role ?? "স্বেচ্ছাসেবক")}{data.area ? ` · ${data.area}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[7px] sm:text-[9px] tracking-[0.2em] uppercase opacity-70">Valid Thru</p>
          <p className="font-mono font-bold text-[11px] sm:text-sm">{fmt(data.expires_at)}</p>
          {data.blood_group && (
            <p className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold bg-red-600/90">
              {data.blood_group}
            </p>
          )}
        </div>
      </div>

      {verifyUrl && (
        <div className="absolute top-[6%] right-[32%] hidden">
          <QRCanvas value={verifyUrl} size={48} />
        </div>
      )}
    </div>
  );
}

function CardBack({ data, verifyUrl, org }: { data: VolunteerCardData; verifyUrl?: string; org: string }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl text-white"
      style={{
        aspectRatio: "1.586 / 1",
        background: "linear-gradient(135deg,#0a1530,#0c2340 60%,#10264f)",
        boxShadow:
          "0 30px 60px -25px rgba(8,16,40,.55), 0 10px 25px -10px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.1)",
      }}
    >
      {/* Top brand band (no photo on back) */}
      <div className="absolute inset-x-0 top-0 h-[34%] flex flex-col justify-center px-5"
        style={{ background: "linear-gradient(135deg,#0a1530 0%,#10264f 100%)" }}>
        <p className="text-[8px] sm:text-[10px] tracking-[0.3em] uppercase opacity-80">Volunteer Card</p>
        <h3 className="text-[13px] sm:text-base font-bold leading-tight mt-1 truncate">{org}</h3>
        <p className="text-[9px] sm:text-[11px] opacity-80 mt-1">Relief · Service · Unity</p>
      </div>
      <div className="absolute top-[36%] left-0 right-0 h-[14%] bg-black/85" />

      <div className="absolute top-[54%] left-[6%] right-[6%] h-[18%] bg-white/95 rounded-md flex items-center px-3">
        <div className="flex-1 h-full flex items-center">
          <div
            className="w-full h-full opacity-40"
            style={{
              background:
                "repeating-linear-gradient(135deg,#9ca3af 0 2px,transparent 2px 6px)",
            }}
          />
        </div>
        <span className="text-[10px] sm:text-xs font-mono text-black/80 ml-2 truncate">
          {data.volunteer_code ?? ""}
        </span>
      </div>

      <div className="absolute left-[6%] right-[6%] bottom-[6%] flex items-end justify-between gap-3">
        <div className="text-[9px] sm:text-[11px] leading-snug opacity-85 max-w-[60%]">
          <p className="font-bold text-white">{org}</p>
          <p className="opacity-80">
            এই কার্ডটি অহস্তান্তরযোগ্য। হারিয়ে গেলে অনুগ্রহ করে ফেরত দিন বা ফাউন্ডেশনে যোগাযোগ করুন।
          </p>
          <p className="opacity-70 mt-1">This card is non-transferable. If found, please return.</p>
        </div>
        {verifyUrl && (
          <div className="bg-white p-1.5 rounded-md shrink-0">
            <QRCanvas value={verifyUrl} size={64} />
          </div>
        )}
      </div>
    </div>
  );
}
