import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePayments, usePaymentSummary } from '@/services/paymentService';
import { useBranches } from '@/services/branchService';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, AlertTriangle, TrendingUp, Plus, Search } from 'lucide-react';

const formatMoney = (n: number) => new Intl.NumberFormat('uz-UZ').format(n) + " so'm";

const PaymentsPage = () => {
  const { isOwner, user } = useAuthStore();
  const [branchId, setBranchId] = useState<string | undefined>(isOwner() ? undefined : user?.branch_id || undefined);
  const [search, setSearch] = useState('');

  const { data: payments, isLoading } = usePayments(branchId);
  const { data: summary } = usePaymentSummary(branchId);
  const { data: branches } = useBranches();

  const filtered = payments?.filter((p) => p.student_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">To'lovlar</h1>
          <p className="text-sm text-muted-foreground">Barcha to'lovlarni boshqarish</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> To'lov qo'shish</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Jami yig'ilgan" value={formatMoney(summary?.total_collected || 0)} icon={<DollarSign className="h-5 w-5" />} />
        <SummaryCard title="Jami qarzdorlik" value={formatMoney(summary?.total_debt || 0)} icon={<AlertTriangle className="h-5 w-5" />} />
        {isOwner() && (
          <SummaryCard title="Bu oylik daromad" value={formatMoney(summary?.monthly_income || 0)} icon={<TrendingUp className="h-5 w-5" />} />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {isOwner() && (
          <Select value={branchId || 'all'} onValueChange={(v) => setBranchId(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue placeholder="Filial" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              {branches?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Talaba ismi..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Talaba</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Filial</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kurs</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Umumiy narx</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">To'langan</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qoldiq</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Turi</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sana</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50"><td colSpan={8} className="p-4"><Skeleton className="h-5" /></td></tr>
                  ))
                : filtered?.map((p) => (
                    <tr key={p.id} className="table-row-striped border-b border-border/50">
                      <td className="px-4 py-3 font-medium">{p.student_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.branch_name}</td>
                      <td className="px-4 py-3 text-xs">{p.course_type === 'tezkor' ? 'Tezkor' : 'Avto maktab'}</td>
                      <td className="px-4 py-3 text-right">{new Intl.NumberFormat('uz-UZ').format(p.total_price)}</td>
                      <td className="px-4 py-3 text-right text-success">{new Intl.NumberFormat('uz-UZ').format(p.amount_paid)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={p.remaining_debt > 0 ? 'text-destructive' : 'text-success'}>
                          {p.remaining_debt > 0 ? new Intl.NumberFormat('uz-UZ').format(p.remaining_debt) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs">{p.payment_method === 'naqd' ? 'Naqd' : 'Karta'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
