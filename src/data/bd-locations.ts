// Bangladesh administrative divisions — divisions and districts.
// Thanas/Upazilas and Unions are entered as text since exhaustive lists are large.

export type District = { name: string };
export type Division = { name: string; districts: District[] };

export const divisions: Division[] = [
  {
    name: "চট্টগ্রাম",
    districts: [
      "চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "চাঁদপুর", "ব্রাহ্মণবাড়িয়া",
      "ফেনী", "নোয়াখালী", "লক্ষ্মীপুর", "রাঙ্গামাটি", "খাগড়াছড়ি", "বান্দরবান",
    ].map((n) => ({ name: n })),
  },
  {
    name: "ঢাকা",
    districts: [
      "ঢাকা", "গাজীপুর", "নরসিংদী", "নারায়ণগঞ্জ", "মুন্সিগঞ্জ", "মানিকগঞ্জ",
      "টাঙ্গাইল", "কিশোরগঞ্জ", "ফরিদপুর", "গোপালগঞ্জ", "মাদারীপুর", "শরীয়তপুর", "রাজবাড়ী",
    ].map((n) => ({ name: n })),
  },
  {
    name: "রাজশাহী",
    districts: [
      "রাজশাহী", "চাঁপাইনবাবগঞ্জ", "নওগাঁ", "নাটোর", "পাবনা", "সিরাজগঞ্জ", "বগুড়া", "জয়পুরহাট",
    ].map((n) => ({ name: n })),
  },
  {
    name: "খুলনা",
    districts: [
      "খুলনা", "বাগেরহাট", "সাতক্ষীরা", "যশোর", "ঝিনাইদহ", "মাগুরা", "নড়াইল", "কুষ্টিয়া", "চুয়াডাঙ্গা", "মেহেরপুর",
    ].map((n) => ({ name: n })),
  },
  {
    name: "বরিশাল",
    districts: [
      "বরিশাল", "ভোলা", "পটুয়াখালী", "পিরোজপুর", "ঝালকাঠি", "বরগুনা",
    ].map((n) => ({ name: n })),
  },
  {
    name: "সিলেট",
    districts: [
      "সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ",
    ].map((n) => ({ name: n })),
  },
  {
    name: "রংপুর",
    districts: [
      "রংপুর", "দিনাজপুর", "ঠাকুরগাঁও", "পঞ্চগড়", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারী", "গাইবান্ধা",
    ].map((n) => ({ name: n })),
  },
  {
    name: "ময়মনসিংহ",
    districts: [
      "ময়মনসিংহ", "জামালপুর", "নেত্রকোণা", "শেরপুর",
    ].map((n) => ({ name: n })),
  },
];

export const wards = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function formatBdAddress(p: {
  division?: string; district?: string; upazila?: string;
  union?: string; ward?: string; village?: string;
}): string {
  return [p.village, p.union, p.ward ? `ওয়ার্ড ${p.ward}` : "", p.upazila, p.district, p.division]
    .filter((x) => x && x.trim()).join(", ");
}
