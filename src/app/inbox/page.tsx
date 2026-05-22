export default function InboxPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-neutral-600">
          Items the classifier could not place with confidence. Promote, edit,
          or discard each one.
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-neutral-500">
        No items yet. Connect a source and run the backfill.
      </div>
    </div>
  );
}
