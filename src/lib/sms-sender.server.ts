// Shared SMS sender. Uses dnotify.net only (DNOTIFY_NET_API_KEY + DNOTIFY_API_URL).
// Server-only module.

export function normalizeBd(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) return "880" + d.slice(1);
  return d;
}

function parseGatewayReply(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("SMS gateway থেকে অপ্রত্যাশিত উত্তর: " + text.slice(0, 200));
  }
}

export async function sendBdSms(toRaw: string, msg: string): Promise<{ msg: string; data?: unknown }> {
  const to = normalizeBd(toRaw);

  const apiKey = process.env.DNOTIFY_NET_API_KEY?.trim();
  if (!apiKey) throw new Error("SMS API কনফিগার করা নেই");

  // If the saved URL has no path (e.g. just https://dnotify.net), use the
  // known send-sms endpoint.
  let apiUrl = process.env.DNOTIFY_API_URL?.trim() || "https://dnotify.net/api/v1/send-sms";
  try {
    const u = new URL(apiUrl);
    if (u.pathname.replace(/\/+$/, "") === "") {
      u.pathname = "/api/v1/send-sms";
      apiUrl = u.toString();
    }
  } catch {
    throw new Error("dnotify-এর SMS পাঠানোর সঠিক লিংক সেট করা নেই");
  }

  let res: Response;
  try {
    res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ recipient: to, message: msg }),
    });
  } catch {
    throw new Error("SMS গেটওয়েতে সংযোগ করা যায়নি");
  }

  const text = await res.text();
  const payload = parseGatewayReply(text);

  if (!res.ok) {
    const errMsg =
      (typeof payload.message === "string" && payload.message) ||
      (typeof payload.msg === "string" && payload.msg) ||
      `SMS পাঠানো ব্যর্থ হয়েছে (HTTP ${res.status})`;
    throw new Error(errMsg);
  }

  const okMsg =
    (typeof payload.message === "string" && payload.message) ||
    (typeof payload.msg === "string" && payload.msg) ||
    "Success";
  return { msg: okMsg, data: payload.data ?? null };
}
