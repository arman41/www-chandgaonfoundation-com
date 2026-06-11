import { QRCanvas } from "@/components/QRCanvas";
import floodAsset from "@/assets/flood-relief.jpg.asset.json";


export type MemberCardData = {
  member_code: string | null;
  name: string;
  role: string | null;
  area: string | null;
  photo_url: string | null;
  join_date: string | null;
  status?: string | null;
};

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  const dt = new Date(d);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = String(dt.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

/**
 * Member smart ID card — emerald/teal palette, distinct from volunteer (navy).
 * ID-1 ratio: 85.6 × 53.98 mm ≈ 1.586:1.
 */
export function MemberSmartCard({
  data,
  verifyUrl,
  org = "চাঁদগাঁও ফাউন্ডেশন",
  side = "front",
}: {
  data: MemberCardData;
  verifyUrl?: string;
  org?: string;
  side?: "front" | "back";
}) {
  if (side === "back") return <CardBack data={data} verifyUrl={verifyUrl} org={org} />;
  return <CardFront data={data} verifyUrl={verifyUrl} org={org} />;
}

function CardFront({ data, verifyUrl, org }: { data: MemberCardData; verifyUrl?: string; org: string }) {
  const initial = data.name?.charAt(0) ?? "M";
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl text-white"
      style={{
        aspectRatio: "1.586 / 1",
        background:
          "radial-gradient(120% 80% at 0% 0%, #065f46 0%, transparent 55%)," +
          "radial-gradient(120% 80% at 100% 100%, #0e7490 0%, transparent 55%)," +
          "linear-gradient(135deg, #064e3b 0%, #047857 45%, #0d9488 100%)",
        boxShadow:
          "0 30px 60px -25px rgba(6,78,59,.55), 0 10px 25px -10px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.14)",
      }}
    >
      {/* subtle gold accent line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3%] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #fde68a 25%, #fbbf24 50%, #fde68a 75%, transparent 100%)",
          opacity: 0.9,
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
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(6,78,59,.55) 0%, rgba(4,120,87,.35) 50%, rgba(13,148,136,.55) 100%)" }} />

      {/* Guilloché lines */}
      <svg aria-hidden className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 252" preserveAspectRatio="none">
        <defs>
          <pattern id="glm" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <path d="M0 3 H6" stroke="white" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="400" height="252" fill="url(#glm)" />
      </svg>

      {/* Top-left brand + tier badge */}
      <div className="absolute top-[8%] left-[6%] right-[32%]">
        <p className="text-[8px] sm:text-[10px] tracking-[0.3em] uppercase opacity-90">Member ID</p>
        <h3 className="text-[13px] sm:text-base font-bold leading-tight mt-0.5 truncate">{org}</h3>
        <div
          className="mt-1.5 inline-block px-2 py-0.5 rounded-md text-[8px] sm:text-[10px] font-extrabold tracking-widest"
          style={{
            background: "linear-gradient(135deg, #d1fae5, #34d399)",
            color: "#053e2c",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 2px 6px rgba(0,0,0,.25)",
          }}
        >
          MEMBER
        </div>
      </div>

      {/* Chip — silver tone to differ from volunteer's gold */}
      <div
        className="absolute top-[40%] left-[6%] w-[14%] aspect-[4/3] rounded-md"
        style={{
          background:
            "linear-gradient(135deg,#e6f3ef 0%,#9fbeb3 45%,#3f5a52 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.3), 0 2px 6px rgba(0,0,0,.4)",
        }}
      >
        <div className="absolute inset-[12%] grid grid-cols-3 gap-[2px] opacity-60">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-[rgba(0,0,0,.35)] rounded-[1px]" />
          ))}
        </div>
      </div>

      <svg aria-hidden className="absolute top-[42%] left-[22%] w-[8%] opacity-80" viewBox="0 0 24 24" fill="none">
        <path d="M6 8c3 2 3 8 0 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10 5c5 3 5 11 0 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14 2c7 4 7 16 0 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      {/* Photo */}
      <div
        className="absolute top-[8%] right-[6%] w-[22%] aspect-square rounded-xl overflow-hidden border"
        style={{ borderColor: "rgba(167,243,208,.8)", boxShadow: "0 4px 14px rgba(0,0,0,.35)" }}
      >
        {data.photo_url ? (
          <img src={data.photo_url} alt={data.name} crossOrigin="anonymous" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/10 text-2xl font-extrabold">
            {initial}
          </div>
        )}
      </div>

      <div className="absolute left-[6%] right-[6%] top-[60%]">
        <p
          className="font-mono font-extrabold tracking-[0.18em] text-[15px] sm:text-[22px]"
          style={{
            textShadow:
              "0 1px 0 rgba(255,255,255,.25), 0 2px 0 rgba(0,0,0,.5), 0 4px 10px rgba(0,0,0,.35)",
            letterSpacing: "0.18em",
          }}
        >
          {(data.member_code ?? "CGF-XXXXXX").replace(/-/g, " · ")}
        </p>
      </div>

      <div className="absolute left-[6%] right-[6%] bottom-[6%] flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[7px] sm:text-[9px] tracking-[0.25em] uppercase opacity-70">Member</p>
          <p className="text-[12px] sm:text-base font-bold truncate uppercase tracking-wide">{data.name}</p>
          <p className="text-[9px] sm:text-[11px] opacity-80 truncate">
            {(data.role ?? "সদস্য")}{data.area ? ` · ${data.area}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[7px] sm:text-[9px] tracking-[0.2em] uppercase opacity-70">Member Since</p>
          <p className="font-mono font-bold text-[11px] sm:text-sm">{fmt(data.join_date)}</p>
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

function CardBack({ data, verifyUrl, org }: { data: MemberCardData; verifyUrl?: string; org: string }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl text-white"
      style={{
        aspectRatio: "1.586 / 1",
        background: "linear-gradient(135deg,#064e3b,#065f46 60%,#0d9488)",
        boxShadow:
          "0 30px 60px -25px rgba(6,78,59,.55), 0 10px 25px -10px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.1)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[34%] overflow-hidden">
        <img src={floodAsset.url} alt="ফাউন্ডেশনের ত্রাণ কার্যক্রম" crossOrigin="anonymous" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,78,59,.15) 0%, rgba(6,78,59,.85) 100%)" }} />
        <div className="absolute bottom-1 left-2 text-[7px] sm:text-[9px] tracking-widest uppercase opacity-90">Relief · Service · Unity</div>
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
          {data.member_code ?? ""}
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
