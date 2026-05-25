import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCanvas({ value, size = 160 }: { value: string; size?: number }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: "#0c2340", light: "#ffffff" } })
      .then((u) => { if (!cancelled) setUrl(u); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [value, size]);
  if (!url) return <div style={{ width: size, height: size }} className="bg-muted rounded animate-pulse" />;
  return <img src={url} width={size} height={size} alt="QR" className="rounded" />;
}
