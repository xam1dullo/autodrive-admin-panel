import { useState } from "react";
import { format } from "date-fns";
import { useGroups, useGroupsOverview, useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/services/groupService";
import { useBranches } from "@/services/branchService";
import { Group } from "@/types/group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const formatDate = (d: string) => {
  try { return format(new Date(d), "dd.MM.yyyy"); } catch { return d; }
};

const GroupsPage = () => {
  const { data: groups, isLoading } = useGroups();
  const { data: overview } = useGroupsOverview();
  const { data: branches } = useBranches();
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

  // Form state
  const [formName, setFormName] = useState("");
  const [formBranchId, setFormBranchId] = useState("");
  const [formCourseType, setFormCourseType] = useState<string>("avto_maktab");

  const branchList = branches || [];

  const filtered = (groups || []).filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditGroup(null);
    setFormName(""); setFormBranchId(""); setFormCourseType("avto_maktab");
    setModalOpen(true);
  };

  const openEdit = (g: Group) => {
    setEditGroup(g);
    setFormName(g.name);
    setFormBranchId(g.branch_id);
    setFormCourseType(g.course_type);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBranchId) return;

    const payload = { name: formName, branchId: formBranchId, courseType: formCourseType };

    if (editGroup) {
      updateMutation.mutate({ id: editGroup.id, ...payload }, {
        onSuccess: () => { toast.success("Guruh yangilandi"); setModalOpen(false); },
        onError: () => toast.error("Xatolik yuz berdi"),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success("Guruh qo'shildi"); setModalOpen(false); },
        onError: () => toast.error("Xatolik yuz berdi"),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => { toast.success("Guruh o'chirildi"); setDeleteId(null); },
      onError: () => toast.error("Xatolik yuz berdi"),
    });
  };

  const toggleBranch = (id: string) =>
    setExpandedBranches((prev) => ({ ...prev, [id]: !prev[id] }));

  const getBranchName = (branchId: string) =>
    branchList.find((b) => b.id === branchId)?.name || branchId;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Guruhlar</h1>
          <p className="text-sm text-muted-foreground">{(groups || []).length} ta guruh</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Guruh qo'shish
        </Button>
      </div>

      {/* Overview */}
      {overview && overview.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-heading text-sm font-semibold text-muted-foreground">Filiallar bo'yicha</h2>
          <div className="space-y-2">
            {overview.map((ov) => (
              <div key={ov.branch_id} className="glass-card overflow-hidden">
                <button
                  onClick={() => toggleBranch(ov.branch_id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className="font-medium">{ov.branch_name} <span className="text-muted-foreground text-sm">({ov.groups.length} guruh)</span></span>
                  {expandedBranches[ov.branch_id] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>
                {expandedBranches[ov.branch_id] && (
                  <div className="border-t border-border px-4 py-2 space-y-1">
                    {ov.groups.map((g) => (
                      <div key={g.id} className="flex items-center justify-between py-1.5 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{g.name}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${g.course_type === "avto_maktab" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"}`}>
                            {g.course_type === "avto_maktab" ? "Avto maktab" : "Tezkor"}
                          </span>
                          <span className="text-muted-foreground">{g.active_students} talaba</span>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${g.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {g.is_active ? "Faol" : "Nofaol"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Guruh nomi..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nomi</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Filial</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Kurs turi</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Talabalar</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Holati</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Yaratilgan</th>
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
                : filtered.map((g) => (
                    <tr key={g.id} className="table-row-striped border-b border-border/50">
                      <td className="px-4 py-3 font-medium">{g.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{g.branch_name || getBranchName(g.branch_id)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${g.course_type === "avto_maktab" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"}`}>
                          {g.course_type === "avto_maktab" ? "Avto maktab" : "Tezkor"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{g.active_students}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${g.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {g.is_active ? "Faol" : "Nofaol"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(g.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(g)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(g.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {filtered.length === 0 && !isLoading && (
            <div className="py-12 text-center text-muted-foreground">Guruhlar topilmadi</div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editGroup ? "Guruhni tahrirlash" : "Yangi guruh qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nomi *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="11-guruh" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Filial *</Label>
              <Select value={formBranchId} onValueChange={setFormBranchId}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  {branchList.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kurs turi *</Label>
              <Select value={formCourseType} onValueChange={setFormCourseType}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="avto_maktab">Avto maktab</SelectItem>
                  <SelectItem value="tezkor">Tezkor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? "Saqlanmoqda..." : editGroup ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default GroupsPage;
