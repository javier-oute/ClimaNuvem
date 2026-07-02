// Edge Function delete-account: borrado completo (Storage de forecast-images/avatars + auth.users con cascada); el service_role vive solo aquí.

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKETS = ["forecast-images", "avatars"];

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Borra todos los objetos del usuario en un bucket, en lotes, hasta vaciar su carpeta {uid}/.
async function removeUserFolder(
  admin: SupabaseClient,
  bucket: string,
  uid: string,
) {
  // Tope de seguridad para evitar bucles infinitos si algún remove fallara silenciosamente.
  for (let i = 0; i < 1000; i++) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(uid, { limit: 100 });
    if (error) throw error;
    if (!data || data.length === 0) return;

    const paths = data.filter((o) => o.name).map((o) => `${uid}/${o.name}`);
    if (paths.length === 0) return;

    const { error: rmErr } = await admin.storage.from(bucket).remove(paths);
    if (rmErr) throw rmErr;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing_authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Cliente scoped al usuario: identifica quién llama a partir de su JWT.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "unauthorized" }, 401);

    const uid = user.id;
    const admin = createClient(supabaseUrl, serviceKey);

    // 1) Storage primero (mientras la cuenta existe). Reintentable si fallara después.
    for (const bucket of BUCKETS) {
      await removeUserFolder(admin, bucket, uid);
    }

    // 2) Usuario auth → cascada a profiles + forecast_history + auth.*
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) return json({ error: "delete_failed" }, 500);

    return json({ success: true }, 200);
  } catch (_e) {
    return json({ error: "internal_error" }, 500);
  }
});
