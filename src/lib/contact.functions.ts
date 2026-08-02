import "@/lib/ws-shim";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(3).max(2000),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin.from("contact_messages" as never) as any).insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });
