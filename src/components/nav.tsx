import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/app/sources/actions";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/sources", label: "Sources" },
  { href: "/settings", label: "Settings" },
];

export async function Nav() {
  const session = await auth();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          BBQ Agent
        </Link>
        <nav className="flex items-center gap-6 text-sm text-neutral-600">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-neutral-900">
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-neutral-600 hover:text-neutral-900"
                title={session.user.email ?? undefined}
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/sources" className="hover:text-neutral-900">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
