import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { submitHelpApplication } from "@/lib/help-applications";
import { listActiveProjects, type AidProject } from "@/lib/aid-projects";
import { supabase } from "@/integrations/supabase/client";
import { generateAndUploadReceipt } from "@/lib/application-pdf";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
import { useAuth } from "@/hooks/use-auth";
import { extractNidInfo } from "@/lib/nid-ocr.functions";
import { divisions, wards, formatBdAddress, upazilasByDistrict, getUnionsByUpazila } from "@/data/bd-locations";
import { toast } from "sonner";
import { Download, Pencil, ScanLine, Upload, Check, X, LogIn, MapPin } from "lucide-react";

async function fileToCompressedDataUrl(file: File, maxDim = 1400, quality = 0.82): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("ছবি লোড ব্যর্থ"));
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "সাহায্যের আবেদন | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও ফাউন্ডেশনের চলমান সাহায্য প্রকল্পে অনলাইনে আবেদন করুন—আর্থিক, চিকিৎসা, শিক্ষা, খাদ্য ও দুর্যোগকালীন সহায়তার জন্য সহজ ফরম পূরণ করে আবেদন জমা দিন।" },
      { property: "og:title", content: "সাহায্যের আবেদন | চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "চাঁদগাঁও ফাউন্ডেশনের চলমান সাহায্য প্রকল্পে অনলাইনে আবেদন করুন—আর্থিক, চিকিৎসা, শিক্ষা ও দুর্যোগকালীন সহায়তার জন্য আজই ফরম পূরণ করুন।" },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/help" },
      { name: "twitter:title", content: "সাহায্যের আবেদন | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "twitter:description", content: "চাঁদগাঁও ফাউন্ডেশনের চলমান সাহায্য প্রকল্পে অনলাইনে আবেদন করুন—আর্থিক, চিকিৎসা, শিক্ষা ও দুর্যোগকালীন সহায়তার জন্য আজই ফরম পূরণ করুন।" },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "সাহায্যের আবেদন | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/help" }],
  }),
});

const helpTypes = [
  "আর্থিক সহায়তা", "চিকিৎসা সহায়তা", "শিক্ষা সহায়তা",
  "খাদ্য সহায়তা", "শীতবস্ত্র", "দুর্যোগকালীন সহায়তা", "অন্যান্য",
];

function mapCategoryToType(category: string | null | undefined): string {
  const c = (category || "").toLowerCase();
  if (c.includes("medical") || c.includes("চিকিৎসা") || c.includes("health")) return "চিকিৎসা সহায়তা";
  if (c.includes("education") || c.includes("শিক্ষা")) return "শিক্ষা সহায়তা";
  if (c.includes("food") || c.includes("খাদ্য") || c.includes("ifter") || c.includes("ইফতার")) return "খাদ্য সহায়তা";
  if (c.includes("winter") || c.includes("শীত")) return "শীতবস্ত্র";
  if (c.includes("relief") || c.includes("flood") || c.includes("disaster") || c.includes("ত্রাণ") || c.includes("দুর্যোগ")) return "দুর্যোগকালীন সহায়তা";
  if (c.includes("financial") || c.includes("আর্থিক") || c.includes("cash")) return "আর্থিক সহায়তা";
  return "অন্যান্য";
}

const MAX_IMAGE = 5 * 1024 * 1024;
const inp = "w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `applications/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("foundation-media").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("foundation-media").getPublicUrl(path).data.publicUrl;
}

type AddressParts = {
  division: string; district: string; thana: string;
  union: string; ward: string; village: string;
};
const emptyAddr: AddressParts = { division: "", district: "", thana: "", union: "", ward: "", village: "" };

