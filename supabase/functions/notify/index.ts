import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Sends transactional emails via Resend:
//  - new_signup  → notifies all admins that an approval is waiting
//  - approved    → notifies the user their account was approved
//  - rejected    → notifies the user their request was not approved
//
// Required secrets: RESEND_API_KEY
// Optional secrets: NOTIFY_FROM (e.g. "Mughees Editor <noreply@mugheeseditor.pk>")

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM =
  Deno.env.get("NOTIFY_FROM") || "Mughees Editor <onboarding@resend.dev>";
const SUPPORT = "support@mugheeseditor.pk";

async function sendEmail(to: string[], subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(body));
  return body;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }
  try {
    const { type, userId } = await req.json();
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (type === "new_signup") {
      const { data: admins } = await supabase
        .from("profiles")
        .select("email")
        .eq("role", "admin");
      const { data: user } = await supabase
        .from("profiles")
        .select("name,email,phone,network")
        .eq("id", userId)
        .single();
      const to = (admins || []).map((a: any) => a.email).filter(Boolean);
      if (!to.length) throw new Error("no admin email found");
      await sendEmail(
        to,
        "🔔 New signup request — approval needed",
        `<p>A new user signed up and is waiting for approval:</p>
         <ul><li><b>Name:</b> ${user?.name || "-"}</li>
         <li><b>Email:</b> ${user?.email || "-"}</li>
         <li><b>Phone:</b> ${user?.phone || "-"}</li>
         <li><b>Network:</b> ${user?.network || "-"}</li></ul>
         <p>Open the admin panel → ✅ Approvals to approve or reject.</p>`
      );
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (type === "approved" || type === "rejected") {
      const { data: user } = await supabase
        .from("profiles")
        .select("name,email")
        .eq("id", userId)
        .single();
      if (!user?.email) throw new Error("user email not found");
      const isOk = type === "approved";
      await sendEmail(
        [user.email],
        isOk
          ? "🎉 Your Mughees Editor account is approved!"
          : "Update on your Mughees Editor signup request",
        isOk
          ? `<p>Hi ${user.name || "there"},</p>
             <p>Great news — your Mughees Editor account has been <b>approved</b>! 🎉</p>
             <p>You can now log in and access your student dashboard.</p>`
          : `<p>Hi ${user.name || "there"},</p>
             <p>Your signup request was not approved at this time.</p>
             <p>If you believe this is a mistake, please contact us at ${SUPPORT}.</p>`
      );
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "unknown type" }), {
      status: 400,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
