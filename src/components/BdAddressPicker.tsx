import { useMemo } from "react";
import bdGeo from "@/data/bd-geo.json";

type Item = { id: number; bn: string; en: string };
type Upazila = Item & { d: number };
type Union = Item & { u: number };

const DATA = bdGeo as { districts: Item[]; upazilas: Upazila[]; unions: Union[] };

export type BdAddress = {
  district: string;
  thana: string;
  union_name: string;
  ward: string;
};

const cls = "mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm";
const L = ({ children }: { children: React.ReactNode }) => <span className="block text-sm font-semibold">{children}</span>;

export function BdAddressPicker({
  value,
  onChange,
  lang,
  t,
}: {
  value: BdAddress;
  onChange: (v: BdAddress) => void;
  lang: "bn" | "en";
  t: (bn: string, en: string) => string;
}) {
  const districtLabel = (d: Item) => (lang === "bn" ? d.bn : d.en);

  const districtObj = useMemo(
    () => DATA.districts.find((d) => d.bn === value.district || d.en === value.district),
    [value.district],
  );
  const thanas = useMemo(
    () => (districtObj ? DATA.upazilas.filter((u) => u.d === districtObj.id) : []),
    [districtObj],
  );
  const thanaObj = useMemo(
    () => thanas.find((u) => u.bn === value.thana || u.en === value.thana),
    [thanas, value.thana],
  );
  const unions = useMemo(
    () => (thanaObj ? DATA.unions.filter((un) => un.u === thanaObj.id) : []),
    [thanaObj],
  );

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <label className="block">
        <L>{t("জেলা *", "District *")}</L>
        <select
          required
          className={cls}
          value={value.district}
          onChange={(e) => onChange({ ...value, district: e.target.value, thana: "", union_name: "" })}
        >
          <option value="">{t("— নির্বাচন করুন —", "— Select —")}</option>
          {DATA.districts.map((d) => (
            <option key={d.id} value={lang === "bn" ? d.bn : d.en}>
              {districtLabel(d)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <L>{t("থানা / উপজেলা *", "Thana / Upazila *")}</L>
        <select
          required
          className={cls}
          value={value.thana}
          disabled={!districtObj}
          onChange={(e) => onChange({ ...value, thana: e.target.value, union_name: "" })}
        >
          <option value="">{t("— নির্বাচন করুন —", "— Select —")}</option>
          {thanas.map((u) => (
            <option key={u.id} value={lang === "bn" ? u.bn : u.en}>
              {lang === "bn" ? u.bn : u.en}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <L>{t("ইউনিয়ন / পৌরসভা", "Union / Municipality")}</L>
        <select
          className={cls}
          value={value.union_name}
          disabled={!thanaObj}
          onChange={(e) => onChange({ ...value, union_name: e.target.value })}
        >
          <option value="">{t("— নির্বাচন করুন —", "— Select —")}</option>
          {unions.map((un) => (
            <option key={un.id} value={lang === "bn" ? un.bn : un.en}>
              {lang === "bn" ? un.bn : un.en}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <L>{t("ওয়ার্ড নম্বর", "Ward Number")}</L>
        <input
          className={cls}
          value={value.ward}
          onChange={(e) => onChange({ ...value, ward: e.target.value })}
          placeholder={t("যেমন: ৫", "e.g. 5")}
          maxLength={20}
          inputMode="numeric"
        />
      </label>
    </div>
  );
}