function HelpPage() {
  const { settings } = useFoundationSettings();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<AidProject[]>([]);
  const [done, setDone] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);


  const [form, setForm] = useState({
    project_id: "",
    name: "",
    father_name: "",
    nid: "",
    phone: "",
    type: helpTypes[0],
    reason: "",
  });
  const [present, setPresent] = useState<AddressParts>(emptyAddr);
  const [permanent, setPermanent] = useState<AddressParts>(emptyAddr);
  const [sameAddr, setSameAddr] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);

  useEffect(() => { listActiveProjects().then(setProjects); }, []);

  // Auto-mirror permanent from present when checkbox is on
  useEffect(() => { if (sameAddr) setPermanent(present); }, [sameAddr, present]);

  const presentDistricts = useMemo(
    () => divisions.find((d) => d.name === present.division)?.districts ?? [],
    [present.division],
  );
  const permanentDistricts = useMemo(
    () => divisions.find((d) => d.name === permanent.division)?.districts ?? [],
    [permanent.division],
  );

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const updatePresent = <K extends keyof AddressParts>(k: K, v: string) => {
    setPresent((p) => {
      const next = { ...p, [k]: v };
      if (k === "division") { next.district = ""; next.thana = ""; next.union = ""; next.ward = ""; }
      if (k === "district") { next.thana = ""; next.union = ""; next.ward = ""; }
      if (k === "thana") { next.union = ""; next.ward = ""; }
      if (k === "union") { next.ward = ""; }
      return next;
    });
  };
  const updatePermanent = <K extends keyof AddressParts>(k: K, v: string) => {
    setPermanent((p) => {
      const next = { ...p, [k]: v };
      if (k === "division") { next.district = ""; next.thana = ""; next.union = ""; next.ward = ""; }
      if (k === "district") { next.thana = ""; next.union = ""; next.ward = ""; }
      if (k === "thana") { next.union = ""; next.ward = ""; }
      if (k === "union") { next.ward = ""; }
      return next;
    });
  };

  const [locating, setLocating] = useState(false);
  const autoFillLocation = () => {
    if (!navigator.geolocation) { toast.error("ব্রাউজার অবস্থান শনাক্ত করতে পারছে না"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = (lang: string) =>
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&addressdetails=1&lat=${latitude}&lon=${longitude}&accept-language=${lang}`;
          const [rBn, rEn] = await Promise.all([
            fetch(url("bn"), { headers: { Accept: "application/json" } }).then((r) => r.json()).catch(() => ({})),
            fetch(url("en"), { headers: { Accept: "application/json" } }).then((r) => r.json()).catch(() => ({})),
          ]);
          const aBn = rBn.address ?? {};
          const aEn = rEn.address ?? {};

          // Strip common admin suffixes (both Bangla & English)
          const norm = (s: string) =>
            (s || "")
              .replace(/\s*(Division|District|Upazila|Sub[- ]?district|Thana|Union|Sadar|City|Municipality)\s*/gi, "")
              .replace(/\s*(বিভাগ|জেলা|উপজেলা|থানা|ইউনিয়ন|সদর|সিটি কর্পোরেশন|পৌরসভা)\s*/g, "")
              .trim();

          // English → Bangla division map (Nominatim often returns English)
          const divEnMap: Record<string, string> = {
            "chattogram": "চট্টগ্রাম", "chittagong": "চট্টগ্রাম",
            "dhaka": "ঢাকা", "rajshahi": "রাজশাহী", "khulna": "খুলনা",
            "barisal": "বরিশাল", "barishal": "বরিশাল",
            "sylhet": "সিলেট", "rangpur": "রংপুর", "mymensingh": "ময়মনসিংহ",
          };
          const distEnMap: Record<string, string> = {
            "chattogram": "চট্টগ্রাম", "chittagong": "চট্টগ্রাম",
            "cox's bazar": "কক্সবাজার", "coxs bazar": "কক্সবাজার",
            "comilla": "কুমিল্লা", "cumilla": "কুমিল্লা",
            "chandpur": "চাঁদপুর", "brahmanbaria": "ব্রাহ্মণবাড়িয়া",
            "feni": "ফেনী", "noakhali": "নোয়াখালী", "lakshmipur": "লক্ষ্মীপুর",
            "rangamati": "রাঙ্গামাটি", "khagrachhari": "খাগড়াছড়ি", "bandarban": "বান্দরবান",
            "dhaka": "ঢাকা", "gazipur": "গাজীপুর", "narsingdi": "নরসিংদী",
            "narayanganj": "নারায়ণগঞ্জ", "munshiganj": "মুন্সিগঞ্জ", "manikganj": "মানিকগঞ্জ",
            "tangail": "টাঙ্গাইল", "kishoreganj": "কিশোরগঞ্জ", "faridpur": "ফরিদপুর",
            "gopalganj": "গোপালগঞ্জ", "madaripur": "মাদারীপুর", "shariatpur": "শরীয়তপুর",
            "rajbari": "রাজবাড়ী", "rajshahi": "রাজশাহী", "chapainawabganj": "চাঁপাইনবাবগঞ্জ",
            "naogaon": "নওগাঁ", "natore": "নাটোর", "pabna": "পাবনা", "sirajganj": "সিরাজগঞ্জ",
            "bogra": "বগুড়া", "bogura": "বগুড়া", "joypurhat": "জয়পুরহাট",
            "khulna": "খুলনা", "bagerhat": "বাগেরহাট", "satkhira": "সাতক্ষীরা",
            "jessore": "যশোর", "jashore": "যশোর", "jhenaidah": "ঝিনাইদহ", "magura": "মাগুরা",
            "narail": "নড়াইল", "kushtia": "কুষ্টিয়া", "chuadanga": "চুয়াডাঙ্গা", "meherpur": "মেহেরপুর",
            "barisal": "বরিশাল", "barishal": "বরিশাল", "bhola": "ভোলা", "patuakhali": "পটুয়াখালী",
            "pirojpur": "পিরোজপুর", "jhalokati": "ঝালকাঠি", "barguna": "বরগুনা",
            "sylhet": "সিলেট", "moulvibazar": "মৌলভীবাজার", "habiganj": "হবিগঞ্জ", "sunamganj": "সুনামগঞ্জ",
            "rangpur": "রংপুর", "dinajpur": "দিনাজপুর", "thakurgaon": "ঠাকুরগাঁও", "panchagarh": "পঞ্চগড়",
            "kurigram": "কুড়িগ্রাম", "lalmonirhat": "লালমনিরহাট", "nilphamari": "নীলফামারী", "gaibandha": "গাইবান্ধা",
            "mymensingh": "ময়মনসিংহ", "jamalpur": "জামালপুর", "netrokona": "নেত্রকোণা",
            "netrakona": "নেত্রকোণা", "sherpur": "শেরপুর",
          };

          // Resolve division
          const divBn = norm(aBn.state || aBn.region || "");
          const divEn = norm(aEn.state || aEn.region || "").toLowerCase();
          const divFromEn = divEnMap[divEn] || "";
          const div =
            divisions.find((d) => divBn && (d.name === divBn || d.name.includes(divBn) || divBn.includes(d.name))) ||
            divisions.find((d) => divFromEn && d.name === divFromEn);
          const divName = div?.name || "";

          // Resolve district
          const distBn = norm(aBn.state_district || aBn.county || aBn.district || "");
          const distEn = norm(aEn.state_district || aEn.county || aEn.district || "").toLowerCase();
          const distFromEn = distEnMap[distEn] || "";
          const distList = div?.districts ?? [];
          const dist =
            distList.find((d) => distBn && (d.name === distBn || d.name.includes(distBn) || distBn.includes(d.name))) ||
            distList.find((d) => distFromEn && d.name === distFromEn);
          const distName = dist?.name || distBn || distFromEn || "";

          // Resolve thana / upazila
          const thanaBn = norm(aBn.city || aBn.town || aBn.municipality || aBn.subdistrict || aBn.county || "");
          const upList = distName ? (upazilasByDistrict[distName] ?? []) : [];
          const upMatch = upList.find((u) => thanaBn && (u === thanaBn || u.includes(thanaBn) || thanaBn.includes(u)));
          const thanaName = upMatch || thanaBn || "";

          // Resolve union
          const unionBn = norm(aBn.suburb || aBn.village || aBn.neighbourhood || "");
          const unionList = thanaName ? getUnionsByUpazila(distName, thanaName) : [];
          const uMatch = unionList.find((u) => unionBn && (u === unionBn || u.includes(unionBn) || unionBn.includes(u)));
          const unionName = uMatch || unionBn || "";

          const villageRaw = aBn.hamlet || aBn.neighbourhood || aBn.village || "";

          setPresent({
            division: divName,
            district: distName,
            thana: thanaName,
            union: unionName,
            ward: "",
            village: villageRaw || "",
          });
          if (divName && distName) toast.success("অবস্থান থেকে ঠিকানা পূরণ হয়েছে — যাচাই করুন");
          else toast.warning("আংশিক ঠিকানা পাওয়া গেছে — বাকিটা ম্যানুয়ালি পূরণ করুন");
        } catch {
          toast.error("অবস্থান থেকে ঠিকানা আনা যায়নি");
        } finally {
          setLocating(false);
        }
      },
      () => { setLocating(false); toast.error("অবস্থান অনুমতি পাওয়া যায়নি"); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };


  const runNidScan = async () => {
    if (!nidFront && !nidBack) { toast.error("NID-এর কমপক্ষে একটি ছবি দিন"); return; }
    try {
      setOcrLoading(true);
      const [front, back] = await Promise.all([
        nidFront ? fileToCompressedDataUrl(nidFront) : Promise.resolve(null),
        nidBack ? fileToCompressedDataUrl(nidBack) : Promise.resolve(null),
      ]);
      const r = await extractNidInfo({ data: { front, back } });
      setForm((f) => ({
        ...f,
        name: f.name || r.name_bn || r.name || "",
        father_name: f.father_name || r.father_name || "",
        nid: f.nid || r.nid || "",
      }));
      toast.success("NID থেকে তথ্য পূরণ হয়েছে");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "NID স্ক্যান ব্যর্থ");
    } finally { setOcrLoading(false); }
  };

  const validateNid = (v: string): string => {
    const d = v.replace(/[^0-9]/g, "");
    if (!d) return "NID নম্বর আবশ্যক।";
    if (![10, 13, 17].includes(d.length)) return "NID অবশ্যই ১০, ১৩ বা ১৭ সংখ্যা হতে হবে।";
    return "";
  };
  const checkFile = (f: File | null, label: string): string => {
    if (!f) return "";
    if (f.size > MAX_IMAGE) return `${label}: ৫ MB এর কম হতে হবে।`;
    if (!f.type.startsWith("image/")) return `${label}: শুধু ছবি।`;
    return "";
  };

  const allowedWards = (settings?.allowed_wards ?? []).filter(Boolean);
  const allowedUnions = (settings?.allowed_unions ?? []).filter(Boolean);
  const allowedThanas = (settings?.allowed_thanas ?? []).filter(Boolean);
  const unionWardMap = (settings?.union_ward_map ?? {}) as Record<string, string[]>;
  const presentThanaAllowed = allowedThanas.length === 0 || (present.thana.trim() !== "" && allowedThanas.includes(present.thana.trim()));
  const permanentThanaAllowed = allowedThanas.length === 0 || (permanent.thana.trim() !== "" && allowedThanas.includes(permanent.thana.trim()));

  const goPreview = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.reason.trim()) {
      toast.error("আবশ্যিক ঘরগুলো পূরণ করুন"); return;
    }
    const e = validateNid(form.nid); if (e) { toast.error(e); return; }
    if (!present.division || !present.district) {
      toast.error("বর্তমান ঠিকানার বিভাগ ও জেলা নির্বাচন করুন"); return;
    }
    if (allowedThanas.length > 0) {
      const t = present.thana.trim();
      if (!t || !allowedThanas.includes(t)) {
        toast.error("আপনার এলাকা থেকে আবেদন গ্রহণ করা হচ্ছে না");
        return;
      }
    }
    if (allowedUnions.length > 0) {
      const u = present.union.trim();
      if (!u || !allowedUnions.includes(u)) {
        toast.error("আপনার এলাকা থেকে আবেদন গ্রহণ করা হচ্ছে না");
        return;
      }
      const wardsForUnion = unionWardMap[u] ?? [];
      if (wardsForUnion.length > 0) {
        const w = present.ward.trim();
        if (!w || !wardsForUnion.includes(w)) {
          toast.error("আপনার এলাকা থেকে আবেদন গ্রহণ করা হচ্ছে না");
          return;
        }
      }
    } else if (allowedWards.length > 0) {
      const w = present.ward.trim();
      if (!w || !allowedWards.includes(w)) {
        toast.error("আপনার এলাকা থেকে আবেদন গ্রহণ করা হচ্ছে না");
        return;
      }
    }
    if (!photo) { toast.error("আপনার ছবি আপলোড করুন"); return; }
    if (!nidFront) { toast.error("NID-এর সামনের ছবি আপলোড করুন"); return; }
    if (!nidBack) { toast.error("NID-এর পিছনের ছবি আপলোড করুন"); return; }
    const fe = checkFile(photo, "ছবি") || checkFile(nidFront, "NID সামনে") || checkFile(nidBack, "NID পিছনে");
    if (fe) { toast.error(fe); return; }
    setPreviewing(true);
  };


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const [photo_url, nid_front_url, nid_back_url] = await Promise.all([
        photo ? uploadImage(photo, "photos") : Promise.resolve(null),
        nidFront ? uploadImage(nidFront, "nid-front") : Promise.resolve(null),
        nidBack ? uploadImage(nidBack, "nid-back") : Promise.resolve(null),
      ]);
      const fileCount = [photo_url, nid_front_url, nid_back_url].filter(Boolean).length;
      const presentStr = formatBdAddress({
        division: present.division, district: present.district,
        upazila: present.thana, union: present.union, ward: present.ward, village: present.village,
      });
      const permanentStr = formatBdAddress({
        division: permanent.division, district: permanent.district,
        upazila: permanent.thana, union: permanent.union, ward: permanent.ward, village: permanent.village,
      });
      const saved = await submitHelpApplication({
        name: form.name.trim(),
        phone: form.phone.trim(),
        nid: form.nid.trim(),
        address: presentStr,
        type: form.type,
        amount: "",
        reason: form.reason.trim(),
        fileCount,
        project_id: form.project_id || null,
        father_name: form.father_name.trim() || null,
        present_address: presentStr || null,
        permanent_address: permanentStr || null,
        photo_url, nid_front_url, nid_back_url,
      });
      setAppId(saved.app_code);
      setDone(true);

      setGeneratingPdf(true);
      const selectedProject = projects.find((p) => p.id === form.project_id);
      generateAndUploadReceipt({
        app_code: saved.app_code,
        name: form.name.trim(),
        phone: form.phone.trim(),
        nid: form.nid.trim(),
        type: form.type,
        amount: null,
        requested_amount: null,
        reason: form.reason.trim(),
        project_name: selectedProject?.name ?? null,
        father_name: form.father_name.trim() || null,
        mother_name: null,
        present_address: presentStr || null,
        photo_url,
        foundation_name: settings?.name || "চাঁদগাঁও ফাউন্ডেশন",
        created_at: new Date().toISOString(),
      }).then((url) => {
        setPdfUrl(url);
        if (url) toast.success("রসিদ PDF প্রস্তুত হয়েছে");
      }).finally(() => setGeneratingPdf(false));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "আবেদন জমা দিতে সমস্যা হয়েছে");
    } finally { setSubmitting(false); }
  };

  if (authLoading) {
    return (
      <section className="max-w-md mx-auto px-6 py-32 text-center">
        <span className="inline-block h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">লোড হচ্ছে...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="bg-card border border-border rounded-2xl p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">সাইন ইন প্রয়োজন</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            সাহায্যের আবেদন করতে অনুগ্রহ করে প্রথমে সাইন ইন বা একাউন্ট তৈরি করুন। এটি আবেদনের নিরাপত্তা ও ট্র্যাকিং নিশ্চিত করে।
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
          >
            <LogIn className="h-4 w-4" /> সাইন ইন / সাইন আপ
          </Link>
        </div>
      </section>
    );
  }

  if (done) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-6">🤲</div>
        <h1 className="text-3xl font-bold text-primary">আপনার আবেদন গ্রহণ করা হয়েছে</h1>
        <p className="mt-4 text-muted-foreground">আমাদের প্রতিনিধি যাচাই করে শীঘ্রই যোগাযোগ করবেন।</p>
        {appId && (
          <div className="mt-8 mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-left" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">আপনার আবেদন নম্বর</p>
            <p className="mt-2 text-2xl font-bold text-primary tracking-wider select-all">{appId}</p>
            <div className="mt-5 space-y-2">
              {generatingPdf && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  রসিদ PDF তৈরি হচ্ছে...
                </div>
              )}
              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noreferrer" download={`${appId}.pdf`} className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition">
                  <Download className="h-4 w-4" /> রসিদ PDF ডাউনলোড
                </a>
              )}
            </div>
            <Link to="/track" search={{ id: appId }} className="mt-4 inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
              এখনই ট্র্যাক করুন →
            </Link>
          </div>
        )}
      </section>
    );
  }

  if (previewing) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16">
        <PreviewCard
          form={form}
          present={present}
          permanent={permanent}
          photo={photo}
          nidFront={nidFront}
          nidBack={nidBack}
          projectName={projects.find((p) => p.id === form.project_id)?.name ?? null}
          onEdit={() => setPreviewing(false)}
          onSubmit={onSubmit}
          submitting={submitting}
        />
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">সাহায্যের আবেদন</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">আপনার প্রয়োজনের কথা জানান</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">নিচের ফরমটি পূরণ করে আবেদন জমা দিন। সকল তথ্য গোপন রাখা হবে।</p>
      </div>


      <form
        onSubmit={(e) => { e.preventDefault(); goPreview(); }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        {projects.length > 0 && (
          <Section title="প্রকল্প নির্বাচন">
            <Field label="চলমান প্রকল্প (ঐচ্ছিক)">
              <select
                value={form.project_id}
                onChange={(e) => {
                  const pid = e.target.value;
                  const proj = projects.find((p) => p.id === pid);
                  setForm((f) => ({ ...f, project_id: pid, type: proj ? mapCategoryToType(proj.category) : f.type }));
                }}
                className={inp}
              >
                <option value="">— সাধারণ আবেদন —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
              </select>
            </Field>
          </Section>
        )}

        <Section title="ব্যক্তিগত তথ্য">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="পূর্ণ নাম *">
              <input required value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={100} className={inp} />
            </Field>
            <Field label="পিতার নাম">
              <input value={form.father_name} onChange={(e) => update("father_name", e.target.value)} maxLength={100} className={inp} />
            </Field>
            <Field label="মোবাইল নম্বর *">
              <input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={20} className={inp} placeholder="01XXXXXXXXX" />
            </Field>
            <Field label="NID নম্বর *">
              <input required inputMode="numeric" value={form.nid} onChange={(e) => update("nid", e.target.value.replace(/[^0-9]/g, ""))} maxLength={17} className={inp} placeholder="১০ / ১৩ / ১৭ সংখ্যা" />
            </Field>
          </div>
        </Section>

        <Section title="বর্তমান ঠিকানা">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={autoFillLocation}
              disabled={locating}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition disabled:opacity-60"
            >
              {locating ? (
                <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : <MapPin className="h-4 w-4" />}
              {locating ? "অবস্থান নেওয়া হচ্ছে..." : "আমার অবস্থান থেকে স্বয়ংক্রিয় পূরণ"}
            </button>
            <span className="text-xs text-muted-foreground">বিভাগ, জেলা, থানা, ইউনিয়ন ও গ্রাম স্বয়ংক্রিয়ভাবে পূরণ হবে।</span>
          </div>
          <AddressFields value={present} onChange={updatePresent} districts={presentDistricts} unionWardMap={presentThanaAllowed ? unionWardMap : undefined} />
        </Section>

        <Section title="স্থায়ী ঠিকানা">
          <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
            <input type="checkbox" checked={sameAddr} onChange={(e) => setSameAddr(e.target.checked)} className="h-4 w-4 accent-primary" />
            <span>বর্তমান ঠিকানার সাথে অভিন্ন</span>
          </label>
          {!sameAddr && (
            <AddressFields value={permanent} onChange={updatePermanent} districts={permanentDistricts} unionWardMap={permanentThanaAllowed ? unionWardMap : undefined} />
          )}
        </Section>

        <Section title="সাহায্যের তথ্য">
          <Field label="সাহায্যের ধরন *">
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              disabled={!!form.project_id}
              className={inp + (form.project_id ? " opacity-70 cursor-not-allowed" : "")}
            >
              {helpTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {form.project_id && <p className="mt-1 text-xs text-muted-foreground">প্রকল্প থেকে স্বয়ংক্রিয়ভাবে নির্ধারিত।</p>}
          </Field>
          <Field label="আবেদনের কারণ *">
            <textarea required rows={4} value={form.reason} onChange={(e) => update("reason", e.target.value)} maxLength={1000} className={inp + " h-auto py-2"} placeholder="আপনার সমস্যা সংক্ষেপে লিখুন..." />
          </Field>
        </Section>

        <Section title="ছবি ও NID আপলোড *">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FilePickerButton label="আপনার ছবি *" file={photo} onChange={setPhoto} />
            <FilePickerButton label="NID সামনে *" file={nidFront} onChange={setNidFront} />
            <FilePickerButton label="NID পিছনে *" file={nidBack} onChange={setNidBack} />
          </div>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={runNidScan}
              disabled={ocrLoading || (!nidFront && !nidBack)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50"
            >
              {ocrLoading ? (
                <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : <ScanLine className="h-4 w-4" />}
              {ocrLoading ? "স্ক্যান চলছে..." : "NID স্ক্যান (ঐচ্ছিক)"}
            </button>
            <span className="text-xs text-muted-foreground">প্রতিটি ছবি সর্বোচ্চ ৫ MB।</span>
          </div>
        </Section>

        <p className="text-xs text-muted-foreground">* চিহ্নিত ঘর আবশ্যক। প্রিভিউতে সব তথ্য ও ছবি দেখতে পারবেন।</p>

        <button type="submit" className="w-full h-12 rounded-full text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          প্রিভিউ দেখুন →
        </button>
      </form>
    </section>
  );
}

function StepBadge({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        className={
          "inline-flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-bold " +
          (done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
        }
      >
        {n}
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}

function AddressFields({
  value, onChange, districts, unionWardMap,
}: {
  value: AddressParts;
  onChange: <K extends keyof AddressParts>(k: K, v: string) => void;
  districts: { name: string }[];
  unionWardMap?: Record<string, string[]>;
}) {
  const OTHER = "__other__";
  const cleanThana = value.thana.trim();
  const cleanUnion = value.union.trim();
  const upazilaList = value.district ? (upazilasByDistrict[value.district] ?? []) : [];
  const mapUnions = unionWardMap ? Object.keys(unionWardMap).filter(Boolean) : [];
  const restrictUnions = mapUnions.length > 0;
  const baseUnionList = cleanThana ? getUnionsByUpazila(value.district, cleanThana) : [];
  const unionList = restrictUnions ? mapUnions : baseUnionList;
  const thanaInList = !!cleanThana && upazilaList.includes(cleanThana);
  const unionInList = !!cleanUnion && unionList.includes(cleanUnion);
  const thanaManual = !!cleanThana && !thanaInList;
  const unionManual = !restrictUnions && !!cleanUnion && !unionInList;
  const needsUnionTextInput = !restrictUnions && !!cleanThana && (unionList.length === 0 || unionManual);
  const wardsForUnion = restrictUnions ? (unionWardMap?.[cleanUnion] ?? []) : [];
  const restrictWards = restrictUnions && wardsForUnion.length > 0;
  const wardOptions = restrictWards ? wardsForUnion : wards;
  const wardInList = value.ward && wardOptions.includes(value.ward);
  const wardManual = !restrictWards && !!value.ward && !wardInList;


  return (
    <div className="space-y-4">
      {/* Step 1 & 2 — Division + District */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <StepBadge n={1} label="বিভাগ" done={!!value.division} />
          <select value={value.division} onChange={(e) => onChange("division", e.target.value)} className={inp}>
            <option value="">— বিভাগ নির্বাচন —</option>
            {divisions.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <StepBadge n={2} label="জেলা" done={!!value.district} />
          <select value={value.district} onChange={(e) => onChange("district", e.target.value)} disabled={!value.division} className={inp + (!value.division ? " opacity-60 cursor-not-allowed" : "")}>
            <option value="">— জেলা নির্বাচন —</option>
            {districts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Step 3 & 4 — Thana + Union */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <StepBadge n={3} label="থানা / উপজেলা" done={!!value.thana.trim()} />
          <select
            value={thanaManual ? OTHER : value.thana}
            onChange={(e) => onChange("thana", e.target.value === OTHER ? " " : e.target.value)}
            disabled={!value.district}
            className={inp + (!value.district ? " opacity-60 cursor-not-allowed" : "")}
          >
            <option value="">— থানা নির্বাচন —</option>
            {upazilaList.map((u) => <option key={u} value={u}>{u}</option>)}
            <option value={OTHER}>অন্যান্য (লিখুন)</option>
          </select>
          {thanaManual && (
            <input
              autoFocus
              value={value.thana.trim()}
              onChange={(e) => onChange("thana", e.target.value || " ")}
              maxLength={80}
              className={inp + " mt-2"}
              placeholder="থানা/উপজেলার নাম লিখুন"
            />
          )}
        </div>
        <div>
          <StepBadge n={4} label="ইউনিয়ন / পৌরসভা / সিটি কর্পোরেশন" done={!!cleanUnion} />
          {restrictUnions ? (
            <select
              value={value.union}
              onChange={(e) => onChange("union", e.target.value)}
              className={inp}
            >
              <option value="">— ইউনিয়ন নির্বাচন —</option>
              {unionList.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          ) : unionList.length > 0 && !unionManual ? (
            <select
              value={value.union}
              onChange={(e) => onChange("union", e.target.value)}
              disabled={!cleanThana}
              className={inp + (!cleanThana ? " opacity-60 cursor-not-allowed" : "")}
            >
              <option value="">— ইউনিয়ন নির্বাচন —</option>
              {unionList.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          ) : (
            <input
              autoFocus={!!cleanThana}
              disabled={!cleanThana}
              value={value.union.trim()}
              onChange={(e) => onChange("union", e.target.value || " ")}
              maxLength={80}
              className={inp + (!cleanThana ? " opacity-60 cursor-not-allowed" : "")}
              placeholder={cleanThana ? "ইউনিয়ন/পৌরসভা/সিটি কর্পোরেশনের নাম লিখুন" : "আগে থানা নির্বাচন করুন"}
            />
          )}
          {needsUnionTextInput && (
            <p className="mt-1 text-[11px] text-muted-foreground">এই এলাকার জন্য নামটি সরাসরি লিখুন—ড্রপডাউনে “অন্যান্য” দেখানো হবে না।</p>
          )}
        </div>
      </div>

      {/* Step 5 — Ward + Village */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <StepBadge n={5} label="ওয়ার্ড" done={!!value.ward.trim()} />
          {restrictWards ? (
            <select
              value={value.ward}
              onChange={(e) => onChange("ward", e.target.value)}
              disabled={!cleanUnion}
              className={inp + (!cleanUnion ? " opacity-60 cursor-not-allowed" : "")}
            >
              <option value="">— ওয়ার্ড নির্বাচন —</option>
              {wardOptions.map((w) => <option key={w} value={w}>ওয়ার্ড {w}</option>)}
            </select>
          ) : (
            <>
              <select
                value={wardManual ? OTHER : value.ward}
                onChange={(e) => onChange("ward", e.target.value === OTHER ? " " : e.target.value)}
                className={inp}
              >
                <option value="">— ওয়ার্ড নির্বাচন —</option>
                {wardOptions.map((w) => <option key={w} value={w}>ওয়ার্ড {w}</option>)}
                <option value={OTHER}>অন্যান্য (লিখুন)</option>
              </select>
              {wardManual && (
                <input
                  autoFocus
                  value={value.ward.trim()}
                  onChange={(e) => onChange("ward", e.target.value || " ")}
                  maxLength={20}
                  className={inp + " mt-2"}
                  placeholder="ওয়ার্ড নম্বর/নাম লিখুন"
                />
              )}
            </>
          )}

        </div>
        <div>
          <StepBadge n={6} label="গ্রাম / মহল্লা / বাড়ি" done={!!value.village.trim()} />
          <input
            value={value.village}
            onChange={(e) => onChange("village", e.target.value)}
            maxLength={120}
            className={inp}
            placeholder="গ্রাম, মহল্লা বা বাড়ির ঠিকানা"
          />
        </div>
      </div>
    </div>
  );
}

function FilePickerButton({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div>
      <span className="block mb-2 text-sm font-medium text-foreground">{label}</span>
      <label className="flex items-center justify-between gap-2 h-11 px-3 rounded-lg border border-dashed border-input bg-background text-xs font-semibold cursor-pointer hover:bg-accent/30 transition">
        <span className="inline-flex items-center gap-2 truncate">
          {file ? <Check className="h-4 w-4 text-emerald-600 shrink-0" /> : <Upload className="h-4 w-4 text-primary shrink-0" />}
          <span className="truncate">{file ? file.name : "ফাইল বাছাই করুন"}</span>
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
      {file && (
        <button type="button" onClick={() => onChange(null)} className="mt-1 inline-flex items-center gap-1 text-xs text-destructive hover:underline">
          <X className="h-3 w-3" /> সরান
        </button>
      )}
    </div>
  );
}

function PreviewCard({
  form, present, permanent, photo, nidFront, nidBack, projectName, onEdit, onSubmit, submitting,
}: {
  form: { project_id: string; name: string; father_name: string; nid: string; phone: string; type: string; reason: string };
  present: AddressParts; permanent: AddressParts;
  photo: File | null; nidFront: File | null; nidBack: File | null;
  projectName: string | null;
  onEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  const photoUrl = photo ? URL.createObjectURL(photo) : null;
  const nidFrontUrl = nidFront ? URL.createObjectURL(nidFront) : null;
  const nidBackUrl = nidBack ? URL.createObjectURL(nidBack) : null;
  const presentStr = formatBdAddress({ division: present.division, district: present.district, upazila: present.thana, union: present.union, ward: present.ward, village: present.village });
  const permanentStr = formatBdAddress({ division: permanent.division, district: permanent.district, upazila: permanent.thana, union: permanent.union, ward: permanent.ward, village: permanent.village });
  const Row = ({ k, v }: { k: string; v: string | null | undefined }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-border/60 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v || "—"}</span>
    </div>
  );
  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">প্রিভিউ</p>
          <h2 className="mt-1 text-xl font-bold">তথ্য যাচাই করুন</h2>
          <p className="text-xs text-muted-foreground mt-1">ভুল থাকলে এডিট করুন, ঠিক থাকলে জমা দিন।</p>
        </div>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition">
          <Pencil className="h-3.5 w-3.5" /> এডিট করুন
        </button>
      </div>

      {(photoUrl || nidFrontUrl || nidBackUrl) && (
        <div className="grid grid-cols-3 gap-3">
          {photoUrl && <img src={photoUrl} alt="আপনার ছবি" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />}
          {nidFrontUrl && <img src={nidFrontUrl} alt="NID সামনে" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />}
          {nidBackUrl && <img src={nidBackUrl} alt="NID পিছনে" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />}
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 mb-2">ব্যক্তিগত তথ্য</h3>
        <Row k="নাম" v={form.name} />
        <Row k="পিতার নাম" v={form.father_name} />
        <Row k="মোবাইল" v={form.phone} />
        <Row k="NID" v={form.nid} />
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 mb-2">ঠিকানা</h3>
        <Row k="বর্তমান" v={presentStr} />
        <Row k="স্থায়ী" v={permanentStr} />
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 mb-2">সাহায্যের তথ্য</h3>
        {projectName && <Row k="প্রকল্প" v={projectName} />}
        <Row k="ধরন" v={form.type} />
        <Row k="কারণ" v={form.reason} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onEdit} disabled={submitting} className="flex-1 h-12 rounded-full text-sm font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50">
          ← এডিট করুন
        </button>
        <button type="button" onClick={(e) => onSubmit(e as unknown as React.FormEvent)} disabled={submitting} className="flex-1 h-12 rounded-full text-sm font-semibold text-primary-foreground disabled:opacity-60" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          {submitting ? "জমা হচ্ছে..." : "সাবমিট করুন ✓"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block mb-2 text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
