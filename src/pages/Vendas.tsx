import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

import { ImportPreviewModal } from "@/components/vendas/ImportVendaModal";
import { StoreMappingModal } from "@/components/vendas/StoreMappingModal";
import { VendaModal } from "@/components/modals/VendaModal";

import {
  vendaService,
  marketplaceService,
  pagamentoService,
} from "@/services/api-routes";
import { getVendasColumns } from "@/components/vendas/columns";
import { VendasHeader } from "@/components/vendas/VendasHeader";
import { VendasStats } from "@/components/vendas/VendasStats";

const Vendas = () => {
  const [vendas, setVendas] = useState<any[]>([]);
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);

  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<any | null>(null);

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isPaymentImport, setIsPaymentImport] = useState(false);
  const [uniqueStores, setUniqueStores] = useState<string[]>([]);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vendasData, mktData] = await Promise.all([
        vendaService.getAll(),
        marketplaceService.getAll(),
      ]);
      setVendas(vendasData);
      setMarketplaces(mktData);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Lógica de Filtro ---
  const filteredVendas = useMemo(() => {
    return vendas.filter((v) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        v.nf.toLowerCase().includes(searchLower) || 
        (v.loja && v.loja.toLowerCase().includes(searchLower)) ||
        (v.marketplace?.titulo && v.marketplace.titulo.toLowerCase().includes(searchLower));
      
      const matchesMarketplace = marketplaceFilter === "all" || v.marketplaceId === marketplaceFilter;

      return matchesSearch && matchesMarketplace;
    });
  }, [vendas, search, marketplaceFilter]);

  // --- Lógica de Estatísticas (Cards) ---
  const stats = useMemo(() => {
    const totalPrevisto = filteredVendas.reduce((acc, v) => acc + Number(v.liquidoReceber), 0);
    
    // Soma o valor de todos os pagamentos das vendas filtradas
    const totalRecebido = filteredVendas.reduce((acc, v) => {
      const somaPagamentosVenda = v.pagamentos?.reduce((sum: number, p: any) => sum + Number(p.valor), 0) || 0;
      return acc + somaPagamentosVenda;
    }, 0);

    return {
      count: filteredVendas.length,
      totalPrevisto,
      totalRecebido
    };
  }, [filteredVendas]);

  const totalPages = Math.ceil(filteredVendas.length / itemsPerPage);
  
  const paginatedVendas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendas.slice(start, start + itemsPerPage);
  }, [filteredVendas, currentPage]);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const rawData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        if (!rawData.length) {
          toast.warning("Planilha vazia.");
          return;
        }

        const keys = Object.keys(rawData[0] as object).map((k) => k.trim().toUpperCase());
        const isPgto = keys.includes("PARCELA PAGA") || keys.includes("PARCELAS");
        setIsPaymentImport(isPgto);

        const parseNum = (v: any) => {
          if (typeof v === "number") return v;
          return parseFloat(String(v).replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
        };

        const mapped = rawData.map((item: any) => {
          const getVal = (name: string) =>
            item[Object.keys(item).find((k) => k.trim().toUpperCase() === name.toUpperCase()) || ""];

          if (isPgto) {
            return {
              nfVenda: String(getVal("NF") || ""),
              parcelaPaga: parseInt(String(getVal("Parcela paga") || "1")),
              numeroParcelas: parseInt(String(getVal("Parcelas") || "1")),
              valor: parseNum(getVal("Liquido a Receber")),
              nf: String(getVal("NF") || ""),
            };
          } else {
            return {
              nf: String(getVal("NF") || ""),
              loja: String(getVal("LOJA") || ""),
              baseIcms: parseNum(getVal("Base ICMS")),
              comissaoVenda: parseNum(getVal("Comissão S Venda")),
              comissaoFrete: parseNum(getVal("Comissão S FRETE")),
              desconto: parseNum(getVal("DESCONTO")),
              liquidoReceber: parseNum(getVal("LIQUIDO A RECEBER")),
              qtdParcelas: null,
            };
          }
        }).filter((i: any) => (i.nf || i.nfVenda) !== "");

        setPreviewData(mapped);
        setPreviewModalOpen(true);
        e.target.value = "";
      } catch (err) {
        toast.error("Erro ao ler arquivo.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFinalizeImport = async (mappings: any[]) => {
    setIsConfirmingImport(true);
    try {
      if (isPaymentImport) {
        const res = await pagamentoService.importBulk(previewData);
        toast.success(res.message);
      } else {
        const data = previewData.map((i) => ({
          ...i,
          marketplaceId: mappings.find((m) => m.storeName === i.loja)?.marketplaceId,
        }));
        const res = await vendaService.importBulk(data);
        toast.success(res.data.message);
      }

      setMappingModalOpen(false);
      setPreviewModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erro na importação.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleEdit = (item: any) => { setEditingVenda(item); setModalOpen(true); };
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      try {
        await vendaService.delete(id);
        toast.success("Venda excluída.");
        fetchData();
      } catch (error) { toast.error("Erro ao excluir."); }
    }
  };

  const columns = getVendasColumns(handleEdit, handleDelete);

  return (
    <AppLayout title="Gestão de Vendas">
      <div className="space-y-6">
        <VendasHeader
          search={search}
          onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
          marketplaceFilter={marketplaceFilter}
          onMarketplaceFilterChange={(val) => { setMarketplaceFilter(val); setCurrentPage(1); }}
          marketplaces={marketplaces}
          onManualClick={() => { setEditingVenda(null); setModalOpen(true); }}
          onImportExcel={handleImportExcel}
        />

        {/* COMPONENTE DE STATS ATUALIZADO */}
        <VendasStats 
          count={stats.count} 
          totalLiquido={stats.totalPrevisto} 
          totalRecebido={stats.totalRecebido}
        />

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : (
            <>
              <DataTable data={paginatedVendas} columns={columns} />
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ImportPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        data={previewData}
        loading={isConfirmingImport}
        onRemoveItem={(idx) => setPreviewData((prev) => prev.filter((_, i) => i !== idx))}
        onConfirm={() => {
          if (isPaymentImport) handleFinalizeImport([]);
          else {
            setUniqueStores([...new Set(previewData.map((i) => i.loja))]);
            setPreviewModalOpen(false);
            setMappingModalOpen(true);
          }
        }}
      />

      <StoreMappingModal
        open={mappingModalOpen}
        uniqueStores={uniqueStores}
        marketplaces={marketplaces}
        onConfirm={handleFinalizeImport}
        onCancel={() => { setMappingModalOpen(false); setPreviewModalOpen(true); }}
      />

      <VendaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={async (data: any) => {
          try {
            if (editingVenda) await vendaService.update(editingVenda.id, data);
            else await vendaService.create(data);
            setModalOpen(false);
            fetchData();
            toast.success("Salvo com sucesso!");
          } catch (e: any) { toast.error(e.message); }
        }}
        marketplaces={marketplaces}
        venda={editingVenda}
      />
    </AppLayout>
  );
};

export default Vendas;