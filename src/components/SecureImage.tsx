import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isPrivateMedia, signPrivateMedia } from "@/lib/media.functions";

/**
 * Renders an image that may live in the private storage bucket.
 * Private files are resolved to short-lived signed URLs for staff only.
 */
export function SecureImage({
  url,
  alt,
  className,
  linkClassName,
  caption,
}: {
  url: string;
  alt: string;
  className?: string;
  linkClassName?: string;
  caption?: string;
}) {
  const [src, setSrc] = useState<string | null>(isPrivateMedia(url) ? null : url);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isPrivateMedia(url)) {
      setSrc(url);
      return;
    }
    setSrc(null);
    setFailed(false);
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("no session");
        const res = await signPrivateMedia({ data: { accessToken: token, paths: [url] } });
        if (active) setSrc(res.urls[url] ?? null);
      } catch {
        if (active) setFailed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [url]);

  const body = src ? (
    <img src={src} alt={alt} className={className} />
  ) : (
    <div className={`${className ?? ""} flex items-center justify-center bg-muted text-[10px] text-muted-foreground`}>
      {failed ? "দেখার অনুমতি নেই" : "লোড হচ্ছে..."}
    </div>
  );

  if (!src) {
    return (
      <div className={linkClassName}>
        {body}
        {caption && <div className="text-[10px] text-center py-1 bg-muted/40">{caption}</div>}
      </div>
    );
  }

  return (
    <a href={src} target="_blank" rel="noreferrer" className={linkClassName}>
      {body}
      {caption && <div className="text-[10px] text-center py-1 bg-muted/40">{caption}</div>}
    </a>
  );
}
