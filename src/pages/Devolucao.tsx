import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
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

// Modais
import { OperationImportModal } from "@/components/vendas/OperationImportModal";
import { StoreMappingModal } from "@/components/vendas/StoreMappingModal";
import { DevolucaoModal } from "@/components/devolucoes/DevolucaoModal"; // Componente a ser criado

// Serviços e Colunas
import {
  transferenciaService, // Serviço específico para devoluções a ser criado
  marketplaceService,
} from "@/services/api-routes";
import { getDevolucoesColumns } from "@/components/devolucoes/columns"; // Colunas específicas
import { DevolucoesHeader } from "@/components/devolucoes/DevolucoesHeader"; // Header específico
import { DevolucoesStats } from "@/components/devolucoes/DevolucoesStats"; // Stats específicos

const Devolucoes = () => {
  // --- ESTADOS DE DADOS ---
  const [devolucoes, setDevolucoes] = useState<any[]>([]);
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE CONTROLE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- ESTADOS DE IMPORTAÇÃO ---
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);
  const [operationPreviewData, setOperationPreviewData] = useState<any[]>([]);

  // Controle de Modais
  const [operationModalOpen, setOperationModalOpen] = useState(false);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [uniqueStores, setUniqueStores] = useState<string[]>([]);

  // Modal de Edição/Criação Manual
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevolucao, setEditingDevolucao] = useState<any | null>(null);

  // --- FILTROS ---
  const [statusFilter, setStatusFilter] = useState("all"); // Pode ser adaptado para "Motivo" ou "Tratativa"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- CARREGAMENTO INICIAL ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [devolucoesData, mktData] = await Promise.all([
        transferenciaService.getAllDevolucoes(),
        marketplaceService.getAll(),
      ]);
      setDevolucoes(devolucoesData);
      setMarketplaces(mktData);
    } catch (error) {
      toast.error("Erro ao carregar dados de devoluções.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DE FILTRAGEM ---
  const filteredDevolucoes = useMemo(() => {
    return devolucoes.filter((d) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (d.nf && String(d.nf).toLowerCase().includes(searchLower)) ||
        (d.loja && String(d.loja).toLowerCase().includes(searchLower));

      const matchesMarketplace =
        marketplaceFilter === "all" || d.marketplaceId === marketplaceFilter;
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const devolucaoDate = new Date(d.dataVenda || d.data).setHours(0, 0, 0, 0);
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
        if (start && devolucaoDate < start) matchesDate = false;
        if (end && devolucaoDate > end) matchesDate = false;
      }
      return matchesSearch && matchesMarketplace && matchesStatus && matchesDate;
    });
  }, [devolucoes, search, marketplaceFilter, statusFilter, startDate, endDate]);

  // --- ESTATÍSTICAS ---
  const stats = useMemo(() => {
    const totalBase = filteredDevolucoes.reduce((acc, d) => acc + Number(d.base || 0), 0);
    const totalValor = filteredDevolucoes.reduce((acc, d) => acc + Number(d.valor || 0), 0);
    const totalSaldo = filteredDevolucoes.reduce((acc, d) => acc + Number(d.saldo || 0), 0);

    return {
      count: filteredDevolucoes.length,
      totalBase,
      totalValor,
      totalSaldo,
    };
  }, [filteredDevolucoes]);

  // --- PAGINAÇÃO ---
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

  // --- IMPORTAÇÃO DE EXCEL PARA DEVOLUÇÕES ---
  const handleTriggerImport = () => {
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
        fileInputRef.current.click();
      }
    }, 0);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        if (!rawData.length) {
          toast.warning("Planilha vazia.");
          return;
        }

        const parseNum = (v: any) => {
          if (typeof v === "number") return v;
          if (!v) return 0;
          return parseFloat(String(v).replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
        };

        const getVal = (item: any, possibleNames: string[]) => {
          const keys = Object.keys(item);
          for (const name of possibleNames) {
            const foundKey = keys.find((k) => k.trim().toUpperCase() === name.toUpperCase());
            if (foundKey) return item[foundKey];
          }
          return "";
        };

        // Mapeamento específico para Devoluções (baseado no código original)
        const mapped = rawData.map((item: any) => ({
          nf: String(getVal(item, ["NF", "NOTA"]) || "???").trim(),
          base: parseNum(getVal(item, ["BASE"])),
          devolucao: String(getVal(item, ["DEVOLUCAO", "DEVOLUÇÃO"]) || ""),
          valor: parseNum(getVal(item, ["VALOR"])),
          saldo: parseNum(getVal(item, ["SALDO"])),
          tratativa: getVal(item, ["TRATATIVA"]) || "",
          motivo: getVal(item, ["MOTIVO"]) || "",
          loja: String(getVal(item, ["LOJA"]) || "DESCONHECIDA").trim(),
        }));

        setOperationPreviewData(mapped);
        setOperationModalOpen(true);
      } catch (err) {
        toast.error("Erro ao ler arquivo.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- FLUXO DE MAPEAMENTO ---
  const handleMappingCancel = () => {
    setMappingModalOpen(false);
    setOperationModalOpen(true);
  };

  const handleMappingConfirm = async (mappings: any[]) => {
    setIsConfirmingImport(true);
    try {
      const payload = operationPreviewData.map((op) => ({
        ...op,
        marketplaceId: mappings.find((m) => m.storeName === op.loja)?.marketplaceId || null,
      }));

      await transferenciaService.importDevolucoes(payload); // Ajustar para a rota real de devoluções
      toast.success("Devoluções processadas com sucesso!");
      setMappingModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro ao processar devoluções.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  // --- CRUD HANDLERS ---
  const handleSaveDevolucao = async (data: any) => {
    try {
      if (editingDevolucao) {
        await transferenciaService.updateDevolucao(editingDevolucao.id, data);
        toast.success("Devolução atualizada!");
      } else {
        await transferenciaService.deleteDevolucao(data);
        toast.success("Devolução criada!");
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro ao salvar devolução.");
    }
  };

  const handleEdit = (item: any) => {
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
            setStatusFilter("all");
            setStartDate("");
            setEndDate("");
          }}
          marketplaces={marketplaces}
          onManualClick={() => {
            setEditingDevolucao(null);
            setModalOpen(true);
          }}
          onImportClick={handleTriggerImport}
        />

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleImportExcel}
        />

        <DevolucoesStats
          count={stats.count}
          totalBase={stats.totalBase}
          totalValor={stats.totalValor}
          totalSaldo={stats.totalSaldo}
        />

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                <DataTable data={paginatedDevolucoes} columns={columns} />
              </div>
              
              {/* Paginação */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                <span className="text-sm text-slate-500 font-medium">
                  {filteredDevolucoes.length} registros no total
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
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
                        className={`h-8 w-8 p-0 text-xs ${currentPage === num ? "bg-slate-900 text-white" : ""}`}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- MODAIS DE DEVOLUÇÃO --- */}
      <OperationImportModal
        open={operationModalOpen}
        onOpenChange={setOperationModalOpen}
        data={operationPreviewData}
        type="devolucao"
        loading={isConfirmingImport}
        onRemoveItem={(idx) =>
          setOperationPreviewData((prev) => prev.filter((_, i) => i !== idx))
        }
        onConfirm={() => {
          setUniqueStores([...new Set(operationPreviewData.map((i) => i.loja))]);
          setOperationModalOpen(false);
          setMappingModalOpen(true);
        }}
      />

      <StoreMappingModal
        open={mappingModalOpen}
        uniqueStores={uniqueStores}
        marketplaces={marketplaces}
        onConfirm={handleMappingConfirm} 
        onCancel={handleMappingCancel} 
      />

      {/* Modal para Adição Manual / Edição */}
      <DevolucaoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveDevolucao}
        devolucao={editingDevolucao}
      />
    </AppLayout>
  );
};

export default Devolucoes;