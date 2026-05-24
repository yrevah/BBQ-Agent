import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";

type TokenRow = {
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
};

const REFRESH_SKEW_SECONDS = 60;

export async function getGoogleAccessToken(userId: string): Promise<string> {
  const account = (await db
    .select({
      access_token: schema.accounts.access_token,
      refresh_token: schema.accounts.refresh_token,
      expires_at: schema.accounts.expires_at,
    })
    .from(schema.accounts)
    .where(
      and(
        eq(schema.accounts.userId, userId),
        eq(schema.accounts.provider, "google"),
      ),
    )
    .limit(1)) as TokenRow[];

  const row = account[0];
  if (!row) {
    throw new Error("No Google account linked for this user.");
  }

  const now = Math.floor(Date.now() / 1000);
  const stillValid =
    row.access_token &&
    row.expires_at &&
    row.expires_at - REFRESH_SKEW_SECONDS > now;

  if (stillValid && row.access_token) {
    return row.access_token;
  }

  if (!row.refresh_token) {
    throw new Error(
      "Google access token expired and no refresh token is stored. Re-link the account.",
    );
  }

  const refreshed = await refreshAccessToken(row.refresh_token);

  await db
    .update(schema.accounts)
    .set({
      access_token: refreshed.access_token,
      expires_at: refreshed.expires_at,
    })
    .where(
      and(
        eq(schema.accounts.userId, userId),
        eq(schema.accounts.provider, "google"),
      ),
    );

  return refreshed.access_token;
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_at: number;
}> {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are not set.");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token refresh failed: ${res.status} ${body}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  return {
    access_token: json.access_token,
    expires_at: Math.floor(Date.now() / 1000) + json.expires_in,
  };
}

export type DriveFolder = {
  id: string;
  name: string;
  mimeType: string;
};

export async function getDriveFolder(
  accessToken: string,
  folderId: string,
): Promise<DriveFolder> {
  const url = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}`,
  );
  url.searchParams.set("fields", "id,name,mimeType");
  url.searchParams.set("supportsAllDrives", "true");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 404) {
    throw new Error("Folder not found, or you don't have access to it.");
  }
  if (!res.ok) {
    throw new Error(`Drive API error: ${res.status} ${await res.text()}`);
  }

  const folder = (await res.json()) as DriveFolder;
  if (folder.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error("That ID is not a folder.");
  }
  return folder;
}

export function parseDriveFolderInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Paste a folder URL or ID.");
  }

  const urlMatch =
    trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/) ??
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;

  throw new Error("Could not parse a Drive folder ID from that input.");
}
