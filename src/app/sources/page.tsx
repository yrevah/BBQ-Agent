export default function SourcesPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
        <p className="text-sm text-neutral-600">
          Connect the places your BBQ knowledge lives.
        </p>
      </header>
      <ul className="space-y-3">
        <SourceRow
          name="Google Drive"
          detail="One dedicated BBQ folder, recursive."
          status="Not connected"
        />
        <SourceRow
          name="Google Keep"
          detail='Notes labeled "Recipes". Backfill via Takeout, then live sync.'
          status="Not connected"
        />
      </ul>
    </div>
  );
}

function SourceRow({
  name,
  detail,
  status,
}: {
  name: string;
  detail: string;
  status: string;
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-neutral-600">{detail}</div>
      </div>
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {status}
      </div>
    </li>
  );
}
