import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Heart, Copy, Check, CreditCard, Smartphone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function Donate() {
  const [amount, setAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "কপি করা হয়েছে",
      description: `${text} ক্লিপবোর্ডে কপি করা হয়েছে।`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val.toString());
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setAmount(e.target.value);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4 fill-primary" />
            <span>মানবতার সেবায় আপনার হাত বাড়িয়ে দিন</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
            চাঁন্দগাঁও ফাউন্ডেশনে অনুদান দিন
          </h1>
          <p className="text-muted-foreground text-lg">
            আপনার ছোট একটি অনুদানও কারোর জীবনে বড় পরিবর্তন আনতে পারে। আমাদের শিক্ষামূলক, চিকিৎসা ও সামাজিক উন্নয়নমূলক উদ্যোগে শরিক হন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Donation Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">অনুদানের পরিমাণ নির্বাচন করুন</CardTitle>
                <CardDescription>
                  আপনার সামর্থ্য অনুযায়ী যেকোনো পরিমাণ অর্থ অনুদান হিসেবে পাঠাতে পারেন।
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base mb-3 block">পরিমাণ (টাকায়)</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                    {PRESET_AMOUNTS.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={amount === preset.toString() && !customAmount ? "default" : "outline"}
                        className="w-full text-base font-semibold py-6"
                        onClick={() => handleAmountSelect(preset)}
                      >
                        ৳{preset.toLocaleString("bn-BD")}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">অথবা আপনার ইচ্ছামতো পরিমাণ লিখুন</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                        ৳
                      </span>
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="অন্যান্য পরিমাণ"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className="pl-8 text-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">পেমেন্ট মেথড নির্বাচন করুন</h3>
                  <Tabs defaultValue="mobile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="mobile" className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        মোবাইল ব্যাংকিং
                      </TabsTrigger>
                      <TabsTrigger value="bank" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        ব্যাংক ট্রান্সফার
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="mobile" className="space-y-4 pt-4">
                      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-emerald-900 dark:text-emerald-100">বিকাশ (Personal / Send Money)</p>
                            <p className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-300">01800000000</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy("01800000000", "bkash")}
                            className="bg-background"
                          >
                            {copiedField === "bkash" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-orange-900 dark:text-orange-100">নগদ (Personal / Send Money)</p>
                            <p className="text-2xl font-mono font-bold text-orange-700 dark:text-orange-300">01800000000</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy("01800000000", "nagad")}
                            className="bg-background"
                          >
                            {copiedField === "nagad" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="bank" className="space-y-4 pt-4">
                      <div className="p-4 rounded-lg bg-muted border space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">ব্যাংকের নাম</p>
                          <p className="font-semibold text-lg">ইসলামী ব্যাংক বাংলাদেশ লিমিটেড</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">একাউন্ট নাম</p>
                          <p className="font-medium">Chandgaon Foundation</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">একাউন্ট নম্বর</p>
                            <p className="text-xl font-mono font-bold">20501234567890</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy("20501234567890", "bank")}
                          >
                            {copiedField === "bank" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="space-y-1 pt-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">শাখা</p>
                          <p className="text-sm">লাকসাম শাখা, কুমিল্লা </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  অনুদানের নিয়মাবলী
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">১</span>
                  <p>উপরে উল্লেখিত বিকাশ বা নগদ নম্বরে সেন্ড মানি (Send Money) করুন অথবা ব্যাংক একাউন্টে ট্রান্সফার করুন।</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">২</span>
                  <p>রেফারেন্সে আপনার নাম অথবা "Donate" লিখুন।</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">৩</span>
                  <p>অর্থ পাঠানোর পর নিশ্চিতকরণের জন্য ট্রানজেকশন আইডি (TrxID) সংরক্ষণ করুন।</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">৪</span>
                  <p>যেকোনো সহায়তার জন্য আমাদের অফিসিয়াল নম্বরে সরাসরি যোগাযোগ করতে পারেন।</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">স্বচ্ছতা ও জবাবদিহিতা</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  চাঁন্দগাঁও ফাউন্ডেশন একটি সম্পূর্ণ অলাভজনক ও সেবামূলক প্রতিষ্ঠান। আপনার দানকৃত প্রতিটি টাকার সঠিক ও সর্বোচ্চ সৎ ব্যবহার নিশ্চিত করা হয়।
                </p>
                <p>
                  আমাদের বিভিন্ন কার্যক্রমের নিয়মিত আপডেট ও অডিট রিপোর্ট ওয়েবসাইট এবং অফিসিয়াল ফেইসবুক পেজে প্রকাশ করা হয়।
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
          }
