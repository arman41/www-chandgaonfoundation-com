import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { sendSms } from "@/lib/sms.functions";

export const Route = createFileRoute("/admin/sms")({
  head: () => ({ meta: [{ title: "SMS পাঠান | অ্যাডমিন" }] }),
  component: SmsPage,
});

function SmsPage() {
  const send = useServerFn(sendSms);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await send({ data: { to: phone.trim(), msg: message.trim() } });
      toast.success(result.msg || "SMS সফলভাবে পাঠানো হয়েছে");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "SMS পাঠানো ব্যর্থ হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:border-primary text-sm";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMS পাঠান</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          sms.net.bd গেটওয়ের মাধ্যমে SMS পাঠান।
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">মোবাইল নম্বর</label>
          <input
            type="tel"
            required
            placeholder="8801XXXXXXXXX বা 01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={field}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            বাংলাদেশি নম্বর — 880 দিয়ে শুরু করুন অথবা 01 দিয়ে দিন।
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">মেসেজ</label>
          <textarea
            required
            rows={5}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={field}
          />
          <p className="mt-1 text-xs text-muted-foreground">{message.length}/1000</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          style={{
            background: "var(--gradient-gold)",
            color: "oklch(0.22 0.05 160)",
            boxShadow: "var(--shadow-gold)",
          }}
        >
          {submitting ? "পাঠানো হচ্ছে..." : "SMS পাঠান"}
        </button>
      </form>
    </div>
  );
}
