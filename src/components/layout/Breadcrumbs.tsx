import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

/**
 * Slug → display label. Mirrors the labels in `Sidebar.tsx` so the
 * crumb above the page matches the nav item the user just clicked.
 * Unknown slugs (eg. UUIDs in `/kompaniyalar/:id`) fall back to the
 * raw slug — fine for technical / detail pages.
 */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  kompaniyalar: "Kompaniyalar",
  "platform-foydalanuvchilar": "Platform Users",
  "system-health": "Tizim holati",
  filiallar: "Filiallar",
  guruhlar: "Guruhlar",
  talabalar: "Talabalar",
  tolovlar: "To'lovlar",
  operatorlar: "Operatorlar",
  oqituvchilar: "O'qituvchilar",
  foydalanuvchilar: "Foydalanuvchilar",
  audit: "Audit log",
  profile: "Profil",
};

export const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] === "login") return null;

  const crumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    return { segment, href, label: SEGMENT_LABELS[segment] ?? segment };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-sm">
      <Link
        to="/dashboard"
        className="inline-flex items-center text-muted-foreground hover:text-foreground"
        aria-label="Bosh sahifa"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.href} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-medium text-foreground">{c.label}</span>
            ) : (
              <Link to={c.href} className="text-muted-foreground hover:text-foreground">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};
