// Shared SMS sender. Prefers dnotify.net (DNOTIFY_NET_API_KEY) and falls
// back to sms.net.bd (SMS_NET_BD_API_KEY). Server-only module.

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

  const legacyKey = (process.env.SMS_NET_BD_API_KEY || process.env.API_KEY)?.trim();
  const dnotifyKey = process.env.DNOTIFY_NET_API_KEY?.trim();
  const dnotifyUrl = process.env.DNOTIFY_API_URL?.trim();
  // dnotify is only used once its real send URL is configured; otherwise
  // go straight to sms.net.bd so SMS keeps working.
  if (dnotifyKey && dnotifyUrl) {
    try {
      const text = await postForm(dnotifyUrl, new URLSearchParams({ api_key: dnotifyKey, to, msg }));
      const payload = parseGatewayReply(text);
      if (payload.error !== 0) throw new Error(payload.msg || "SMS পাঠানো ব্যর্থ হয়েছে");
      return { msg: payload.msg ?? "Success", data: payload.data ?? null };
    } catch (e) {
      if (!legacyKey) throw e;
      console.error("dnotify failed, falling back:", e);
    }
  }

  if (!legacyKey) throw new Error("SMS API key কনফিগার করা নেই");

  const text = await postForm(
    "https://api.sms.net.bd/sendsms",
    new URLSearchParams({ api_key: legacyKey, to, msg })
  );
  const payload = parseGatewayReply(text);
  if (payload.error !== 0) {
    throw new Error(payload.msg || "SMS পাঠানো ব্যর্থ হয়েছে");
  }
  return { msg: payload.msg ?? "Success", data: payload.data ?? null };
}
