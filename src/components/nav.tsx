import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/sources", label: "Sources" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          BBQ Agent
        </Link>
        <nav className="flex gap-6 text-sm text-neutral-600">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-neutral-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
