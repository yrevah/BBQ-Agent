import { getLibraryConfig } from "./actions";
import { LibraryForm } from "./library-form";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const library = await getLibraryConfig();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
        <p className="text-sm text-neutral-600">
          Connect the places your BBQ knowledge lives.
        </p>
      </header>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium">BBQ folder</div>
            <div className="text-sm text-neutral-600">
              A folder on this machine, read recursively. Point it at your
              Google Drive folder as synced by Drive for Desktop or rclone.
            </div>
            {library && (
              <div className="mt-2 space-y-0.5 text-sm">
                <div className="font-mono text-neutral-700">
                  {library.rootPath}
                </div>
                <div className="text-emerald-700">
                  {library.fileCount} files, {library.extractableCount} readable
                  as text
                </div>
              </div>
            )}
          </div>
          <div className="shrink-0 text-xs uppercase tracking-wide text-neutral-500">
            {library ? "Connected" : "Not connected"}
          </div>
        </div>
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <LibraryForm current={library} />
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium">Google Keep</div>
            <div className="text-sm text-neutral-600">
              Notes labeled &ldquo;Recipes&rdquo;, imported from a Google
              Takeout export.
            </div>
          </div>
          <div className="shrink-0 text-xs uppercase tracking-wide text-neutral-500">
            Not connected
          </div>
        </div>
      </section>
    </div>
  );
}
