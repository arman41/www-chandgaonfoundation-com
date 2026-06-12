## ১. স্মার্ট কার্ড ঠিক করা

### সামনের পেজ — ছবি স্পষ্ট
`src/components/MemberSmartCard.tsx` ও `src/components/VolunteerSmartCard.tsx`:
- ব্যবহারকারীর ফটো (`data.photo_url`) থেকে কালার tint সরাও। বর্তমানে gradient overlay পুরো কার্ডে যাচ্ছে যা ফটোতে কালার আনে — overlay কে শুধু background flood-image এর উপরে রেখে ফটো div কে `z-index` দিয়ে উপরে আনা হবে। ফটো box-এ আর `mix-blend` বা tint থাকবে না।
- ফটো box যেন কোনো overlay নিচে না পড়ে — wrapper-এ `z-10`, background overlays-এ `z-0`।

### সামনের পেজ — Foundation name overflow
- উপরের brand block: `right-[32%]` রাখা হয়েছিল যাতে ফটোর সাথে collide না করে, কিন্তু `truncate` করে "চাঁদগাঁও ফাউন্ডেশন" কেটে যাচ্ছে। ফন্ট সাইজ কমিয়ে `text-[11px] sm:text-sm` করা হবে এবং `whitespace-normal leading-tight` দিয়ে দুই লাইনে wrap allow করা হবে; বাজে spillage বন্ধে `right-[30%]` রাখা হবে।

### পিছনের পেজ — QR overলেপ
- QR কোড `bottom-[6%]` এ এবং card-code strip `top-[54%]` এ — ছোট viewport-এ overlap হয়। সমাধান:
  - QR সাইজ `48` করা হবে (ছিল 64)
  - Card-code strip কে `top-[50%] h-[14%]` এ ছোট করা হবে
  - নিচের text block এর `max-w-[55%]` করা হবে এবং QR-কে `mb-1` দেওয়া হবে যাতে নাম্বারের সাথে collide না করে
- পিছনের `org` heading-এ `text-[11px] sm:text-sm` + `leading-tight` যাতে উপরে spill না করে।

## ২. সাহায্যের আবেদন ফর্ম — নতুন করে সাজানো

### স্থান নির্বাচন — Cascading dropdowns
নতুন data file `src/data/bd-locations.ts` যোগ করা হবে — বাংলাদেশের সকল বিভাগ, জেলা, উপজেলা/থানা, ইউনিয়ন। (Open BD admin division data থেকে static JSON, lightweight scope হিসেবে শুধু চট্টগ্রাম বিভাগ পূর্ণাঙ্গ + অন্যান্য বিভাগের জেলা পর্যন্ত — এর বাইরে ম্যানুয়ালি লেখার অপশন)। ওয়ার্ড 1–9 ড্রপডাউন।

### ফর্ম সাজানো (`src/routes/help.tsx`)
পুরোনো form structure সম্পূর্ণ replace হবে। নতুন গঠন:

```text
ধাপ ১ — ব্যক্তিগত তথ্য
- প্রকল্প (Select)  
- সাহায্যের ধরন (auto from project, disabled)
- পূর্ণ নাম *
- পিতার নাম *
- মাতার নাম
- লিঙ্গ / জন্ম তারিখ / পেশা (dropdown)
- NID নম্বর / মোবাইল *

ধাপ ২ — ঠিকানা
- বিভাগ (select) → জেলা (select) → থানা/উপজেলা (select) → ইউনিয়ন (select) → ওয়ার্ড (1–9)
- গ্রাম / বিস্তারিত ঠিকানা (text)
- স্থায়ী ঠিকানা একই কিনা checkbox; না হলে আলাদা সেট

ধাপ ৩ — সাহায্যের কারণ
- কারণ (textarea) *
- পারিবারিক অবস্থা / অতিরিক্ত নোট

ধাপ ৪ — ছবি ও NID আপলোড (ফর্মের একদম নিচে)
- ৩টি ছোট compact button (📷 ছবি / 🪪 NID সামনে / 🪪 NID পিছনে)
- ইনপুট এলাকায় শুধু "আপলোডকৃত" badge দেখাবে, ছবির preview দেখানো হবে না
- "প্রিভিউ দেখুন" বাটনে গেলে preview card-এ সব ছবি ও তথ্য দেখা যাবে
- NID OCR auto-trigger যেমন আছে রাখা হবে

`PreviewCard` কম্পোনেন্টে সব নতুন field render হবে এবং আপলোডকৃত ছবি (ছবি, NID দুটি) thumbnail হিসেবে দেখাবে।

### বাদ যাবে
- "প্রয়োজনীয় পরিমাণ (টাকা)" আগে বাদ — এখন আর change নেই
- "মাসিক আয়" / "পরিবারের সদস্য সংখ্যা" — optional থাকবে কিন্তু কম priority

### Server function update
`src/lib/help-applications.ts` ও `.functions.ts`-এ নতুন address parts (`division`, `district`, `upazila`, `union_name`, `ward`) যোগ — তবে DB column যোগ না করে এগুলো serialize করে `present_address` / `permanent_address` strings এ একত্রে রাখা হবে। কোনো migration লাগবে না।

## ৩. অ্যাডমিন প্যানেল — সার্ভার-সাইড গার্ড

### নতুন server function
`src/lib/admin.functions.ts`:
```ts
export const verifyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: Boolean(data) };
  });
```

### Hook update
`src/hooks/use-admin-guard.ts`:
- Client-side `getUserRoleFlags` কল রিপ্লেস করে `verifyAdminAccess()` server fn কল করা হবে
- টোকেন server-এ verify হবে → client state tampering করে কাজ হবে না
- existing `cf-auth-role-ready` listener বহাল থাকবে

এতে কেউ DevTools-এ `isAdmin = true` set করলেও panel render হবে না — server verify ছাড়া guard `denied` থাকবে।

## টেকনিক্যাল নোট
- কোনো DB migration লাগবে না
- নতুন file: `src/data/bd-locations.ts`, `src/lib/admin.functions.ts`
- `start.ts`-এ `attachSupabaseAuth` ইতোমধ্যে registered
