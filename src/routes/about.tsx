import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশনের লক্ষ্য, উদ্দেশ্য ও কার্যক্রম সম্পর্কে জানুন।" },
      { property: "og:title", content: "আমাদের সম্পর্কে — চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "চাঁদগাঁও প্রবাসী ও যুবসমাজের যৌথ উদ্যোগে প্রতিষ্ঠিত একটি অলাভজনক দাতব্য প্রতিষ্ঠান—দরিদ্র, অসহায় ও দুঃস্থ মানুষের পাশে দাঁড়িয়ে খাদ্য, শিক্ষা, চিকিৎসা ও আশ্রয়ের সেবা পৌঁছে দিচ্ছি।" },
      { property: "og:url", content: "https://chandgaonfoundation-info.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation-info.lovable.app/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">আমাদের সম্পর্কে</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-bold">
        মানবতার সেবায় <span className="text-primary">এক যুগের পথচলা</span>
      </h1>
      <div className="mt-10 prose prose-lg max-w-none text-foreground/85 space-y-6 leading-relaxed">
        <p>
          <strong>চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন</strong> চট্টগ্রামের চাঁদগাঁও এলাকার প্রবাসী ভাই-বোন ও স্থানীয় যুবসমাজের যৌথ উদ্যোগে প্রতিষ্ঠিত একটি অলাভজনক, দাতব্য প্রতিষ্ঠান। দরিদ্র, অসহায় ও দুঃস্থ মানুষের পাশে দাঁড়ানোই আমাদের মূল লক্ষ্য।
        </p>
        <p>
          আমরা বিশ্বাস করি — একটি সমাজ ততটাই উন্নত, যতটা তার সবচেয়ে দুর্বল মানুষটিও পেট ভরে খেতে পারে, সন্তানকে স্কুলে পাঠাতে পারে, অসুখে চিকিৎসা পেতে পারে। সেই বিশ্বাস থেকেই আমাদের পথচলা।
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-semibold text-primary">আমাদের লক্ষ্য</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            চাঁদগাঁও তথা চট্টগ্রামের প্রতিটি দরিদ্র পরিবারের কাছে খাদ্য, শিক্ষা, চিকিৎসা ও আশ্রয়ের সুযোগ পৌঁছে দেওয়া।
          </p>
        </div>
        <div className="p-8 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-semibold text-primary">আমাদের উদ্দেশ্য</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            স্বচ্ছতা, জবাবদিহিতা ও সহানুভূতির মাধ্যমে এমন একটি সমাজ গড়ে তোলা যেখানে কেউ অসহায় থাকবে না।
          </p>
        </div>
      </div>
    </div>
  );
}
