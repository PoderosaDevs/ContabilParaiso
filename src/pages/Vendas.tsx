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
import { ImportPreviewModal } from "@/components/vendas/ImportVendaModal";
import { StoreMappingModal } from "@/components/vendas/StoreMappingModal";
import { VendaModal } from "@/components/modals/VendaModal";
import { PaymentImportModal } from "@/components/vendas/PaymentImportModal";
import { OperationImportModal } from "@/components/vendas/OperationImportModal";

// Serviços e Colunas
import {
  vendaService,
  marketplaceService,
  pagamentoService,
} from "@/services/api-routes";
import { getVendasColumns } from "@/components/vendas/columns";
import { VendasHeader } from "@/components/vendas/VendasHeader";
import { VendasStats } from "@/components/vendas/VendasStats";

const Vendas = () => {
  // --- ESTADOS DE DADOS ---
  const [vendas, setVendas] = useState<any[]>([]);
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE CONTROLE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- ESTADOS DE IMPORTAÇÃO ---
  const [importType, setImportType] = useState<
    "venda" | "pagamento" | "reembolso" | "devolucao"
  >("venda");
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);

  // Dados de Preview
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [paymentPreviewData, setPaymentPreviewData] = useState<any[]>([]);
  const [operationPreviewData, setOperationPreviewData] = useState<any[]>([]);

  // Controle de Modais
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [operationModalOpen, setOperationModalOpen] = useState(false);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [uniqueStores, setUniqueStores] = useState<string[]>([]);

  // Modal de Edição/Criação Manual
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<any | null>(null);

  // --- FILTROS ---
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- CARREGAMENTO INICIAL ---
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

  // --- LÓGICA DE FILTRAGEM ---
  const filteredVendas = useMemo(() => {
    return vendas.filter((v) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (v.nf && String(v.nf).toLowerCase().includes(searchLower)) ||
        (v.loja && String(v.loja).toLowerCase().includes(searchLower));

      const matchesMarketplace =
        marketplaceFilter === "all" || v.marketplaceId === marketplaceFilter;
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const vendaDate = new Date(v.dataVenda).setHours(0, 0, 0, 0);
        const start = startDate
          ? new Date(startDate).setHours(0, 0, 0, 0)
          : null;
        const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
        if (start && vendaDate < start) matchesDate = false;
        if (end && vendaDate > end) matchesDate = false;
      }
      return (
        matchesSearch && matchesMarketplace && matchesStatus && matchesDate
      );
    });
  }, [vendas, search, marketplaceFilter, statusFilter, startDate, endDate]);

  // --- ESTATÍSTICAS ---
  const stats = useMemo(() => {
    // 1. Total Base ICMS (Receita Prevista)
    const totalBaseIcms = filteredVendas.reduce(
      (acc, v) => acc + Number(v.baseIcms || 0),
      0,
    );

    // 2. Total Recebido (Soma dos pagamentos vinculados)
    const totalRecebido = filteredVendas.reduce((acc, v) => {
      const pagos =
        v.pagamentos?.reduce(
          (pAcc: number, p: any) => pAcc + Number(p.valor),
          0,
        ) || 0;
      return acc + pagos;
    }, 0);

    // 3. Total de Taxas (Soma de Comissão Venda + Comissão Frete)
    const totalTaxas = filteredVendas.reduce((acc, v) => {
      const taxas = Number(v.comissaoVenda || 0) + Number(v.comissaoFrete || 0);
      return acc + taxas;
    }, 0);

    return {
      count: filteredVendas.length,
      totalBaseIcms,
      totalRecebido,
      totalTaxas, // Novo campo para o seu VendasStats
    };
  }, [filteredVendas]);

  // --- PAGINAÇÃO ---
  const totalPages = Math.ceil(filteredVendas.length / itemsPerPage);
  const paginatedVendas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendas.slice(start, start + itemsPerPage);
  }, [filteredVendas, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons)
      startPage = Math.max(1, endPage - maxButtons + 1);
    for (let i = startPage; i <= endPage; i++) {
      if (i >= 1) pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, marketplaceFilter, statusFilter, startDate, endDate]);

  // --- IMPORTAÇÃO ---
  const handleTriggerImport = (
    type: "venda" | "pagamento" | "reembolso" | "devolucao",
  ) => {
    setImportType(type);
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

        const excelDateToJS = (serial: any) => {
          if (!serial) return new Date().toISOString();
          if (typeof serial === "string") return serial;
          const date = new Date(Math.floor(serial - 25569) * 86400 * 1000);
          return date.toLocaleDateString("pt-BR");
        };

        const parseNum = (v: any) => {
          if (typeof v === "number") return v;
          if (!v) return 0;
          return (
            parseFloat(
              String(v)
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim(),
            ) || 0
          );
        };

        const getVal = (item: any, possibleNames: string[]) => {
          const keys = Object.keys(item);
          for (const name of possibleNames) {
            const foundKey = keys.find(
              (k) => k.trim().toUpperCase() === name.toUpperCase(),
            );
            if (foundKey) return item[foundKey];
          }
          return "";
        };

        if (importType === "venda") {
          const mapped = rawData.map((item: any) => ({
            nf: String(getVal(item, ["NF", "NOTA", "DOC"]) || "???").trim(),
            loja: String(
              getVal(item, ["LOJA", "CLIENTE"]) || "LOJA PADRÃO",
            ).trim(),
            baseIcms: parseNum(getVal(item, ["BASE ICMS", "VALOR"])),
            dataVenda:
              typeof getVal(item, ["DATA"]) === "number"
                ? excelDateToJS(getVal(item, ["DATA"]))
                : getVal(item, ["DATA"]),
          }));
          setPreviewData(mapped);
          setPreviewModalOpen(true);
        } else if (importType === "pagamento") {
          const mapped = rawData.map((item: any) => ({
            nota: String(getVal(item, ["NOTA", "NF"]) || "???").trim(),
            loja: String(
              getVal(item, ["LOJA", "CLIENTE"]) || "DESCONHECIDA",
            ).trim(),
            repasse: parseNum(getVal(item, ["REPASSE", "VALOR", "LIQUIDO"])),
            comissaoVenda: parseNum(getVal(item, ["COMISSÃO VENDA"])),
            comissaoFrete: parseNum(getVal(item, ["COMISSÃO FRETE"])),
            baseIcms: parseNum(getVal(item, ["BASE ICMS"])),
            parcelaPaga: parseInt(String(getVal(item, ["PARCELA PAGA"]))) || 1,
            parcelas: parseInt(String(getVal(item, ["PARCELAS"]))) || 1,
          }));
          setPaymentPreviewData(mapped);
          setPaymentModalOpen(true);
        } else if (importType === "reembolso" || importType === "devolucao") {
          const mapped = rawData.map((item: any) => ({
            nota: String(getVal(item, ["NOTA", "NF"]) || "???").trim(),
            loja: String(
              getVal(item, ["LOJA", "CLIENTE"]) || "DESCONHECIDA",
            ).trim(),
            data:
              typeof getVal(item, ["DATA"]) === "number"
                ? excelDateToJS(getVal(item, ["DATA"]))
                : getVal(item, ["DATA"]),
            valor: parseNum(
              getVal(item, ["VALOR", "TOTAL", "DEVOLUCAO", "REEMBOLSO"]),
            ),
            motivo: parseInt(String(getVal(item, ["MOTIVO", "ID"]))) || 16,
          }));
          setOperationPreviewData(mapped);
          setOperationModalOpen(true);
        }
      } catch (err) {
        toast.error("Erro ao ler arquivo.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- FINALIZAÇÃO ---
  const handleFinalizeImportVenda = async (mappings: any[]) => {
    setIsConfirmingImport(true);
    try {
      const payload = previewData.map((item) => ({
        ...item,
        marketplaceId:
          mappings.find((m) => m.storeName === item.loja)?.marketplaceId ||
          null,
      }));
      await vendaService.importBulk(payload);
      toast.success("Vendas importadas!");
      setMappingModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro na importação.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleFinalizeImportPagamento = async () => {
    setIsConfirmingImport(true);
    try {
      await pagamentoService.importBulk(paymentPreviewData);
      toast.success("Pagamentos salvos!");
      setPaymentModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro nos pagamentos.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleFinalizeOperation = async () => {
    setIsConfirmingImport(true);
    try {
      const service =
        importType === "reembolso"
          ? vendaService.importRefunds
          : vendaService.importReturns;
      await service(operationPreviewData);
      toast.success(
        `${importType === "reembolso" ? "Reembolsos" : "Devoluções"} processados!`,
      );
      setOperationModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro ao processar operação.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  // --- CRUD HANDLERS ---
  const handleSaveVenda = async (data: any) => {
    try {
      if (editingVenda) {
        await vendaService.update(editingVenda.id, data);
        toast.success("Venda atualizada!");
      } else {
        await vendaService.create(data);
        toast.success("Venda criada!");
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro ao salvar.");
    }
  };

  const handleEdit = (item: any) => {
    setEditingVenda(item);
    setModalOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta venda?")) return;
    try {
      await vendaService.delete(id);
      toast.success("Excluída");
      fetchData();
    } catch {
      toast.error("Erro");
    }
  };

  const columns = getVendasColumns(handleEdit, handleDelete);

  return (
    <AppLayout title="Gestão de Vendas">
      <div className="space-y-6">
        <VendasHeader
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
            setEditingVenda(null);
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

        <VendasStats
          count={stats.count}
          totalLiquido={stats.totalBaseIcms}
          totalRecebido={stats.totalRecebido}
          totalTaxas={stats.totalTaxas}
        />

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                <DataTable data={paginatedVendas} columns={columns} />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                <span className="text-sm text-slate-500 font-medium">
                  {filteredVendas.length} registros no total
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
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

      {/* --- MODAIS --- */}
      <ImportPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        data={previewData}
        loading={isConfirmingImport} // Corrigido: Prop loading adicionada
        onRemoveItem={(idx) =>
          setPreviewData((prev) => prev.filter((_, i) => i !== idx))
        }
        onConfirm={() => {
          setUniqueStores([...new Set(previewData.map((i) => i.loja))]);
          setPreviewModalOpen(false);
          setMappingModalOpen(true);
        }}
      />

      <StoreMappingModal
        open={mappingModalOpen}
        uniqueStores={uniqueStores}
        marketplaces={marketplaces}
        onConfirm={handleFinalizeImportVenda}
        onCancel={() => {
          setMappingModalOpen(false);
          setPreviewModalOpen(true);
        }}
      />

      <PaymentImportModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        data={paymentPreviewData}
        loading={isConfirmingImport}
        onRemoveItem={(idx) =>
          setPaymentPreviewData((prev) => prev.filter((_, i) => i !== idx))
        }
        onConfirm={handleFinalizeImportPagamento}
      />

      <OperationImportModal
        open={operationModalOpen}
        onOpenChange={setOperationModalOpen}
        data={operationPreviewData}
        type={importType === "reembolso" ? "reembolso" : "devolucao"}
        loading={isConfirmingImport}
        onRemoveItem={(idx) =>
          setOperationPreviewData((prev) => prev.filter((_, i) => i !== idx))
        }
        onConfirm={handleFinalizeOperation}
      />

      <VendaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveVenda}
        venda={editingVenda}
      />
    </AppLayout>
  );
};

export default Vendas;
