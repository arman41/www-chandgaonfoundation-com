
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { submitDonation } from "@/lib/donations.functions";
import { getDonationInfoFn } from "@/lib/foundation.functions";
import { useLanguage } from "@/hooks/use-language";



export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Chandgaon Foundation" },
      { name: "description", content: "Donate securely via bKash, Nagad, Rocket or Bank. Verify with TX ID." },
      { property: "og:title", content: "Donate — Chandgaon Foundation" },
      { property: "og:description", content: "Support Chandgaon Foundation's health, education and relief programs — secure bKash / Nagad / Rocket / bank payments." },
      { property: "og:url", content: "https://chandgaonfoundation.com/donate" },
      { name: "twitter:title", content: "Donate — Chandgaon Foundation" },
      { name: "twitter:description", content: "Support Chandgaon Foundation's health, education and relief programs." },
      { property: "og:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Donate — Chandgaon Foundation" },
      { name: "twitter:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/donate" }],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    purpose: typeof s.purpose === "string" ? s.purpose : undefined,
    activity: typeof s.activity === "string" ? s.activity : undefined,
  }),
  component: Donate,
  errorComponent: ({ error }) => (
    <div className="max-w-md mx-auto py-32 text-center">
      <p className="text-destructive font-semibold">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="py-32 text-center">Not found</div>,
});

const AMOUNTS = [500, 1000, 2500, 5000, 10000];

type Method = {
  id: "bkash" | "nagad" | "rocket" | "bank";
  labelBn: string;
  labelEn: string;
  num: string;
  typeBn: string;
  typeEn: string;
  color: string;
  fg: string;
};

const DEFAULT_METHODS: Method[] = [
  { id: "bkash", labelBn: "বিকাশ", labelEn: "bKash", num: "01711479595", typeBn: "পার্সোনাল (Send Money)", typeEn: "Personal (Send Money)", color: "#E2136E", fg: "#fff" },
  { id: "nagad", labelBn: "নগদ", labelEn: "Nagad", num: "01833221019", typeBn: "পার্সোনাল (Send Money)", typeEn: "Personal (Send Money)", color: "#EE1C25", fg: "#fff" },
  { id: "rocket", labelBn: "রকেট", labelEn: "Rocket", num: "01911306059", typeBn: "পার্সোনাল", typeEn: "Personal", color: "#8E2C8B", fg: "#fff" },
  { id: "bank", labelBn: "ইসলামি ব্যাংক", labelEn: "Islami Bank", num: "02676783", typeBn: "Islami Bank Bangladesh — চাঁদগাঁও শাখা", typeEn: "Islami Bank Bangladesh — Chandgaon Branch", color: "#0c2340", fg: "#fff" },
];

const PURPOSES = [
  { bn: "সাধারণ তহবিল", en: "General Fund" },
  { bn: "খাদ্য সহায়তা", en: "Food Aid" },
  { bn: "শিক্ষা বৃত্তি", en: "Education Scholarship" },
  { bn: "চিকিৎসা সহায়তা", en: "Medical Aid" },
  { bn: "দুর্যোগ ত্রাণ", en: "Disaster Relief" },
  { bn: "মসজিদ ও ধর্মীয় কাজ", en: "Mosque & Religious" },
  { bn: "যাকাত / ফিতরা", en: "Zakat / Fitra" },
];

type BankApp = { id: string; name: string; color: string; emoji: string };
const BANK_APPS: BankApp[] = [
  { id: "citytouch", name: "CityTouch", color: "linear-gradient(135deg,#ec4899,#be185d)", emoji: "C" },
  { id: "cellfin", name: "CellFin", color: "linear-gradient(135deg,#0ea5e9,#0369a1)", emoji: "📱" },
  { id: "nexuspay", name: "NexusPay", color: "linear-gradient(135deg,#6366f1,#4338ca)", emoji: "N" },
  { id: "bankasia", name: "Bank Asia", color: "linear-gradient(135deg,#dc2626,#7f1d1d)", emoji: "A" },
  { id: "upay", name: "Upay", color: "linear-gradient(135deg,#f97316,#c2410c)", emoji: "U" },
  { id: "tap", name: "Tap", color: "linear-gradient(135deg,#10b981,#047857)", emoji: "T" },
  { id: "mycash", name: "MyCash", color: "linear-gradient(135deg,#8b5cf6,#5b21b6)", emoji: "M" },
];

