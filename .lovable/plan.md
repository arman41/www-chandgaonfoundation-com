## পরিবর্তন

### 1. স্মার্ট কার্ডে ছবি শুধু সামনের পেজে
`src/components/MemberSmartCard.tsx` ও `src/components/VolunteerSmartCard.tsx` — `CardBack` থেকে `floodAsset` ইমেজ ব্যান্ড সরাও। পিছনের পার্ট সলিড gradient + signature strip + QR থাকবে। সামনের পেজে ছোট background ওভারলে হিসেবে flood ছবি যোগ করা হবে (লেখা ও ফটো এর পাঠযোগ্যতা বজায় রেখে — ~15-20% opacity)।

### 2. অ্যাডমিন স্বেচ্ছাসেবক — ছবি আপলোড/ডাউনলোড
`src/routes/admin.volunteers.tsx` মডালে `src/routes/admin.members.tsx`-এর মতো একই photo upload/download/remove UI যোগ করো:
- `uploadMemberPhoto` server fn-এ folder param যোগ করে reuse, অথবা `volunteers/` folder-এ আপলোড করতে `uploadVolunteerPhoto` যোগ — সহজ পথ: বিদ্যমান `uploadMemberPhoto`-এ optional `kind` যোগ করা।
- "ছবির URL" plain input বাদ দিয়ে preview + 📷 ক্যামেরা / 🖼️ গ্যালারি / ⬇️ ডাউনলোড / 🗑️ মুছুন।

### 3. সাহায্যের আবেদন — প্রকল্পের সাহায্যের ধরন অটো-সিলেক্ট
`src/routes/help.tsx`-এ project select পরিবর্তনে `form.type` কে project এর category থেকে map করা হবে। map: relief→দুর্যোগকালীন, medical→চিকিৎসা, education→শিক্ষা, food→খাদ্য, winter→শীতবস্ত্র, financial→আর্থিক, else→অন্যান্য। প্রকল্প সিলেক্ট থাকলে "সাহায্যের ধরন" সিলেক্ট disabled দেখাবে।

### 4. "প্রয়োজনীয় পরিমাণ (টাকা)" ফিল্ড বাদ
`help.tsx` form ও PreviewCard থেকে `requested_amount` সম্পর্কিত input/Row বাদ। submit-এ `amount: ""`, `requested_amount: null`। PDF receipt-এও দেখানো হবে না।

### 5. পেশা ড্রপডাউন
`help.tsx`-এ "পেশা" text input এর জায়গায় `<select>` — সাধারণ পেশার পূর্ণ তালিকা (কৃষক, দিনমজুর, রিকশাচালক, ব্যবসায়ী, চাকরিজীবী, শিক্ষক, ছাত্র/ছাত্রী, গৃহিণী, ড্রাইভার, দর্জি, শ্রমিক, মৎস্যজীবী, কারিগর, দোকানদার, ইমাম, ডাক্তার, নার্স, প্রকৌশলী, IT পেশাজীবী, বেকার, অন্যান্য) সহ। "অন্যান্য" সিলেক্ট করলে একটি ছোট text input খুলবে।

### 6. NID স্ক্যান — ভুল ঠিকানা ঠিক
`src/lib/nid-ocr.functions.ts`-এ system prompt পরিমার্জন:
- NID কার্ডে front side-এ "ঠিকানা" (address) লেখা থাকে — সেটি permanent_address। Back side-এ শুধু issue/serial থাকে।
- বাংলাদেশী NID-এর front-এ মুদ্রিত একমাত্র address-কে কোনো ভাবেই "present_address"-এ না বসানো; ছবিতে "বর্তমান ঠিকানা" আলাদাভাবে লেখা না থাকলে present_address = null।
- ঠিকানা পড়ার সময় শুধু কার্ডের address ব্লকের ভেতরের টেক্সট নাও — name/father/mother এর সাথে মিশিও না।
- সংখ্যা/ইংরেজি অংশ Bangla-তে translate না করা; verbatim।

এতে ভুল ঠিকানা (অন্য field মিশে যাওয়া, present-এ permanent ভুলভাবে কপি) ঠিক হবে।

## টেকনিক্যাল নোট
- কোনো DB migration দরকার নেই।
- `uploadMemberPhoto` server fn-এ optional `folder: "members"|"volunteers"` param যোগ; বিদ্যমান কলে default `members` থাকবে — backward compatible।
- Smart card-এ flood ছবি front-এ subtle ওভারলে হিসেবে `position:absolute inset-0 opacity-15 z-0`, content `z-10`।
