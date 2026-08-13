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
  QrCode,
  Sparkles,
  Info,
  CheckCircle2,
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
  qrImage?: string; // প্রয়োজনে কিউআর কোডের ইমেজ লিংক দিতে পারেন
}

export function DonatePage() {
  const [activeTab, setActiveTab] = useState<"mfs" | "bank">("mfs");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<PaymentMethod | null>(null);
  
  // Form state
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // এখানে আপনার API Call বা Backend Integration করতে পারেন
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: "", phone: "", amount: "", method: "bkash", trxId: "" });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-semibold border border-red-100 shadow-sm animate-pulse">
            <Heart className="w-4 h-4 fill-current" />
            <span>মানবতার সেবায় চান্দগাঁও ফাউন্ডেশন</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            আপনার <span className="text-emerald-600 underline decoration-emerald-300">একটি দান</span> বদলে দিতে পারে কারো আগামী
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            সমাজের অবহেলিত ও অসহায় মানুষের পাশে দাঁড়াতে আপনার সাধ্যমতো অনুদান প্রদান করুন। আপনার প্রদত্ত প্রতিটি টাকা স্বচ্ছতার সাথে সঠিক জায়গায় পৌঁছানো হবে।
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center">
          <div className="bg-slate-200/70 p-1 rounded-2xl flex gap-1 border border-slate-200 shadow-inner max-w-md w-full">
            <button
              onClick={() => setActiveTab("mfs")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "mfs"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              মোবাইল ব্যাংকিং
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "bank"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              ব্যাংক একাউন্ট
            </button>
          </div>
        </div>

        {/* MFS Tab Content */}
        {activeTab === "mfs" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mfsMethods.map((method) => (
              <div
                key={method.id}
                className={`rounded-3xl border ${method.borderColor} ${method.bgColor} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between relative overflow-hidden group`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-2xl font-black tracking-wider ${method.color}`}>
                      {method.name}
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${method.badgeBg} ${method.badgeText} uppercase tracking-wider shadow-sm`}>
                      {method.type}
                    </span>
                  </div>

                  {/* Account Info */}
                  <p className="text-xs font-semibold text-slate-500 mb-2">নম্বরটি কপি করতে বাটনে ট্যাপ করুন:</p>
                  
                  <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-3 flex items-center justify-between font-mono text-xl font-extrabold text-slate-800 shadow-sm">
                    <span>{method.number}</span>
                    <button
                      onClick={() => handleCopy(method.number, method.id)}
                      className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
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
                    <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1 animate-fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5" /> নম্বরটি কপি করা হয়েছে!
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Info className="w-3.5 h-3.5 text-slate-400" /> সেন্ড মানি করুন
                  </span>
                  {method.qrImage && (
                    <button
                      onClick={() => setShowQrModal(method)}
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-bold bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" /> QR Code
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bank Tab Content */}
        {activeTab === "bank" && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200/80 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full blur-3xl -z-0 pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">ব্যাংক ট্রান্সফার বিবরণী</h3>
                  <p className="text-xs text-slate-500">যেকোনো ব্যাংক বা অনলাইন ব্যাংকিং অ্যাপ থেকে পাঠাতে পারেন</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">ব্যাংকের নাম</p>
                  <p className="text-base font-bold text-slate-800">ইসলামী ব্যাংক বাংলাদেশ লিমিটেড</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">অ্যাাকাউন্টের নাম</p>
                  <p className="text-base font-bold text-slate-800">চান্দগাঁও ফাউন্ডেশন</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 relative group">
                  <p className="text-xs font-semibold uppercase text-slate-400">অ্যাাকাউন্ট নম্বর</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-mono font-bold text-slate-900">২০৫০ ৪১২০ ২০০০ ০০০</p>
                    <button
                      onClick={() => handleCopy("205041202000000", "bank-acc")}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="অ্যাাকাউন্ট নম্বর কপি করুন"
                    >
                      {copiedId === "bank-acc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">শাখা ও রাউটিং নম্বর</p>
                  <p className="text-base font-bold text-slate-800">লাকসাম শাখা, কুমিল্লা</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation / TrxID Form */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> অনুদান নিশ্চিতকরণ
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                টাকা পাঠানোর পর তথ্যসমূহ জমা দিন
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                আপনার দেওয়া ট্রানজেকশন আইডি (TrxID) আমাদের হিসেব ও বার্ষিক ফান্ড রিপোর্টে স্বচ্ছতা বজায় রাখতে সাহায্য করে।
              </p>
            </div>

            <div className="lg:col-span-7 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              {formSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">ধন্যবাদ! তথ্যটি গ্রহণ করা হয়েছে</h4>
                  <p className="text-xs text-slate-300">আমরা শীঘ্রই যাচাই করে এটি রেকর্ডভুক্ত করে নেবো।</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">আপনার নাম</label>
                      <input
                        type="text"
                        required
                        placeholder="উদা: আরমান হোসেন"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">মোবাইল নম্বর</label>
                      <input
                        type="tel"
                        required
                        placeholder="017XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">মাধ্যম</label>
                      <select
                        value={formData.method}
                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                        className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                      >
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="rocket">Rocket</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">পরিমাণ (টাকা)</label>
                      <input
                        type="number"
                        required
                        placeholder="৫০/১০০/৫০০"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">TrxID (ট্রানজেকশন আইডি)</label>
                      <input
                        type="text"
                        required
                        placeholder="9A2B3C4D"
                        value={formData.trxId}
                        onChange={(e) => setFormData({ ...formData, trxId: e.target.value })}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" /> জমা দিন
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">১০০% আমানত রক্ষা</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার দেওয়া প্রতিটি টাকার আমানত রক্ষা ও সঠিক স্থানে পৌঁছানো আমাদের মূল অঙ্গীকার।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">সরাসরি সাহায্য</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              মাঠ পর্যায়ে যাচাই-বাছাই করে প্রকৃত দরিদ্র ও অসুস্থ মানুষের নিকট অনুদান পৌঁছে দেওয়া হয়।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">প্রকাশ্য রিপোর্ট</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              প্রতিটি প্রজেক্ট শেষে আয়-ব্যয়ের পুঙ্খানুপুঙ্খ হিসাব ওয়েবসাইট ও পেজে প্রকাশ করা হয়।
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal (Optional) */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-slate-800">{showQrModal.name} QR Code</h3>
            {showQrModal.qrImage ? (
              <img src={showQrModal.qrImage} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl border border-slate-200" />
            ) : (
              <div className="w-48 h-48 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                QR Code আসছে...
              </div>
            )}
            <p className="text-xs text-slate-500 font-mono font-bold">{showQrModal.number}</p>
            <button
              onClick={() => setShowQrModal(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
                  }
