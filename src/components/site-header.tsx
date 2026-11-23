import Link from "next/link";

const links = [
  { href: "/", label: "Projects" },
  { href: "/people", label: "People" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          Task Board
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
