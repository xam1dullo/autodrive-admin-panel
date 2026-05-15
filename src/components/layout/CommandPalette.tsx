import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  GraduationCap,
  CreditCard,
  Headphones,
  Users,
  User,
  Layers,
  UserCog,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuthStore } from "@/store/authStore";
import { useCompanies } from "@/services/companyService";
import { usePlatformUsers } from "@/services/platformUserService";

type NavEntry = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  devOnly?: boolean;
  ownerOnly?: boolean;
};

const NAV_ENTRIES: NavEntry[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Kompaniyalar", path: "/kompaniyalar", icon: Briefcase, devOnly: true },
  { label: "Platform Users", path: "/platform-foydalanuvchilar", icon: KeyRound, devOnly: true },
  { label: "Filiallar", path: "/filiallar", icon: Building2, ownerOnly: true },
  { label: "Guruhlar", path: "/guruhlar", icon: Layers },
  { label: "Talabalar", path: "/talabalar", icon: GraduationCap },
  { label: "To'lovlar", path: "/tolovlar", icon: CreditCard },
  { label: "Operatorlar", path: "/operatorlar", icon: Headphones },
  { label: "O'qituvchilar", path: "/oqituvchilar", icon: Users },
  { label: "Foydalanuvchilar", path: "/foydalanuvchilar", icon: UserCog, ownerOnly: true },
  { label: "Audit log", path: "/audit", icon: ShieldCheck, ownerOnly: true },
  { label: "Profil", path: "/profile", icon: User },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const isDev = useAuthStore((s) => s.isDev());
  const isOwner = useAuthStore((s) => s.isOwner());
  const setActiveCompanyId = useAuthStore((s) => s.setActiveCompanyId);

  // Fetch only when palette opens — keeps initial nav cheap.
  const { data: companies } = useCompanies({ limit: 100 });
  const { data: users } = usePlatformUsers({ limit: 100 });

  const visibleNav = NAV_ENTRIES.filter((n) => {
    if (n.devOnly) return isDev;
    if (n.ownerOnly) return isOwner || isDev;
    return true;
  });

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const goCompany = (id: string) => {
    setActiveCompanyId(id);
    onOpenChange(false);
    navigate(`/kompaniyalar/${id}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Sahifa, kompaniya yoki foydalanuvchi qidirish..." />
      <CommandList>
        <CommandEmpty>Hech narsa topilmadi.</CommandEmpty>

        <CommandGroup heading="Sahifalar">
          {visibleNav.map((n) => (
            <CommandItem
              key={n.path}
              value={`${n.label} ${n.path}`}
              onSelect={() => go(n.path)}
            >
              <n.icon className="mr-2 h-4 w-4" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {isDev && companies?.items && companies.items.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Kompaniyalar">
              {companies.items.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`company ${c.name} ${c.slug}`}
                  onSelect={() => goCompany(c.id)}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{c.slug}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {isDev && users?.items && users.items.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Foydalanuvchilar">
              {users.items.slice(0, 20).map((u) => (
                <CommandItem
                  key={u.id}
                  value={`user ${u.name} ${u.email}`}
                  onSelect={() => go("/platform-foydalanuvchilar")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{u.name || u.email}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{u.role}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

/**
 * Hook that registers the cmd+k / ctrl+k global shortcut and exposes
 * the open state. Mount once in AppLayout and pass to <CommandPalette>.
 */
export const useCommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
};
