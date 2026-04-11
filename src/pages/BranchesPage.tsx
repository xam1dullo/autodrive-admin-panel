import { useBranches } from '@/services/branchService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';

const BranchesPage = () => {
  const { data: branches, isLoading } = useBranches();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Filiallar</h1>
          <p className="text-sm text-muted-foreground">Barcha filiallarni boshqarish</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Filial qo'shish</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
          : (branches || []).map((b) => (
              <div key={b.id} className="glass-card p-5 animate-slide-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{b.name}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {b.location}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Menejer: </span>
                    <span className="text-foreground font-medium">{b.manager_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Talabalar: </span>
                    <span className="text-foreground font-medium">{b.active_students}</span>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default BranchesPage;
