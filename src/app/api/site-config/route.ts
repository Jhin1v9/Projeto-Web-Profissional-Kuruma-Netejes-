import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SiteConfigSchema, getDefaultConfig, normalizeSiteConfig } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";
import type { SiteConfig } from "@/types/site-config";

const KEY = "default";
const LOCAL_CONFIG_FILE = path.join(process.cwd(), "data", "site-config.local.json");
const STORAGE_BUCKET = "site-config-data";
const STORAGE_PATH = "default.json";

type StoredRecord = {
  data?: SiteConfig;
  published_data?: SiteConfig;
  published_at?: string;
};

type ViewMode = "draft" | "published";
const IS_VERCEL = !!process.env.VERCEL;

function getViewMode(req: Request): ViewMode {
  const view = new URL(req.url).searchParams.get("view");
  return view === "draft" ? "draft" : "published";
}

function parseConfigPayload(payload: unknown): SiteConfig | null {
  const parsed = SiteConfigSchema.safeParse(payload);
  return parsed.success ? normalizeSiteConfig(parsed.data) : null;
}

function pickPayload(record: StoredRecord | null, view: ViewMode): SiteConfig {
  if (!record) return getDefaultConfig();
  if (view === "draft") return record.data ?? record.published_data ?? getDefaultConfig();
  return record.published_data ?? getDefaultConfig();
}

function isMissingSiteConfigTableError(message?: string | null): boolean {
  if (!message) return false;
  const text = message.toLowerCase();
  return text.includes("could not find the table") && text.includes("site_config");
}

async function readLocalRecord(): Promise<StoredRecord | null> {
  try {
    const raw = await readFile(LOCAL_CONFIG_FILE, "utf8");
    const json = JSON.parse(raw) as StoredRecord;
    return json;
  } catch {
    return null;
  }
}

async function writeLocalRecord(record: StoredRecord): Promise<void> {
  await mkdir(path.dirname(LOCAL_CONFIG_FILE), { recursive: true });
  await writeFile(LOCAL_CONFIG_FILE, JSON.stringify(record, null, 2), "utf8");
}

async function ensureStorageBucket() {
  const supabase = createClient();
  const { data } = await supabase.storage.listBuckets();
  const exists = data?.some((b) => b.name === STORAGE_BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(STORAGE_BUCKET, { public: false, fileSizeLimit: "1MB" });
  }
  return supabase;
}

async function readStorageRecord(): Promise<StoredRecord | null> {
  const supabase = await ensureStorageBucket();
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(STORAGE_PATH);
  if (error || !data) return null;
  const raw = await data.text();
  return JSON.parse(raw) as StoredRecord;
}

async function writeStorageRecord(record: StoredRecord): Promise<void> {
  const supabase = await ensureStorageBucket();
  const payload = new Blob([JSON.stringify(record)], { type: "application/json" });
  await supabase.storage.from(STORAGE_BUCKET).upload(STORAGE_PATH, payload, {
    contentType: "application/json",
    upsert: true,
  });
}

export async function GET(req: Request) {
  const view = getViewMode(req);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    const local = await readLocalRecord();
    const draft = parseConfigPayload(local?.data);
    const published = parseConfigPayload(local?.published_data);
    return NextResponse.json(
      pickPayload(
        {
          data: draft ?? undefined,
          published_data: published ?? undefined,
          published_at: local?.published_at,
        },
        view
      )
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.from("site_config").select("published_data,data").eq("key", KEY).single();
  if (error || !data) {
    if (isMissingSiteConfigTableError(error?.message)) {
      const localFallback = await readStorageRecord();
      const draft = parseConfigPayload(localFallback?.data);
      const published = parseConfigPayload(localFallback?.published_data);
      return NextResponse.json(
        pickPayload(
          {
            data: draft ?? undefined,
            published_data: published ?? undefined,
            published_at: localFallback?.published_at,
          },
          view
        )
      );
    }
    return NextResponse.json(getDefaultConfig());
  }

  const draft = parseConfigPayload(data.data);
  const published = parseConfigPayload(data.published_data);
  return NextResponse.json(pickPayload({ data: draft ?? undefined, published_data: published ?? undefined }, view));
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parseConfigPayload(body);
  if (!parsed) return NextResponse.json({ error: "Invalid config" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    if (IS_VERCEL) {
      return NextResponse.json(
        { error: "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel." },
        { status: 500 }
      );
    }
    const existing = await readLocalRecord();
    await writeLocalRecord({
      ...existing,
      data: parsed,
    });
    return NextResponse.json({ ok: true, persisted: true, storage: "local", mode: "draft" });
  }

  const supabase = createClient();
  const { error } = await supabase.from("site_config").upsert({ key: KEY, data: parsed }, { onConflict: "key" });
  if (error) {
    if (isMissingSiteConfigTableError(error.message)) {
      const existing = await readStorageRecord();
      await writeStorageRecord({ ...existing, data: parsed });
      return NextResponse.json({ ok: true, persisted: true, storage: "supabase-storage", mode: "draft" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, persisted: true, storage: "supabase", mode: "draft" });
}

export async function POST() {
  const now = new Date().toISOString();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    if (IS_VERCEL) {
      return NextResponse.json(
        { error: "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel." },
        { status: 500 }
      );
    }
    const existing = await readLocalRecord();
    const source = existing?.data ?? existing?.published_data;
    if (!source) return NextResponse.json({ error: "No draft to publish" }, { status: 400 });

    await writeLocalRecord({
      ...existing,
      data: source,
      published_data: source,
      published_at: now,
    });

    return NextResponse.json({ ok: true, persisted: true, storage: "local", mode: "published" });
  }

  const supabase = createClient();
  const { data, error } = await supabase.from("site_config").select("data").eq("key", KEY).single();
  if (error || !data) {
    if (isMissingSiteConfigTableError(error?.message)) {
      const existing = await readStorageRecord();
      const source = existing?.data ?? existing?.published_data;
      if (!source) return NextResponse.json({ error: "No config" }, { status: 400 });
      const parsedStorage = parseConfigPayload(source);
      if (!parsedStorage) return NextResponse.json({ error: "Invalid config" }, { status: 400 });
      await writeStorageRecord({
        ...existing,
        data: parsedStorage,
        published_data: parsedStorage,
        published_at: now,
      });
      return NextResponse.json({ ok: true, persisted: true, storage: "supabase-storage", mode: "published" });
    }
    return NextResponse.json({ error: "No config" }, { status: 400 });
  }

  const parsed = parseConfigPayload(data.data);
  if (!parsed) return NextResponse.json({ error: "Invalid config" }, { status: 400 });

  const { error: e2 } = await supabase
    .from("site_config")
    .update({ published_data: parsed, published_at: now })
    .eq("key", KEY);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, persisted: true, storage: "supabase", mode: "published" });
}
