import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "দান করুন — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "অনলাইনে দান করে চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশনের মানবিক কার্যক্রমে অংশ নিন।" },
      { property: "og:title", content: "দান করুন — চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "আপনার দান বদলে দিতে পারে একটি জীবন।" },
    ],
  }),
  component: Donate,
});

const AMOUNTS = [500, 1000, 2500, 5000, 10000];
const METHODS = [
  { id: "bkash", label: "বিকাশ", num: "01700-000000" },
  { id: "nagad", label: "নগদ", num: "01700-000000" },
  { id: "rocket", label: "রকেট", num: "01700-000000-1" },
  { id: "bank", label: "ব্যাংক", num: "Islami Bank — 20501234567890" },
];

function Donate() {
  const [amount, setAmount] = useState<number>(1000);
  const [custom, setCustom] = useState("");
  const [purpose, setPurpose] = useState("সাধারণ তহবিল");
  const [method, setMethod] = useState("bkash");
  const [done, setDone] = useState(false);

  const final = custom ? Number(custom) : amount;
  const selected = METHODS.find((m) => m.id === method)!;

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <div className="text-6xl mb-6">🤲</div>
        <h1 className="text-3xl font-bold text-primary">আপনাকে অসংখ্য ধন্যবাদ</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          আপনার <strong>৳{final.toLocaleString("bn-BD")}</strong> দানের অঙ্গীকার আমরা পেয়েছি।
          অনুগ্রহ করে <strong>{selected.label}</strong> নম্বর <strong>{selected.num}</strong>-এ পেমেন্ট সম্পন্ন করুন।
        </p>
        <button onClick={() => setDone(false)} className="mt-8 text-sm text-primary underline">আবার দান করুন</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">অনলাইন ডোনেশন</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold">
          আপনার দান, <span style={{ color: "var(--gold)" }}>একটি পরিবারের আশা</span>
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!final || final < 1) return;
          setDone(true);
        }}
        className="bg-card rounded-3xl p-8 md:p-10 border border-border space-y-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div>
          <label className="text-sm font-semibold">দানের পরিমাণ নির্বাচন করুন</label>
          <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAmount(a); setCustom(""); }}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${amount === a && !custom ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}
              >
                ৳{a.toLocaleString("bn-BD")}
              </button>
            ))}
          </div>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
            placeholder="অথবা নিজের পছন্দমত টাকা লিখুন"
            className="mt-3 w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">দানের উদ্দেশ্য</label>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="mt-3 w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm">
            <option>সাধারণ তহবিল</option>
            <option>খাদ্য সহায়তা</option>
            <option>শিক্ষা বৃত্তি</option>
            <option>চিকিৎসা সহায়তা</option>
            <option>দুর্যোগ ত্রাণ</option>
            <option>মসজিদ ও ধর্মীয় কাজ</option>
            <option>যাকাত / ফিতরা</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">পেমেন্ট পদ্ধতি</label>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${method === m.id ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            নির্বাচিত: <strong className="text-foreground">{selected.label}</strong> — {selected.num}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input required placeholder="আপনার নাম" className="px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          <input required type="tel" placeholder="মোবাইল নম্বর" className="px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
        </div>

        <div>
          <label className="text-sm font-semibold">ট্রানজেকশন আইডি (TX ID) *</label>
          <input
            required
            minLength={4}
            maxLength={50}
            placeholder="পেমেন্ট সম্পন্ন করার পর প্রাপ্ত TX ID লিখুন"
            className="mt-3 w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            TX ID ছাড়া আবেদন জমা দেওয়া যাবে না। অনুগ্রহ করে আগে পেমেন্ট সম্পন্ন করুন।
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-full text-base font-bold transition-transform hover:scale-[1.02]"
          style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
        >
          ৳{(custom ? Number(custom) || 0 : amount).toLocaleString("bn-BD")} দান করুন
        </button>
        <p className="text-center text-xs text-muted-foreground">
          🔒 আপনার সকল তথ্য সম্পূর্ণ গোপনীয় থাকবে
        </p>
      </form>
    </div>
  );
}
