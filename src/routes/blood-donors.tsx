import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplet, Phone, MapPin, Search, UserPlus } from "lucide-react";
import { listBloodDonors, BLOOD_GROUPS, BD_DISTRICTS, type BloodDonor } from "@/lib/blood-donors";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/blood-donors")({
  head: () => ({
    meta: [
      { title: "ব্লাড ডোনার | চাঁদগাও ফাউন্ডেশন" },
      { name: "description", content: "জেলা ভিত্তিক ব্লাড ডোনার খুঁজে নিন — জরুরি রক্তের প্রয়োজনে যোগাযোগ করুন।" },
      { property: "og:title", content: "ব্লাড ডোনার | চাঁদগাও ফাউন্ডেশন" },
      { property: "og:description", content: "জেলা ভিত্তিক ব্লাড ডোনার তালিকা।" },
      { property: "og:url", content: "https://chandgaonfoundation.com/blood-donors" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/blood-donors" }],
  }),
  component: BloodDonorsPage,
});

function BloodDonorsPage() {
  const { user, loading: authLoading } = useAuth();
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState("");
  const [group, setGroup] = useState("");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    listBloodDonors({ district: district || undefined, blood_group: group || undefined })
      .then(setDonors)
      .finally(() => setLoading(false));
  }, [district, group, user]);

  if (!authLoading && !user) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Droplet className="w-14 h-14 mx-auto text-red-600 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold">ব্লাড ডোনার তালিকা</h1>
        <p className="mt-3 text-muted-foreground">
          ডোনারদের গোপনীয়তা রক্ষার জন্য যোগাযোগের তথ্য শুধু লগইন করা ব্যবহারকারীদের জন্য প্রদর্শিত হয়।
        </p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 bg-red-600 text-white font-semibold hover:bg-red-700">
          <UserPlus className="w-4 h-4" /> লগইন করুন
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">রক্তদান</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold flex items-center gap-2">
            <Droplet className="w-8 h-8 text-red-600" /> ব্লাড ডোনার
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">জেলা ভিত্তিক তালিকা — জরুরি প্রয়োজনে সরাসরি যোগাযোগ করুন।</p>
        </div>
        <Link
          to={user ? "/blood-donors/me" : "/login"}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition"
        >
          <UserPlus className="w-4 h-4" /> {user ? "আমার ডোনার প্রোফাইল" : "ডোনার হিসেবে যোগ দিন"}
        </Link>
      </div>


      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">জেলা</label>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="">সব জেলা</option>
            {BD_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">রক্তের গ্রুপ</label>
          <select value={group} onChange={(e) => setGroup(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="">সব গ্রুপ</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => { setDistrict(""); setGroup(""); }} className="w-full px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent">
            <Search className="inline w-4 h-4 mr-1" /> রিসেট
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">লোড হচ্ছে...</div>
      ) : donors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Droplet className="w-12 h-12 mx-auto text-red-600/40 mb-3" />
          <p className="text-muted-foreground">এখনও কোনো ডোনার পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donors.map((d) => (
            <article key={d.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="p-4 flex gap-3">
                {d.photo_url ? (
                  <img src={d.photo_url} alt={d.full_name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 grid place-items-center flex-shrink-0">
                    <Droplet className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{d.full_name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-red-600">
                    {d.blood_group}
                  </span>
                  {!d.is_available && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">এখন অনুপলব্ধ</span>}
                </div>
              </div>
              <div className="px-4 pb-4 space-y-1 text-xs">
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {d.district}{d.thana ? `, ${d.thana}` : ""}
                </p>
                <Link to="/contact" className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700">
                  <Phone className="w-3.5 h-3.5" /> যোগাযোগের জন্য অনুরোধ
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
