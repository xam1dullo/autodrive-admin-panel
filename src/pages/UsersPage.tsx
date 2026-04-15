import { useUsers } from "@/services/userService";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const formatDate = (d?: string) => {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy"); } catch { return d; }
};

const UsersPage = () => {
  const { data: users, isLoading } = useUsers();
  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(users || []);

  const startIndex = (currentPage - 1) * 10;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Foydalanuvchilar</h1>
        <p className="text-sm text-muted-foreground">{(users || []).length} ta foydalanuvchi</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefon</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Filial</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Holati</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Yaratilgan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={7} className="p-4"><Skeleton className="h-5 w-full" /></td>
                    </tr>
                  ))
                : paginatedItems.map((u, idx) => (
                    <tr key={u.id} className="table-row-striped border-b border-border/50">
                      <td className="px-4 py-3 text-center text-muted-foreground">{startIndex + idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "owner" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {u.role === "owner" ? "Owner" : "Manager"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.branch_name || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${u.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {u.is_active ? "Faol" : "Nofaol"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {(users || []).length === 0 && !isLoading && (
            <div className="py-12 text-center text-muted-foreground">Foydalanuvchilar topilmadi</div>
          )}
        </div>
      </div>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default UsersPage;
