import { useQueryClient } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCompanies } from '@/services/companyService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL = '__all__';

export const CompanySwitcher = () => {
  const queryClient = useQueryClient();
  const isDev = useAuthStore((s) => s.isDev());
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const setActiveCompanyId = useAuthStore((s) => s.setActiveCompanyId);
  const { data, isLoading } = useCompanies({ limit: 200 });

  if (!isDev) return null;

  const handleChange = (value: string) => {
    setActiveCompanyId(value === ALL ? '' : value);
    // All tenant-scoped query keys depend on the active company implicitly
    // (axios interceptor appends company_id). Invalidate everything except
    // the platform companies/users lists, which don't change with switching.
    queryClient.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey[0];
        return key !== 'platform-companies' && key !== 'platform-users';
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={activeCompanyId || ALL} onValueChange={handleChange}>
        <SelectTrigger className="h-9 w-[220px] text-sm">
          <SelectValue placeholder={isLoading ? 'Yuklanmoqda…' : 'Kompaniya'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Hamma kompaniyalar</SelectItem>
          {data?.items?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
