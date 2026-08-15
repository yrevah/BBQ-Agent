import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * The BBQ corpus lives in a folder on disk — typically a Google Drive folder
 * synced down by Drive for Desktop or rclone. We only ever read from it.
 */

/** Extensions we can turn into text today. */
const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".rtf",
  ".csv",
  ".json",
  ".html",
  ".htm",
]);

/** Extensions we recognise as corpus material but cannot yet extract. */
const DEFERRED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
]);

/** Directories that are never corpus content. */
const SKIP_DIRECTORIES = new Set([
  ".git",
  ".obsidian",
  "node_modules",
  ".Trash",
  "#recycle",
]);

export type ScannedFile = {
  /** Path relative to the library root — the stable identity of an item. */
  relativePath: string;
  absolutePath: string;
  name: string;
  extension: string;
  sizeBytes: number;
  modifiedAt: Date;
  /** Whether we can extract text from this file today. */
  extractable: boolean;
};

export class LibraryError extends Error {}

/** Confirm a path is a readable directory, and report what is inside it. */
export async function inspectLibrary(rootPath: string): Promise<{
  rootPath: string;
  fileCount: number;
  extractableCount: number;
}> {
  const root = await resolveRoot(rootPath);
  const files = await scanLibrary(root);
  return {
    rootPath: root,
    fileCount: files.length,
    extractableCount: files.filter((f) => f.extractable).length,
  };
}

async function resolveRoot(rootPath: string): Promise<string> {
  const trimmed = rootPath.trim();
  if (!trimmed) {
    throw new LibraryError("Enter the folder path.");
  }

  const resolved = path.resolve(untilde(trimmed));

  let stat;
  try {
    stat = await fs.stat(resolved);
  } catch {
    throw new LibraryError(`No such folder: ${resolved}`);
  }
  if (!stat.isDirectory()) {
    throw new LibraryError(`Not a folder: ${resolved}`);
  }

  try {
    await fs.access(resolved, fs.constants.R_OK);
  } catch {
    throw new LibraryError(`Folder is not readable: ${resolved}`);
  }

  return resolved;
}

function untilde(p: string): string {
  if (p === "~" || p.startsWith("~/")) {
    const home = process.env.HOME;
    if (home) return path.join(home, p.slice(1));
  }
  return p;
}

/** Walk the library recursively, skipping hidden and known-noise entries. */
export async function scanLibrary(root: string): Promise<ScannedFile[]> {
  const out: ScannedFile[] = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolutePath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (SKIP_DIRECTORIES.has(entry.name)) continue;
        await walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;

      const extension = path.extname(entry.name).toLowerCase();
      const known =
        TEXT_EXTENSIONS.has(extension) || DEFERRED_EXTENSIONS.has(extension);
      if (!known) continue;

      const stat = await fs.stat(absolutePath);
      out.push({
        relativePath: path.relative(root, absolutePath),
        absolutePath,
        name: entry.name,
        extension,
        sizeBytes: stat.size,
        modifiedAt: stat.mtime,
        extractable: TEXT_EXTENSIONS.has(extension),
      });
    }
  }

  await walk(root);
  out.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return out;
}

/** Read a file's text. Callers should check `extractable` first. */
export async function readFileText(file: ScannedFile): Promise<string> {
  return fs.readFile(file.absolutePath, "utf8");
}

/** Content hash, used to detect real edits and skip unchanged files. */
export function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}
