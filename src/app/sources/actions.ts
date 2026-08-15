"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { inspectLibrary, LibraryError } from "@/lib/library";

export type LibraryConfig = {
  rootPath: string;
  fileCount: number;
  extractableCount: number;
};

export type ConnectLibraryResult =
  | { ok: true; config: LibraryConfig }
  | { ok: false; error: string };

export async function connectLibraryAction(
  _prev: ConnectLibraryResult | null,
  formData: FormData,
): Promise<ConnectLibraryResult> {
  const raw = formData.get("rootPath");
  if (typeof raw !== "string") {
    return { ok: false, error: "Missing folder path." };
  }

  let config: LibraryConfig;
  try {
    config = await inspectLibrary(raw);
  } catch (e) {
    if (e instanceof LibraryError) return { ok: false, error: e.message };
    throw e;
  }

  const existing = await db
    .select({ id: schema.sources.id })
    .from(schema.sources)
    .where(eq(schema.sources.kind, "local_folder"))
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.sources)
      .set({ config })
      .where(eq(schema.sources.id, existing[0].id));
  } else {
    await db
      .insert(schema.sources)
      .values({ kind: "local_folder", config });
  }

  revalidatePath("/sources");
  return { ok: true, config };
}

export async function getLibraryConfig(): Promise<LibraryConfig | null> {
  const rows = await db
    .select({ config: schema.sources.config })
    .from(schema.sources)
    .where(eq(schema.sources.kind, "local_folder"))
    .limit(1);

  return (rows[0]?.config as LibraryConfig | undefined) ?? null;
}
