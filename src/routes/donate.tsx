import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Check, Heart, Shield, Award, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/donate")({
  component: DonatePage,
});

export function DonatePage() {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const bkashNumber = "01880854685";
  const nagadNumber = "01880854685";

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full text-red-600 mb-2">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            মানবতার সেবায় আপনার অনুদান
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            আপনার একটি ছোট পদক্ষেপ বদলে দিতে পারে কারো জীবন। চান্দগাঁও ফাউন্ডেশনের মাধ্যমে সরাসরি অসহায় মানুষের পাশে দাঁড়ান।
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* bKash Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                  Personal / Send Money
                </span>
                <span className="text-2xl font-black text-pink-600">bKash</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">বিকাশ পার্সোনাল</h3>
              <p className="text-sm text-slate-500 mb-6">সেন্ড মানি করতে নিচের নম্বরটি ব্যবহার করুন</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between font-mono text-lg font-bold text-slate-800">
                <span>{bkashNumber}</span>
                <button
                  onClick={() => handleCopy(bkashNumber, "bkash")}
                  className="p-2 text-slate-500 hover:text-pink-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  title="Copy Number"
                >
                  {copiedAccount === "bkash" ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {copiedAccount === "bkash" && (
              <p className="text-xs text-green-600 font-medium mt-2 text-right">নম্বরটি কপি করা হয়েছে!</p>
            )}
          </div>

          {/* Nagad Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Personal / Send Money
                </span>
                <span className="text-2xl font-black text-orange-600">Nagad</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">নগদ পার্সোনাল</h3>
              <p className="text-sm text-slate-500 mb-6">সেন্ড মানি করতে নিচের নম্বরটি ব্যবহার করুন</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between font-mono text-lg font-bold text-slate-800">
                <span>{nagadNumber}</span>
                <button
                  onClick={() => handleCopy(nagadNumber, "nagad")}
                  className="p-2 text-slate-500 hover:text-orange-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  title="Copy Number"
                >
                  {copiedAccount === "nagad" ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {copiedAccount === "nagad" && (
              <p className="text-xs text-green-600 font-medium mt-2 text-right">নম্বরটি কপি করা হয়েছে!</p>
            )}
          </div>
        </div>

        {/* Bank Account Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            ব্যাংক অ্যাকাউন্ট বিবরণী
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">ব্যাংকের নাম</p>
              <p className="font-semibold text-slate-800">ইসলামী ব্যাংক বাংলাদেশ লিমিটেড</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">অ্যাাকাউন্ট নাম</p>
              <p className="font-semibold text-slate-800">চান্দগাঁও ফাউন্ডেশন</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">অ্যাাকাউন্ট নম্বর</p>
              <p className="font-semibold text-slate-800 font-mono">২০৫০ ৪১২০ ২০০০ ০০০</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">শাখা</p>
              <p className="font-semibold text-slate-800">বহদ্দারহাট শাখা, চট্টগ্রাম</p>
            </div>
          </div>
        </div>

        {/* Trust Badges / Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <Shield className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">১০০% স্বচ্ছতা</h4>
            <p className="text-xs text-slate-500 mt-1">আপনার প্রতিটি টাকার হিসাব রাখা হয় ও যথাস্থানে পৌঁছানো হয়।</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <Award className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">সরাসরি প্রভাব</h4>
            <p className="text-xs text-slate-500 mt-1">আপনার অনুদান সরাসরি স্থানীয় অসহায় ও দরিদ্রদের কল্যাণে ব্যবহৃত হয়।</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <Heart className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">নিয়মিত আপডেট</h4>
            <p className="text-xs text-slate-500 mt-1">আমাদের প্রতিটি প্রজেক্টের আপডেট ফেইসবুক পেজ ও ওয়েবসাইটে প্রকাশ করা হয়।</p>
          </div>
        </div>

        {/* Contact Note */}
        <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100">
          <h3 className="text-lg font-bold text-emerald-900 mb-2">অনুদান পাঠানোর পর কী করবেন?</h3>
          <p className="text-sm text-emerald-700 max-w-xl mx-auto mb-4">
            টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) ও আপনার নাম আমাদের ফেইসবুক পেজে মেসেজ করুন অথবা হটলাইনে কল করে নিশ্চিত করুন।
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            যোগাযোগ করুন <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
      }
