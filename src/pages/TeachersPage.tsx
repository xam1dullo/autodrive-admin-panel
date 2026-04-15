import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/ui/PaginationControls';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, Specialization } from '@/services/teacherService';
import { useBranches } from '@/services/branchService';
import { toast } from 'sonner';
import { User } from '@/types/user';

const specLabels: Record<Specialization, string> = {
  THEORY: 'Nazariy dars',
  PRACTICE: 'Amaliy haydash',
};

const TeachersPage = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', branchId: '', specialization: 'THEORY' as Specialization });

  const { data: teachers, isLoading } = useTeachers();
  const { data: branches } = useBranches();
  const createMut = useCreateTeacher();
  const updateMut = useUpdateTeacher();
  const deleteMut = useDeleteTeacher();

  const filtered = (teachers || []).filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.phone?.includes(search)
  );
  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(filtered);

  const openCreate = () => {
    setEditItem(null);
    setForm({ fullName: '', phone: '', branchId: '', specialization: 'THEORY' });
    setModalOpen(true);
  };

  const openEdit = (t: User) => {
    setEditItem(t);
    setForm({ fullName: t.name || '', phone: t.phone || '', branchId: t.branch_id || '', specialization: t.specialization || 'THEORY' });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) return;
    if (editItem) {
      updateMut.mutate({ id: editItem.id, ...form }, {
        onSuccess: () => { toast.success("O'qituvchi yangilandi"); setModalOpen(false); },
        onError: () => toast.error("Xatolik yuz berdi"),
      });
    } else {
      createMut.mutate(form, {
        onSuccess: () => { toast.success("O'qituvchi qo'shildi"); setModalOpen(false); },
        onError: () => toast.error("Xatolik yuz berdi"),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => { toast.success("O'qituvchi o'chirildi"); setDeleteId(null); },
      onError: () => toast.error("Xatolik yuz berdi"),
    });
  };

  const getBranchName = (branchId: string) =>
    (branches || []).find((b) => b.id === branchId)?.name || branchId || '—';

  const startIndex = (currentPage - 1) * 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">O'qituvchilar</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} ta o'qituvchi</p>
        </div>
        <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> O'qituvchi qo'shish</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ism</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefon</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mutaxassisligi</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Filial</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Holati</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td colSpan={7} className="p-4"><Skeleton className="h-5 w-full" /></td>
                  </tr>
                ))
              : paginatedItems.map((t, idx) => (
                <tr key={t.id} className="table-row-striped border-b border-border/50">
                  <td className="px-4 py-3 text-center text-muted-foreground">{startIndex + idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{specLabels[t.specialization] || t.specialization}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.branch_name || getBranchName(t.branch_id)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.is_active !== false ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {t.is_active !== false ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(t)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteId(t.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {filtered.length === 0 && !isLoading && (
          <div className="py-12 text-center text-muted-foreground">O'qituvchilar topilmadi</div>
        )}
      </div>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">{editItem ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ism *</Label>
              <Input value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Telefon *</Label>
              <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder="+998901234567" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Mutaxassisligi *</Label>
              <Select value={form.specialization} onValueChange={(v) => setForm(f => ({ ...f, specialization: v as Specialization }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="THEORY">Nazariy dars</SelectItem>
                  <SelectItem value="PRACTICE">Amaliy haydash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filial</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm(f => ({ ...f, branchId: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  {(branches || []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? "Saqlanmoqda..." : editItem ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  );
};

export default TeachersPage;
