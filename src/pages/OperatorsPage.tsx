import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/ui/PaginationControls';

const demoOperators = [
  { id: '1', name: 'Nilufar Abdullayeva', phone: '+998901234567', branch: 'Minor', status: 'Faol' },
  { id: '2', name: 'Aziz Karimov', phone: '+998937654321', branch: 'Chorsu', status: 'Faol' },
  { id: '3', name: 'Sherzod Toshmatov', phone: '+998945551122', branch: 'Novza', status: 'Nofaol' },
];

const OperatorsPage = () => {
  const [search, setSearch] = useState('');
  const filtered = demoOperators.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.phone.includes(search)
  );
  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(filtered);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Operatorlar</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} ta operator</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Operator qo'shish</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ism</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefon</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Filial</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Holati</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((o) => (
              <tr key={o.id} className="table-row-striped border-b border-border/50">
                <td className="px-4 py-3 font-medium">{o.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.branch}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${o.status === 'Faol' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">Operatorlar topilmadi</div>
        )}
      </div>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default OperatorsPage;
