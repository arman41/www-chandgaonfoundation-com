import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Check,
  Heart,
  ShieldCheck,
  Award,
  Send,
  Building2,
  Sparkles,
  Info,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/donate")({
  component: DonatePage,
});

interface PaymentMethod {
  id: "bkash" | "nagad" | "rocket";
  name: string;
  type: string;
  number: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

export function DonatePage() {
  const [activeTab, setActiveTab] = useState<"zinypay" | "mfs" | "bank">("zinypay");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // ZinyPay State
  const [zinyAmount, setZinyAmount] = useState<string>("");
  const [zinyName, setZinyName] = useState<string>("");
  const [zinyEmail, setZinyEmail] = useState<string>("");
  const [zinyPhone, setZinyPhone] = useState<string>("");
  const [isZinyLoading, setIsZinyLoading] = useState<boolean>(false);

  // Manual Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    method: "bkash",
    trxId: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const mfsMethods: PaymentMethod[] = [
    {
      id: "bkash",
      name: "bKash",
      type: "পার্সোনাল / সেন্ড মানি",
      number: "01711479595",
      color: "text-[#D12053]",
      bgColor: "bg-pink-50/70 hover:bg-pink-50",
      borderColor: "border-pink-200 hover:border-pink-300",
      badgeBg: "bg-[#D12053]",
      badgeText: "text-white",
    },
    {
      id: "nagad",
      name: "Nagad",
      type: "পার্সোনাল / সেন্ড মানি",
      number: "01833221019",
      color: "text-[#F7921E]",
      bgColor: "bg-orange-50/70 hover:bg-orange-50",
      borderColor: "border-orange-200 hover:border-orange-300",
      badgeBg: "bg-[#F7921E]",
      badgeText: "text-white",
    },
    {
      id: "rocket",
      name: "Rocket",
      type: "পার্সোনাল / সেন্ড মানি",
      number: "01911306059",
      color: "text-[#8C3494]",
      bgColor: "bg-purple-50/70 hover:bg-purple-50",
      borderColor: "border-purple-200 hover:border-purple-300",
      badgeBg: "bg-[#8C3494]",
      badgeText: "text-white",
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ZinyPay Payment Handler
  const handleZinyPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsZinyLoading(true);

    try {
      // এখানে আপনার ব্যাকএন্ড এপিআই কল (Backend API Call) পাঠাতে হবে
      // যা ZinyPay API কল করে payment_url রিটার্ন করবে।
      
      /* 
      const response = await fetch('/api/zinypay-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: zinyAmount,
          customer_name: zinyName,
          customer_email: zinyEmail,
          customer_phone: zinyPhone,
        })
      });
      const data = await response.json();
      if(data.payment_url) {
        window.location.href = data.payment_url;
      }
      */

      // ডেমো রেসপন্স ফিল পাওয়ার ফ্রন্টএন্ড সিমুলেশন:
      setTimeout(() => {
        setIsZinyLoading(false);
        alert(`ZinyPay গেটওয়েতে রিডাইরেক্ট করা হচ্ছে... (পরিমাণ: ৳${zinyAmount})`);
      }, 1500);

    } catch (error) {
      console.error("ZinyPay Error:", error);
      setIsZinyLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: "", phone: "", amount: "", method: "bkash", trxId: "" });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header / Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-semibold border border-red-100 shadow-xs">
            <Heart className="w-4 h-4 fill-current" />
            <span>মানবতার সেবায় চান্দগাঁও ফাউন্ডেশন</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            আপনার <span className="text-emerald-600 underline decoration-emerald-300">একটি দান</span> বদলে দিতে পারে কারো আগামী
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            সমাজের অবহেলিত মানুষের পাশে দাঁড়াতে আপনার সাধ্যমতো অনুদান দিন। ZinyPay এর মাধ্যমে ইন্সট্যান্ট অটোমেটিক ভেরিফিকেশন সহ অনুদান পাঠাতে পারেন।
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex gap-1 border border-slate-300/60 shadow-inner max-w-lg w-full">
            <button
              onClick={() => setActiveTab("zinypay")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "zinypay"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              ইনস্ট্যান্ট ZinyPay
            </button>
            <button
              onClick={() => setActiveTab("mfs")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "mfs"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              ম্যানুয়াল MFS
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "bank"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              ব্যাংক ট্রান্সফার
            </button>
          </div>
        </div>

        {/* Tab 1: ZinyPay Instant Payment Form */}
        {activeTab === "zinypay" && (
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />
            
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <div className="text-center space-y-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  অটোমেটিক ইনস্ট্যান্ট ভেরিফিকেশন
                </span>
                <h3 className="text-2xl font-black text-slate-800">
                  ZinyPay দিয়ে সরাসরি অনলাইন অনুদান
                </h3>
                <p className="text-xs text-slate-500">
                  বিকাশ, নগদ, রকেট বা যেকোনো কার্ড দিয়ে সরাসরি পেমেন্ট করুন, অটো ভেরিফাই হয়ে যাবে।
                </p>
              </div>

              <form onSubmit={handleZinyPay} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অনুদানের পরিমাণ (টাকা) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      required
                      min="10"
                      placeholder="১০০, ৫০০, ১০০০..."
                      value={zinyAmount}
                      onChange={(e) => setZinyAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-base"
                    />
                  </div>
                  {/* Preset Amount Badges */}
                  <div className="flex gap-2 mt-2">
                    {["100", "500", "1000", "5000"].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setZinyAmount(amt)}
                        className="text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="আপনার নাম লিখুন"
                      value={zinyName}
                      onChange={(e) => setZinyName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={zinyPhone}
                      onChange={(e) => setZinyPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    value={zinyEmail}
                    onChange={(e) => setZinyEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isZinyLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                >
                  {isZinyLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> পেমেন্ট গেটওয়েতে নেওয়া হচ্ছে...
                    </>
                  ) : (
                    <>
                      ZinyPay এর মাধ্যমে পেমেন্ট করুন <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>✓ বিকাশ</span>
                <span>✓ নগদ</span>
                <span>✓ রকেট</span>
                <span>✓ ভিসা/কার্ড</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manual MFS Cards */}
        {activeTab === "mfs" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mfsMethods.map((method) => (
                <div
                  key={method.id}
                  className={`rounded-3xl border ${method.borderColor} ${method.bgColor} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between relative overflow-hidden`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-2xl font-black tracking-wider ${method.color}`}>
                        {method.name}
                      </span>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${method.badgeBg} ${method.badgeText} uppercase tracking-wider shadow-xs`}>
                        {method.type}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 mb-2">নম্বর কপি করতে ট্যাপ করুন:</p>
                    
                    <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-3 flex items-center justify-between font-mono text-xl font-extrabold text-slate-800 shadow-xs">
                      <span>{method.number}</span>
                      <button
                        onClick={() => handleCopy(method.number, method.id)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                        title="নম্বর কপি করুন"
                      >
                        {copiedId === method.id ? (
                          <Check className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {copiedId === method.id && (
                      <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> কপি করা হয়েছে!
                      </p>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Info className="w-3.5 h-3.5 text-slate-400" /> সেন্ড মানি করুন
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual TrxID Submission Form */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> ম্যানুয়াল নিশ্চিতকরণ
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    সেন্ড মানি করার পর TrxID জমা দিন
                  </h3>
                  <p className="text-sm text-slate-300">
                    ম্যানুয়ালি টাকা পাঠিয়ে থাকলে নিচের ফর্মে ট্রানজেকশন তথ্য সাবমিট করুন।
                  </p>
                </div>

                <div className="lg:col-span-7 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                  {formSubmitted ? (
                    <div className="text-center py-6 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <h4 className="text-lg font-bold text-white">ধন্যবাদ! তথ্য জমা হয়েছে</h4>
                      <p className="text-xs text-slate-300">আমরা শীঘ্রই যাচাই করে নেবো।</p>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="আপনার নাম"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="মোবাইল নম্বর"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                          value={formData.method}
                          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                          className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                        >
                          <option value="bkash">bKash</option>
                          <option value="nagad">Nagad</option>
                          <option value="rocket">Rocket</option>
                        </select>
                        <input
                          type="number"
                          required
                          placeholder="পরিমাণ (টাকা)"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                        />
                        <input
                          type="text"
                          required
                          placeholder="TrxID (ট্রানজেকশন)"
                          value={formData.trxId}
                          onChange={(e) => setFormData({ ...formData, trxId: e.target.value })}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Send className="w-4 h-4" /> ম্যানুয়াল ডাটা জমা দিন
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bank Transfer Content */}
        {activeTab === "bank" && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">ব্যাংক অ্যাকাউন্ট বিবরণী</h3>
                <p className="text-xs text-slate-500">অনলাইন ব্যাংকিং বা ব্যাংক ডিপোজিটের মাধ্যমে পাঠাতে পারেন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase">ব্যাংকের নাম</p>
                <p className="text-base font-bold text-slate-800">ইসলামী ব্যাংক বাংলাদেশ লিমিটেড</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase">অ্যাাকাউন্টের নাম</p>
                <p className="text-base font-bold text-slate-800">চান্দগাঁও ফাউন্ডেশন</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase">অ্যাাকাউন্ট নম্বর</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-mono font-bold text-slate-900">২০৫০ ৪১২০ ২০০০ ০০০</p>
                  <button
                    onClick={() => handleCopy("205041202000000", "bank-acc")}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {copiedId === "bank-acc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase">শাখা</p>
                <p className="text-base font-bold text-slate-800">লাকসাম শাখা, কুমিল্লা</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">১০০% স্বচ্ছতা</h4>
            <p className="text-xs text-slate-500">আপনার প্রতিটি টাকার সঠিক হিসেব নিশ্চিত করা হয়।</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-2">
            <Award className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">সরাসরি সাহায্য</h4>
            <p className="text-xs text-slate-500">অসহায় ও দরিদ্রদের কল্যাণে সরাসরি ব্যবহৃত হয়।</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-2">
            <Heart className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">নিয়মিত আপডেট</h4>
            <p className="text-xs text-slate-500">প্রতিটি ফান্ডের বিস্তারিত পেজে আপডেট দেওয়া হয়।</p>
          </div>
        </div>

      </div>
    </div>
  );
}
