import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/ui/PaginationControls';

const demoTeachers = [
  { id: '1', name: 'Jamshid Rahimov', phone: '+998901112233', spec: 'Nazariy dars', branch: 'Minor', courses: 3 },
  { id: '2', name: 'Gulnora Saidova', phone: '+998934445566', spec: 'Amaliy haydash', branch: 'Chorsu', courses: 5 },
  { id: '3', name: 'Farhod Umarov', phone: '+998957778899', spec: 'Amaliy haydash', branch: 'Novza', courses: 2 },
  { id: '4', name: 'Dilnoza Tursunova', phone: '+998911234567', spec: 'Nazariy dars', branch: 'Samarqand', courses: 4 },
];

const TeachersPage = () => {
  const [search, setSearch] = useState('');
  const filtered = demoTeachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.phone.includes(search)
  );
  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(filtered);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">O'qituvchilar</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} ta o'qituvchi</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> O'qituvchi qo'shish</Button>
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mutaxassisligi</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Filial</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Faol kurslar</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((t) => (
              <tr key={t.id} className="table-row-striped border-b border-border/50">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.spec}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.branch}</td>
                <td className="px-4 py-3 text-center">{t.courses}</td>
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
          <div className="py-12 text-center text-muted-foreground">O'qituvchilar topilmadi</div>
        )}
      </div>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default TeachersPage;
