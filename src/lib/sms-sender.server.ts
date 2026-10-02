// Shared SMS sender. Prefers dnotify.net (DNOTIFY_NET_API_KEY) and falls
// back to sms.net.bd (SMS_NET_BD_API_KEY). Server-only module.

export function normalizeBd(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) return "880" + d.slice(1);
  return d;
}

async function postForm(url: string, body: URLSearchParams): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Some gateways log the caller IP into a small column that overflows on
      // IPv6. Force a benign IPv4 so their logger doesn't reject the request.
      "X-Forwarded-For": "0.0.0.0",
      "X-Real-IP": "0.0.0.0",
    },
    body: body.toString(),
  });
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

  const dnotifyKey = process.env.DNOTIFY_NET_API_KEY?.trim();
  if (dnotifyKey) {
    const url = process.env.DNOTIFY_API_URL?.trim() || "https://dnotify.net/api/sms/send";
    const text = await postForm(url, new URLSearchParams({ api_key: dnotifyKey, to, msg }));
    const payload = parseGatewayReply(text);
    if (payload.error !== 0) {
      throw new Error(payload.msg || "SMS পাঠানো ব্যর্থ হয়েছে");
    }
    return { msg: payload.msg ?? "Success", data: payload.data ?? null };
  }

  const legacyKey = process.env.SMS_NET_BD_API_KEY?.trim();
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
