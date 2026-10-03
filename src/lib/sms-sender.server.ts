// Shared SMS sender. Uses dnotify.net only (DNOTIFY_NET_API_KEY + DNOTIFY_API_URL).
// Server-only module.

export function normalizeBd(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) return "880" + d.slice(1);
  return d;
}

async function postForm(url: string, body: URLSearchParams): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: body.toString(),
    });
  } catch {
    throw new Error("SMS গেটওয়েতে সংযোগ করা যায়নি");
  }
  return res.text();
}

function parseGatewayReply(text: string): { error?: number; msg?: string; data?: unknown } {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("SMS gateway থেকে অপ্রত্যাশিত উত্তর: " + text.slice(0, 200));
  }
}

export async function sendBdSms(toRaw: string, msg: string): Promise<{ msg: string; data?: unknown }> {
  const to = normalizeBd(toRaw);

  const apiKey = process.env.DNOTIFY_NET_API_KEY?.trim();
  const apiUrl = process.env.DNOTIFY_API_URL?.trim();
  if (!apiKey || !apiUrl) throw new Error("SMS API কনফিগার করা নেই");

  const text = await postForm(apiUrl, new URLSearchParams({ api_key: apiKey, to, msg }));
  const payload = parseGatewayReply(text);
  if (payload.error !== 0) {
    throw new Error(payload.msg || "SMS পাঠানো ব্যর্থ হয়েছে");
  }
  return { msg: payload.msg ?? "Success", data: payload.data ?? null };
}
