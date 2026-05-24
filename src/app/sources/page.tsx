import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { signInWithGoogleAction } from "./actions";
import { DriveForm } from "./drive-form";

type DriveConfig = { folderId: string; folderName: string };

export default async function SourcesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="space-y-4">
        <PageHeader />
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">
            Sign in with Google to connect Drive and Keep.
          </p>
          <form action={signInWithGoogleAction} className="mt-3">
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  const driveRows = await db
    .select({ config: schema.sources.config })
    .from(schema.sources)
    .where(
      and(
        eq(schema.sources.userId, session.user.id),
        eq(schema.sources.kind, "google_drive"),
      ),
    )
    .limit(1);

  const drive = driveRows[0]?.config as DriveConfig | undefined;

  return (
    <div className="space-y-4">
      <PageHeader />
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium">Google Drive</div>
            <div className="text-sm text-neutral-600">
              One dedicated BBQ folder, recursive.
            </div>
            {drive && (
              <div className="mt-2 text-sm text-emerald-700">
                Connected: {drive.folderName}
              </div>
            )}
          </div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            {drive ? "Connected" : "Not connected"}
          </div>
        </div>
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <DriveForm initialFolderName={drive?.folderName} />
        </div>
      </section>
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium">Google Keep</div>
            <div className="text-sm text-neutral-600">
              Notes labeled &ldquo;Recipes&rdquo;. Backfill via Takeout, then live sync.
            </div>
          </div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Not connected
          </div>
        </div>
      </section>
    </div>
  );
}

function PageHeader() {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
      <p className="text-sm text-neutral-600">
        Connect the places your BBQ knowledge lives.
      </p>
    </header>
  );
}
