import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Droplet, Trash2, Save, ArrowLeft, ShieldCheck, Send } from "lucide-react";
import { getMyDonorProfile, upsertMyDonorProfile, deleteMyDonorProfile, BLOOD_GROUPS, BD_DISTRICTS } from "@/lib/blood-donors";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/phone-otp.functions";


export const Route = createFileRoute("/_authenticated/blood-donors/me")({
  head: () => ({ meta: [{ title: "আমার ব্লাড ডোনার প্রোফাইল" }] }),
  component: MyBloodDonorPage,
});

function MyBloodDonorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    phone: "",
    blood_group: "A+",
    district: "চট্টগ্রাম",
    thana: "",
    address: "",
    photo_url: "",
    last_donation_date: "",
    is_available: true,
    notes: "",
  });

  useEffect(() => {
    getMyDonorProfile()
      .then((p) => {
        if (p) {
          setForm({
            full_name: p.full_name,
            father_name: p.father_name ?? "",
            phone: p.phone,
            blood_group: p.blood_group,
            district: p.district,
            thana: p.thana ?? "",
            address: p.address ?? "",
            photo_url: p.photo_url ?? "",
            last_donation_date: p.last_donation_date ?? "",
            is_available: p.is_available,
            notes: p.notes ?? "",
          });
          setVerifiedPhone(p.phone); // existing profile — treat saved phone as verified
        }
      })
      .catch((e) => toast.error(e?.message || "লোড হয়নি"))
      .finally(() => setLoading(false));
  }, []);

  const sendOtp = useServerFn(sendPhoneOtp);
  const verifyOtp = useServerFn(verifyPhoneOtp);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const isPhoneVerified = verifiedPhone !== null && verifiedPhone === form.phone;

  async function requestOtp() {
    if (!/^01[3-9]\d{8}$/.test(form.phone)) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await sendOtp({ data: { phone: form.phone } });
      setOtpToken(res.token);
      setOtpCode("");
      toast.success("OTP পাঠানো হয়েছে — SMS চেক করুন");
    } catch (e: any) {
      toast.error(e?.message || "OTP পাঠানো ব্যর্থ");
    } finally {
      setSendingOtp(false);
    }
  }

  async function confirmOtp() {
    if (!otpToken) return;
    if (!/^\d{6}$/.test(otpCode)) {
      toast.error("৬ ডিজিটের OTP দিন");
      return;
    }
    setVerifyingOtp(true);
    try {
      await verifyOtp({ data: { phone: form.phone, otp: otpCode, token: otpToken } });
      setVerifiedPhone(form.phone);
      setOtpToken(null);
      setOtpCode("");
      toast.success("মোবাইল নম্বর যাচাই সম্পন্ন");
    } catch (e: any) {
      const msg = e?.message || "OTP যাচাই ব্যর্থ";
      toast.error(msg);
      if (/মেয়াদ শেষ|expired/i.test(msg)) {
        setOtpToken(null);
        setOtpCode("");
      }
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!/^01[3-9]\d{8}$/.test(form.phone)) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
      return;
    }
    if (!isPhoneVerified) {
      toast.error("সংরক্ষণের আগে মোবাইল নম্বর OTP দিয়ে যাচাই করুন");
      return;
    }

    setSaving(true);
    try {
      await upsertMyDonorProfile({
        ...form,
        father_name: form.father_name || null,
        thana: form.thana || null,
        address: form.address || null,
        photo_url: form.photo_url || null,
        last_donation_date: form.last_donation_date || null,
        notes: form.notes || null,
      });
      toast.success("প্রোফাইল সংরক্ষিত হয়েছে");
      navigate({ to: "/blood-donors" });
    } catch (e: any) {
      toast.error(e?.message || "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("আপনার ডোনার প্রোফাইল মুছে ফেলবেন?")) return;
    try {
      await deleteMyDonorProfile();
      toast.success("মুছে ফেলা হয়েছে");
      navigate({ to: "/blood-donors" });
    } catch (e: any) {
      toast.error(e?.message || "মুছতে ব্যর্থ");
    }
  }

  if (loading) return <div className="py-32 text-center text-muted-foreground">লোড হচ্ছে...</div>;

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/blood-donors" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> ফিরে যান
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <Droplet className="w-6 h-6 text-red-600" /> আমার ব্লাড ডোনার প্রোফাইল
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">তথ্য সঠিক রাখুন — জরুরি রক্তের প্রয়োজনে মানুষ আপনাকে খুঁজে পাবে।</p>

      <form onSubmit={save} className="mt-6 bg-card rounded-2xl border border-border p-5 sm:p-7 space-y-4">
        <Field label="পূর্ণ নাম *">
          <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="পিতার নাম">
          <input value={form.father_name} onChange={(e) => setForm({ ...form, father_name: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="মোবাইল নম্বর *">
            <input
              required
              type="tel"
              inputMode="numeric"
              maxLength={11}
              value={form.phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setForm({ ...form, phone: v });
                if (verifiedPhone && v !== verifiedPhone) setVerifiedPhone(null);
                if (otpToken) setOtpToken(null);
              }}
              placeholder="01XXXXXXXXX"
              className={inputCls}
            />
          </Field>
          <Field label="রক্তের গ্রুপ *">
            <select value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className={inputCls}>
              {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
        </div>

        {/* Phone OTP verification */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          {isPhoneVerified ? (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> মোবাইল নম্বর যাচাইকৃত
            </div>
          ) : !otpToken ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                সংরক্ষণের আগে SMS-এর মাধ্যমে মোবাইল নম্বর যাচাই করুন।
              </p>
              <button
                type="button"
                onClick={requestOtp}
                disabled={sendingOtp || !/^01[3-9]\d{8}$/.test(form.phone)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" /> {sendingOtp ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {form.phone} নম্বরে পাঠানো ৬-ডিজিটের OTP দিন
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className={inputCls + " tracking-widest text-center font-mono"}
                />
                <button
                  type="button"
                  onClick={confirmOtp}
                  disabled={verifyingOtp || otpCode.length !== 6}
                  className="inline-flex items-center gap-1.5 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold disabled:opacity-60"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> {verifyingOtp ? "যাচাই..." : "যাচাই"}
                </button>
              </div>
              <button
                type="button"
                onClick={requestOtp}
                disabled={sendingOtp}
                className="text-xs text-muted-foreground hover:text-primary underline"
              >
                আবার পাঠান
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="জেলা *">
            <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={inputCls}>
              {BD_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="থানা / উপজেলা">
            <input value={form.thana} onChange={(e) => setForm({ ...form, thana: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="ঠিকানা">
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className={inputCls} />
        </Field>
        <Field label="ছবির URL">
          <input type="url" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="শেষ রক্তদানের তারিখ">
            <input type="date" value={form.last_donation_date} onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })} className={inputCls} />
          </Field>
          <Field label="বর্তমান অবস্থা">
            <label className="flex items-center gap-2 h-full px-3 py-2 rounded-lg border border-input bg-background text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
              রক্ত দিতে প্রস্তুত
            </label>
          </Field>
        </div>
        <Field label="নোট (ঐচ্ছিক)">
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving || !isPhoneVerified} title={!isPhoneVerified ? "প্রথমে মোবাইল নম্বর যাচাই করুন" : undefined} className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-red-600 text-white font-semibold disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? "সংরক্ষণ হচ্ছে..." : isPhoneVerified ? "সংরক্ষণ করুন" : "যাচাই করে সংরক্ষণ করুন"}
          </button>
          <button type="button" onClick={remove} className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" /> মুছুন
          </button>
        </div>
      </form>
    </section>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
