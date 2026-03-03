import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAdminCookieName, isAdminTokenValid } from "@/lib/admin-auth";

const BUCKET = "site-assets";
const MAX_MB = 8;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function sanitizeSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9/_-]/g, "").replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

function extensionFromType(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/avif") return "avif";
  return "jpg";
}

async function ensureBucket() {
  const supabase = createClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (exists) return supabase;

  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_MB}MB`,
    allowedMimeTypes: Array.from(ALLOWED_TYPES),
  });
  return supabase;
}

export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get(getAdminCookieName())?.value;
  if (!isAdminTokenValid(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase upload not configured." }, { status: 500 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File missing." }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  if (file.size > MAX_MB * 1024 * 1024) return NextResponse.json({ error: `File too large. Max ${MAX_MB}MB.` }, { status: 400 });

  const folderInput = String(form?.get("folder") ?? "misc");
  const folder = sanitizeSegment(folderInput) || "misc";
  const ext = extensionFromType(file.type);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `${folder}/${filename}`;

  const bytes = await file.arrayBuffer();
  const supabase = await ensureBucket();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
