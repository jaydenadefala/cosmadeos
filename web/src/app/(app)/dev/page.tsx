import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * Dev-only index of internal verification harnesses. Same "never in
 * production" convention as the Developer Preview Toolbar.
 */
export default function DevIndexPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const links = [
    { href: "/dev/design-system", label: "Design System (Phase 2)" },
    { href: "/dev/object-page-demo", label: "Object Page (Phase 3)" },
    { href: "/dev/list-toolbar-demo", label: "List + Toolbar + Filters (Phase 3)" },
    { href: "/dev/wizard-demo", label: "Multi-Step Wizard (Phase 3)" },
  ];

  return (
    <div className="mx-auto flex max-w-md flex-col gap-2 p-8">
      <h1 className="text-xl font-bold">Dev Harnesses</h1>
      <p className="text-muted-foreground mb-2 text-sm">
        Internal verification pages. Never linked from production navigation.
      </p>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-primary rounded-md border p-3 text-sm font-medium hover:bg-accent"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