function Donate() {
  const { t, lang } = useLanguage();
  const submit = useServerFn(submitDonation);
  const fetchDonationInfo = useServerFn(getDonationInfoFn);

  const [banking, setBanking] = useState<{
    bkash_number: string | null;
    nagad_number: string | null;
    rocket_number: string | null;
    islami_bank_account: string | null;
  } | null>(null);

  useEffect(() => {
    fetchDonationInfo().then(setBanking).catch(() => setBanking(null));
  }, [fetchDonationInfo]);

  const { purpose: purposeParam, activity: activityIdParam } = Route.useSearch();

  const METHODS = useMemo<Method[]>(() => {
    return DEFAULT_METHODS.map((m) => {
      if (m.id === "bkash" && banking?.bkash_number) return { ...m, num: banking.bkash_number };
      if (m.id === "nagad" && banking?.nagad_number) return { ...m, num: banking.nagad_number };
      if (m.id === "rocket" && banking?.rocket_number) return { ...m, num: banking.rocket_number };
      if (m.id === "bank" && banking?.islami_bank_account) return { ...m, num: banking.islami_bank_account };
      return m;
    });
  }, [banking]);

  const purposeOptions = PURPOSES.map((p) => p.bn);
  const initialPurpose = purposeParam && purposeOptions.includes(purposeParam) ? purposeParam : purposeOptions[0];

  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [purpose, setPurpose] = useState(initialPurpose);
  const [methodId, setMethodId] = useState<Method["id"]>("bkash");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [txid, setTxid] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [receipt, setReceipt] = useState<null | {
    id: string;
    transaction_id: string | null;
    amount: number;
    donor_name: string;
    donated_at: string;
    status: string;
  }>(null);

  const [sandboxApp, setSandboxApp] = useState<BankApp | null>(null);
  const [sandboxStatus, setSandboxStatus] = useState<"loading" | "success" | "failed" | null>(null);

  useEffect(() => {
    if (!sandboxApp) return;

    setSandboxStatus("loading");

    const id = setTimeout(() => {
      // Simulated sandbox: 85% success
      setSandboxStatus(Math.random() < 0.85 ? "success" : "failed");
    }, 1400);

    return () => clearTimeout(id);
  }, [sandboxApp]);

  const final = useMemo(() => (custom ? Number(custom) || 0 : amount), [custom, amount]);
  const method = METHODS.find((m) => m.id === methodId)!;
  const methodLabel = lang === "bn" ? method.labelBn : method.labelEn;
  const methodType = lang === "bn" ? method.typeBn : method.typeEn;
  const locale = lang === "bn" ? "bn-BD" : "en-US";
  const currency = lang === "bn" ? "৳" : "৳";

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(method.num);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (final < 10) return setError(t("সর্বনিম্ন ১০ টাকা দান করুন", "Minimum donation is 10 BDT"));

    if (!/^01[3-9]\d{8}$/.test(phone))
      return setError(t("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন", "Enter a valid 11-digit mobile number"));

    if (txid.trim().length < 4)
      return setError(t("সঠিক TX ID দিন", "Enter a valid TX ID"));

    setLoading(true);

    try {
      const res = await submit({
        data: {
          donor_name: name.trim(),
          donor_phone: phone.trim(),
          amount: final,
          method: methodId,
          purpose,
          transaction_id: txid.trim(),
          activity_id: activityIdParam ?? null,
        },
      });

      setReceipt(res as any);
    } catch (err: any) {
      setError(err?.message || t("জমা দেওয়া যায়নি", "Could not submit"));
    } finally {
      setLoading(false);
    }
  };

  if (receipt) return <Receipt receipt={receipt} method={method} purpose={purpose} />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {t("অনলাইন ডোনেশন", "Online Donation")}
        </p>

        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          {t("আপনার দান,", "Your donation,")}{" "}
          <span style={{ color: "var(--gold)" }}>
            {t("একটি পরিবারের আশা", "hope for a family")}
          </span>
        </h1>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          <StepDot active={step === 1} done={step > 1} n={1} label={t("পরিমাণ", "Amount")} />
          <span className="w-8 h-px bg-border" />
          <StepDot active={step === 2} n={2} label={t("যাচাই", "Verify")} />
        </div>
      </div>
