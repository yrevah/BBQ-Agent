"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { db, schema } from "@/db";
import {
  getDriveFolder,
  getGoogleAccessToken,
  parseDriveFolderInput,
} from "@/lib/google";

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/sources" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export type ConnectDriveResult =
  | { ok: true; folderName: string }
  | { ok: false; error: string };

export async function connectDriveFolderAction(
  _prev: ConnectDriveResult | null,
  formData: FormData,
): Promise<ConnectDriveResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in first." };
  }

  const raw = formData.get("folder");
  if (typeof raw !== "string") {
    return { ok: false, error: "Missing folder input." };
  }

  let folderId: string;
  try {
    folderId = parseDriveFolderInput(raw);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  let accessToken: string;
  try {
    accessToken = await getGoogleAccessToken(session.user.id);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  let folder;
  try {
    folder = await getDriveFolder(accessToken, folderId);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const existing = await db
    .select({ id: schema.sources.id })
    .from(schema.sources)
    .where(
      and(
        eq(schema.sources.userId, session.user.id),
        eq(schema.sources.kind, "google_drive"),
      ),
    )
    .limit(1);

  const config = { folderId: folder.id, folderName: folder.name };

  if (existing[0]) {
    await db
      .update(schema.sources)
      .set({ config })
      .where(eq(schema.sources.id, existing[0].id));
  } else {
    await db.insert(schema.sources).values({
      userId: session.user.id,
      kind: "google_drive",
      config,
    });
  }

  revalidatePath("/sources");
  return { ok: true, folderName: folder.name };
}
