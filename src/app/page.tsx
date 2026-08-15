export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Personal assistant for the Weber Vast Kettle. Ingests your notes,
          answers grilling questions, and helps plan your cooks.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <Card title="Knowledge items" value="—" hint="From your BBQ folder" />
        <Card title="Pending review" value="—" hint="Items awaiting your call" />
        <Card title="Last import" value="—" hint="Not yet configured" />
      </section>
      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-base font-medium">Getting started</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-700">
          <li>Sync your Drive BBQ folder to this machine.</li>
          <li>Point the app at that folder in Sources.</li>
          <li>Run the initial import from Settings.</li>
          <li>Review classified items in the Inbox.</li>
          <li>Ask your first question on the assistant page.</li>
        </ol>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {title}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-neutral-500">{hint}</div>
    </div>
  );
}
