import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

import {
  transferenciaService,
  marketplaceService,
  Marketplace,
  Devolucao,
} from "@/services/api-routes";
import { getDevolucoesColumns } from "@/components/devolucoes/columns";
import { DevolucoesHeader } from "@/components/devolucoes/DevolucoesHeader";
import { DevolucoesStats } from "@/components/devolucoes/DevolucoesStats";

const Devolucoes = () => {
  const [devolucoes, setDevolucoes] = useState<Devolucao[]>([]);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevolucao, setEditingDevolucao] = useState<Devolucao | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devolucoesData, mktData] = await Promise.all([
        transferenciaService.getAllDevolucoes(),
        marketplaceService.getAll(),
      ]);
      setDevolucoes(devolucoesData || []);
      setMarketplaces(mktData || []);
    } catch (error) {
      toast.error("Erro ao carregar dados de devoluções.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDevolucoes = useMemo(() => {
    return devolucoes.filter((d) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (d.nfVenda && String(d.nfVenda).toLowerCase().includes(searchLower)) ||
        (d.loja && String(d.loja).toLowerCase().includes(searchLower));

      const matchesMarketplace =
        marketplaceFilter === "all" || d.venda?.marketplaceId === marketplaceFilter;
      
      const matchesStatus = 
        statusFilter.length === 0 || (d.venda?.status && statusFilter.includes(d.venda.status));

      let matchesDate = true;
      if (startDate || endDate) {
        const rawDate = d.data;
        if (!rawDate) {
          matchesDate = false;
        } else {
          const devolucaoDate = new Date(rawDate).setHours(0, 0, 0, 0);
          const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
          const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
          
          if (start && devolucaoDate < start) matchesDate = false;
          if (end && devolucaoDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesMarketplace && matchesStatus && matchesDate;
    });
  }, [devolucoes, search, marketplaceFilter, statusFilter, startDate, endDate]);

  const stats = useMemo(() => {
    const totalBase = filteredDevolucoes.reduce((acc, d) => acc + Number(d.valorBase || 0), 0);
    const totalValor = filteredDevolucoes.reduce((acc, d) => acc + Number(d.valor || 0), 0);
    const totalSaldo = filteredDevolucoes.reduce((acc, d) => acc + Number(d.saldo || 0), 0);

    return {
      count: filteredDevolucoes.length,
      totalBase,
      totalValor,
      totalSaldo,
    };
  }, [filteredDevolucoes]);

  const totalPages = Math.ceil(filteredDevolucoes.length / itemsPerPage);
  
  const paginatedDevolucoes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDevolucoes.slice(start, start + itemsPerPage);
  }, [filteredDevolucoes, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      if (i >= 1) pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, marketplaceFilter, statusFilter, startDate, endDate]);

  const handleEdit = (item: Devolucao) => {
    setEditingDevolucao(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta devolução?")) return;
    try {
      await transferenciaService.deleteDevolucao(id);
      toast.success("Excluída com sucesso.");
      fetchData();
    } catch {
      toast.error("Erro ao excluir.");
    }
  };

  const columns = getDevolucoesColumns(handleEdit, handleDelete);

  return (
    <AppLayout title="Gestão de Devoluções">
      <div className="space-y-6">
        <DevolucoesHeader
          search={search}
          onSearchChange={setSearch}
          marketplaceFilter={marketplaceFilter}
          onMarketplaceFilterChange={setMarketplaceFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClearFilters={() => {
            setSearch("");
            setMarketplaceFilter("all");
            setStatusFilter([]);
            setStartDate("");
            setEndDate("");
          }}
          marketplaces={marketplaces}
          onExportClick={() => {}}
        />

        <DevolucoesStats
          count={stats.count}
          totalBase={stats.totalBase}
          totalValor={stats.totalValor}
          totalSaldo={stats.totalSaldo}
        />

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col justify-center items-center gap-3">
              <Loader2 className="animate-spin text-slate-900 w-10 h-10" />
              <p className="text-slate-500 font-medium animate-pulse">Buscando devoluções...</p>
            </div>
          ) : (
            <>
              <DataTable 
                data={paginatedDevolucoes} 
                columns={columns} 
                emptyMessage={search ? "Nenhuma devolução encontrada." : "Nenhum dado registrado."}
              />
              
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <span className="text-sm text-slate-500 font-medium italic">
                  {filteredDevolucoes.length.toLocaleString('pt-BR')} registros no total
                </span>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-slate-200 text-slate-600 hover:bg-white"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-slate-200 text-slate-600 hover:bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex gap-1 mx-2">
                    {getPageNumbers().map((num) => (
                      <Button
                        key={num}
                        variant={currentPage === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(num)}
                        className={`h-8 w-8 p-0 text-xs font-semibold transition-all ${
                          currentPage === num 
                            ? "bg-slate-900 text-white border-slate-900 shadow-md scale-110" 
                            : "border-slate-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    className="h-8 w-8 p-0 border-slate-200 text-slate-600 hover:bg-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    className="h-8 w-8 p-0 border-slate-200 text-slate-600 hover:bg-white"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Devolucoes;