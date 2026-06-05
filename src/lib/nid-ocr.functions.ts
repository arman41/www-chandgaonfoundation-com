import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DataUrl = z
  .string()
  .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/, { message: "অবৈধ ছবি ফরম্যাট" })
  .max(8_000_000, { message: "ছবি অনেক বড়" });

const Schema = z.object({
  front: DataUrl.optional().nullable(),
  back: DataUrl.optional().nullable(),
});

export type NidOcrResult = {
  name: string | null;
  name_bn: string | null;
  father_name: string | null;
  mother_name: string | null;
  nid: string | null;
  dob: string | null; // YYYY-MM-DD
  present_address: string | null;
  permanent_address: string | null;
};

export const extractNidInfo = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }): Promise<NidOcrResult> => {
    if (!data.front && !data.back) {
      throw new Error("কমপক্ষে একটি NID ছবি দিন");
    }
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway কনফিগার করা নেই");

    const sys = `You are an OCR assistant for Bangladeshi National ID (NID) cards.
Extract structured fields from the provided NID image(s). The card may be in Bangla and/or English.
Return STRICTLY a JSON object matching the provided schema. Use null for any field you cannot read with confidence.
- "name": full name in English if printed; otherwise null.
- "name_bn": full name in Bangla script if visible; otherwise null.
- "father_name", "mother_name": as printed (prefer Bangla if both available).
- "nid": digits only (10, 13, or 17 chars).
- "dob": ISO date YYYY-MM-DD.
- "present_address": present/current address from back side, in Bangla if available.
- "permanent_address": permanent address from back side, in Bangla if available.`;

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: "Extract NID fields. Front and/or back images attached." },
    ];
    if (data.front) userContent.push({ type: "image_url", image_url: { url: data.front } });
    if (data.back) userContent.push({ type: "image_url", image_url: { url: data.back } });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_nid_fields",
              description: "Return extracted NID fields",
              parameters: {
                type: "object",
                properties: {
                  name: { type: ["string", "null"] },
                  name_bn: { type: ["string", "null"] },
                  father_name: { type: ["string", "null"] },
                  mother_name: { type: ["string", "null"] },
                  nid: { type: ["string", "null"] },
                  dob: { type: ["string", "null"] },
                  present_address: { type: ["string", "null"] },
                  permanent_address: { type: ["string", "null"] },
                },
                required: [
                  "name",
                  "name_bn",
                  "father_name",
                  "mother_name",
                  "nid",
                  "dob",
                  "present_address",
                  "permanent_address",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_nid_fields" } },
      }),
    });

    if (res.status === 429) throw new Error("একটু পরে আবার চেষ্টা করুন (rate limit)");
    if (res.status === 402) throw new Error("AI ক্রেডিট শেষ");
    if (!res.ok) {
      const t = await res.text();
      throw new Error("AI gateway error: " + t.slice(0, 200));
    }

    const json = (await res.json()) as {
      choices?: Array<{
        message?: {
          tool_calls?: Array<{ function?: { arguments?: string } }>;
          content?: string;
        };
      }>;
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: Partial<NidOcrResult> = {};
    if (args) {
      try { parsed = JSON.parse(args); } catch { /* ignore */ }
    } else {
      const txt = json.choices?.[0]?.message?.content ?? "";
      const m = txt.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* ignore */ } }
    }

    const clean = (v: unknown): string | null => {
      if (typeof v !== "string") return null;
      const s = v.trim();
      return s ? s : null;
    };
    const nidDigits = (v: unknown): string | null => {
      const s = clean(v);
      if (!s) return null;
      const d = s.replace(/\D/g, "");
      return [10, 13, 17].includes(d.length) ? d : null;
    };

    return {
      name: clean(parsed.name),
      name_bn: clean(parsed.name_bn),
      father_name: clean(parsed.father_name),
      mother_name: clean(parsed.mother_name),
      nid: nidDigits(parsed.nid),
      dob: clean(parsed.dob),
      present_address: clean(parsed.present_address),
      permanent_address: clean(parsed.permanent_address),
    };
  });
