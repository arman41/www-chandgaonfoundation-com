import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, CreditCard, ExternalLink, Loader2, ShieldCheck, Award } from "lucide-react";

export const Route = createFileRoute("/donate")({
  component: DonatePage,
});

export function DonatePage() {
  const [amount, setAmount] = useState<string>("500");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Preset Amounts
  const presetAmounts = ["100", "200", "500", "1000", "2000", "5000"];

  // ZinyPay Redirect Handler
  const handleZinyPayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = customAmount || amount;

    if (!finalAmount || Number(finalAmount) < 10) {
      alert("অনুদানের পরিমাণ অন্তত ১০ টাকা হতে হবে।");
      return;
    }

    setIsLoading(true);

    try {
      // ব্যাকএন্ড API থেকে ZinyPay Payment URL জেনারেট করার জন্য এই রিকোয়েস্টটি পাঠাতে হবে:
      /*
      const response = await fetch('/api/zinypay-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          customer_name: name,
          customer_phone: phone,
        }),
      });

      const data = await response.json();

      if (data.payment_url) {
        window.location.href = data.payment_url; // ZinyPay পেমেন্ট পেজে রিডাইরেক্ট
      } else {
        alert("পেমেন্ট গেটওয়ে লোড হতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
      */

      // সিমুলেশন (আপনার ব্যাকএন্ড ইন্টিগ্রেশন শেষে উপরের কমেন্ট তুলে দেবেন)
      setTimeout(() => {
        setIsLoading(false);
        alert(`ZinyPay পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে...\n\nনাম: ${name}\nফোন: ${phone}\nপরিমাণ: ৳${finalAmount}`);
      }, 1000);

    } catch (error) {
      console.error("ZinyPay Redirection Error:", error);
      setIsLoading(false);
      alert("পেমেন্ট গেটওয়েতে যোগাযোগ করা যাচ্ছে না।");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100 shadow-xs">
            <Heart className="w-4 h-4 fill-current" />
            <span>মানবতার সেবায় চান্দগাঁও ফাউন্ডেশন</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            অনলাইন অনুদান দিন
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            ZinyPay গেটওয়ের মাধ্যমে আপনার বিকাশ, নগদ, রকেট বা যেকোনো কার্ড থেকে সহজে ও নিরাপদভাবে অনুদান পাঠান।
          </p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6 relative overflow-hidden">
          
          <form onSubmit={handleZinyPayPayment} className="space-y-6">
            
            {/* Amount Selection Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                অনুদানের পরিমাণ নির্বাচন করুন (টাকা) *
              </label>
              
              {/* Preset Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all border ${
                      amount === amt && !customAmount
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative pt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                <input
                  type="number"
                  placeholder="অন্যান্য পরিমাণ লিখুন (উদা: ২৫০)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount("");
                  }}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* User Info Section */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="আপনার নাম লিখুন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2 text-base disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> ZinyPay-এ নিয়ে যাওয়া হচ্ছে...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  ZinyPay দিয়ে পেমেন্ট করুন
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Supported Methods Footer */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              সমর্থিত পেমেন্ট মাধ্যমসমূহ
            </p>
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-600">
              <span className="px-2 py-1 bg-pink-50 text-[#D12053] rounded-md">bKash</span>
              <span className="px-2 py-1 bg-orange-50 text-[#F7921E] rounded-md">Nagad</span>
              <span className="px-2 py-1 bg-purple-50 text-[#8C3494] rounded-md">Rocket</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md">Cards</span>
            </div>
          </div>

        </div>

        {/* Security Badges */}
        <div className="flex justify-center gap-6 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> সুরক্ষিত ও এনক্রিপ্টেড
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-4 h-4 text-emerald-600" /> ১০০% মেম্বার সাপোর্ট
          </span>
        </div>

      </div>
    </div>
  );
}
