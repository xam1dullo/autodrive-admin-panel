import { CompanySwitcher } from './CompanySwitcher';
import { useAuthStore } from '@/store/authStore';

export const Topbar = () => {
  const isDev = useAuthStore((s) => s.isDev());

  // Dev is the only role that benefits from a topbar today (company switcher).
  // Render nothing for other roles to keep the layout clean.
  if (!isDev) return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b border-border bg-background/95 px-6 backdrop-blur">
      <CompanySwitcher />
    </header>
  );
};
