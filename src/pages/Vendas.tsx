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

import { ImportPreviewModal } from "@/components/vendas/ImportVendaModal";
import { StoreMappingModal } from "@/components/vendas/StoreMappingModal";
import { ExportVendasModal } from "@/components/modals/VendaModal";
import { PaymentImportModal } from "@/components/vendas/PaymentImportModal";
import { OperationImportModal } from "@/components/vendas/OperationImportModal";

import {
  vendaService,
  marketplaceService,
  pagamentoService,
  transferenciaService,
  Venda,
  VendaSummary,
} from "@/services/api-routes";
import { getVendasColumns } from "@/components/vendas/columns";
import { VendasHeader } from "@/components/vendas/VendasHeader";
import { VendasStats } from "@/components/vendas/VendasStats";
import { ManualOperationModal } from "@/components/vendas/ManualOperationModal";
import api from "@/services/api";

const Vendas = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<VendaSummary | null>(null);

  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");

  const [importType, setImportType] = useState<
    "venda" | "pagamento" | "reembolso" | "devolucao"
  >("venda");
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);
  const [pendingDataRepasse, setPendingDataRepasse] = useState<string>("");

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [paymentPreviewData, setPaymentPreviewData] = useState<any[]>([]);
  const [operationPreviewData, setOperationPreviewData] = useState<any[]>([]);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [operationModalOpen, setOperationModalOpen] = useState(false);
  const [manualOperationModalOpen, setManualOperationModalOpen] = useState<{
    open: boolean;
    type: "reembolso" | "devolucao";
    selectedVenda?: Venda;
  }>({
    open: false,
    type: "reembolso",
  });
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [uniqueStores, setUniqueStores] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // --- ALTERAÇÃO: statusFilter agora é um array ---
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      // Transformar o array de status em string separada por vírgula para a API (ex: PAGO,PENDENTE)
      const statusParam =
        statusFilter.length > 0 ? statusFilter.join(",") : undefined;

      const [vendasRes, mktData, summaryData] = await Promise.all([
        vendaService.getAll({
          page: currentPage,
          limit: itemsPerPage,
          dataInicio: startDate || undefined,
          dataFim: endDate || undefined,
          status: statusParam, // Enviando os múltiplos status para o back-end
          marketplaceId:
            marketplaceFilter !== "all" ? marketplaceFilter : undefined,
        }),
        marketplaceService.getAll(),
        vendaService.getSummary(startDate || undefined, endDate || undefined),
      ]);

      if (Array.isArray(vendasRes)) {
        setVendas(vendasRes);
        setTotalItems(summaryData?.vendasNoPeriodo || 0);
      } else {
        const res = vendasRes as any;
        setVendas(res.data || []);
        setTotalItems(res.total || 0);
      }

      setMarketplaces(mktData);
      setSummary(summaryData);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, startDate, endDate, statusFilter, marketplaceFilter]);

  const filteredVendas = useMemo(() => {
    return vendas.filter((v) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (v.nf && String(v.nf).toLowerCase().includes(searchLower)) ||
        (v.loja && String(v.loja).toLowerCase().includes(searchLower));

      const matchesMarketplace =
        marketplaceFilter === "all" || v.marketplaceId === marketplaceFilter;

      // --- ALTERAÇÃO: Lógica de filtro local para múltiplos status ---
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(v.status);

      return matchesSearch && matchesMarketplace && matchesStatus;
    });
  }, [vendas, search, marketplaceFilter, statusFilter]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
          if (!serial) return "";
          if (typeof serial === "string") return serial.trim();

          // 1. Converte o serial para data base (Meia-noite UTC)
          const date = new Date(Math.round((serial - 25569) * 86400 * 1000));

          // 2. Extrai os componentes UTC puros
          const dia = date.getUTCDate();
          const mes = date.getUTCMonth(); // Janeiro é 0
          const ano = date.getUTCFullYear();

          // 3. Cria um novo objeto Date forçando 08:00 da manhã
          // Usamos Date.UTC para que o payload enviado seja consistente
          const dataFinal = new Date(Date.UTC(ano, mes, dia, 8, 0, 0));

          return dataFinal.toISOString();
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
          const mapped = rawData.map((item: any) => {
            const rawValue = getVal(item, ["DATA"]);
            let dataISO = "";

            if (typeof rawValue === "number") {
              // Se for número serial (Ex: 46023)
              dataISO = excelDateToJS(rawValue);
            } else if (typeof rawValue === "string") {
              // Se for string "01/01/2026", quebramos manualmente pra não usar o fuso local
              const [d, m, y] = rawValue.split("/").map(Number);
              dataISO = new Date(Date.UTC(y, m - 1, d, 8, 0, 0)).toISOString();
            }

            return {
              nf: String(getVal(item, ["NF", "NOTA", "DOC"]) || "???").trim(),
              loja: String(
                getVal(item, ["LOJA", "CLIENTE"]) || "LOJA PADRÃO",
              ).trim(),
              baseIcms: parseNum(getVal(item, ["BASE ICMS", "VALOR"])),
              dataVenda: dataISO, // Aqui vai o "2026-01-01T08:00:00.000Z"
            };
          });
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
            frete_e_taxas: parseNum(getVal(item, ["FRETES E TARIFAS"])),
            baseIcms: parseNum(getVal(item, ["BASE ICMS"])),
            parcelaPaga: parseInt(String(getVal(item, ["PARCELA PAGA"]))) || 1,
            parcelas: parseInt(String(getVal(item, ["PARCELAS"]))) || 1,
          }));
          setPaymentPreviewData(mapped);
          setPaymentModalOpen(true);
        } else if (importType === "reembolso") {
          const mapped = rawData.map((item: any) => ({
            nota: String(getVal(item, ["NOTA", "NF"]) || "???").trim(),
            parcelaPaga: parseInt(String(getVal(item, ["PARCELA PAGA"]))) || 1,
            parcelas: parseInt(String(getVal(item, ["PARCELAS"]))) || 1,
            repasse: parseNum(getVal(item, ["REPASSE"])),
            comissaoVenda: parseNum(
              getVal(item, ["COMISSAO VENDA", "COMISSÃO VENDA"]),
            ),
            comissaoFrete: parseNum(
              getVal(item, ["COMISSAO FRETE", "COMISSÃO FRETE"]),
            ),
            baseIcms: parseNum(getVal(item, ["BASE ICMS"])),
            loja: String(getVal(item, ["LOJA"]) || "DESCONHECIDA").trim(),
          }));
          setOperationPreviewData(mapped);
          setOperationModalOpen(true);
        } else if (importType === "devolucao") {
          const mapped = rawData.map((item: any) => ({
            nf: String(getVal(item, ["NF", "NOTA"]) || "???").trim(),
            baseIcms: parseNum(getVal(item, ["BASE", "BASE ICMS"])),
            devolucao: String(getVal(item, ["DEVOLUCAO", "DEVOLUÇÃO"]) || ""),
            valor: parseNum(getVal(item, ["VALOR"])),
            saldo: parseNum(getVal(item, ["SALDO"])),
            tratativa: String(getVal(item, ["TRATATIVA"]) || ""),
            motivo: String(getVal(item, ["MOTIVO"]) || ""),
            loja: String(getVal(item, ["LOJA"]) || "DESCONHECIDA").trim(),
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

  const handleMappingCancel = () => {
    setMappingModalOpen(false);
    if (importType === "venda") setPreviewModalOpen(true);
    else if (importType === "pagamento") setPaymentModalOpen(true);
    else setOperationModalOpen(true);
  };

  const handleMappingConfirm = (mappings: any[]) => {
    if (importType === "venda") handleFinalizeImportVenda(mappings);
    else if (importType === "pagamento")
      handleFinalizeImportPagamento(mappings);
    else handleFinalizeOperation(mappings);
  };

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
      toast.error("Erro na importação de vendas.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleFinalizeImportPagamento = async (mappings: any[]) => {
    setIsConfirmingImport(true);
    try {
      const dadosFormatados = paymentPreviewData.map((pagamento) => ({
        ...pagamento,
        data: pendingDataRepasse,
        marketplaceId:
          mappings.find((m) => m.storeName === pagamento.loja)?.marketplaceId ||
          null,
      }));
      await pagamentoService.importBulk(dadosFormatados);
      toast.success("Pagamentos salvos!");
      setMappingModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro nos pagamentos.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleFinalizeOperation = async (mappings: any[]) => {
    setIsConfirmingImport(true);
    try {
      const payload = operationPreviewData.map((op) => ({
        ...op,
        data: pendingDataRepasse,
        marketplaceId:
          mappings.find((m) => m.storeName === op.loja)?.marketplaceId || null,
      }));
      const service =
        importType === "reembolso"
          ? transferenciaService.importReembolsos
          : transferenciaService.importDevolucoes;
      await service(payload);
      toast.success(
        `${importType === "reembolso" ? "Reembolsos" : "Devoluções"} processados!`,
      );
      setMappingModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro ao processar operação.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleExportCSV = async (filters: any) => {
    try {
      const dataToExport = await vendaService.getExportData({
        startDate: filters.startDate,
        endDate: filters.endDate,
        marketplaceId: filters.marketplaceId,
        status: filters.status,
      });

      if (!dataToExport || dataToExport.length === 0) {
        toast.warning("Nenhum dado encontrado para os filtros selecionados.");
        return;
      }

      const worksheetData = dataToExport.map((v) => ({
        "Data da Venda": new Date(v.dataVenda).toLocaleDateString("pt-BR"),
        "Nota Fiscal": v.nf,
        Loja: v.loja,
        Marketplace: v.marketplace?.titulo || "N/A",
        "Base ICMS (R$)": v.baseIcms,
        "Comissão Total (R$)":
          Number(v.comissaoVenda || 0) + Number(v.comissaoFrete || 0),
        "Taxas/Frete (R$)": v.frete_e_taxas || 0,
        Status: v.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const columnWidths = [
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
      ];
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");
      XLSX.writeFile(workbook, `Relatorio_Vendas_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error("[EXPORT_ERROR]:", error);
      throw error;
    }
  };

  const handleEdit = (item: any) => {
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

  const columns = getVendasColumns(
    handleEdit,
    handleDelete,
    (item) =>
      setManualOperationModalOpen({
        open: true,
        type: "reembolso",
        selectedVenda: item,
      }),
    (item) =>
      setManualOperationModalOpen({
        open: true,
        type: "devolucao",
        selectedVenda: item,
      }),
  );

  return (
    <AppLayout title="Gestão de Vendas">
      <div className="space-y-6">
        <VendasHeader
          search={search}
          onSearchChange={setSearch}
          marketplaceFilter={marketplaceFilter}
          onMarketplaceFilterChange={setMarketplaceFilter}
          // --- Passando estados novos ---
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClearFilters={() => {
            setSearch("");
            setMarketplaceFilter("all");
            setStatusFilter([]); // Limpa para array vazio
            setStartDate("");
            setEndDate("");
          }}
          marketplaces={marketplaces}
          onManualClick={() => setModalOpen(true)}
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
          count={summary?.vendasNoPeriodo || 0}
          totalLiquido={summary?.receitaBruta || 0}
          totalRecebido={summary?.receitaRecebida || 0}
          totalTaxas={summary ? summary.comissoesDescontadas : 0}
          faltaReceber={summary?.faltaReceber || 0}
          freteETaxas={summary?.fretesETarifas || 0}
        />

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                <DataTable data={filteredVendas} columns={columns} />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                <span className="text-sm text-slate-500 font-medium">
                  {totalItems} registros no total
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

      <ImportPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        data={previewData}
        loading={isConfirmingImport}
        onRemoveItem={(idx) =>
          setPreviewData((prev) => prev.filter((_, i) => i !== idx))
        }
        onConfirm={() => {
          setUniqueStores([...new Set(previewData.map((i) => i.loja))]);
          setPreviewModalOpen(false);
          setMappingModalOpen(true);
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
        onConfirm={(dataRepasse) => {
          if (!dataRepasse) {
            toast.error("Por favor, selecione a data do repasse.");
            return;
          }
          setPendingDataRepasse(dataRepasse);
          setUniqueStores([...new Set(paymentPreviewData.map((i) => i.loja))]);
          setPaymentModalOpen(false);
          setMappingModalOpen(true);
        }}
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
        onConfirm={(dataRepasse) => {
          setPendingDataRepasse(dataRepasse);
          setUniqueStores([
            ...new Set(operationPreviewData.map((i) => i.loja)),
          ]);
          setOperationModalOpen(false);
          setMappingModalOpen(true);
        }}
      />

      <ManualOperationModal
        open={manualOperationModalOpen.open}
        type={manualOperationModalOpen.type}
        onOpenChange={(open) =>
          setManualOperationModalOpen((prev) => ({ ...prev, open }))
        }
        defaultData={manualOperationModalOpen.selectedVenda}
        onSubmit={async (data) => {
          const isRefund = manualOperationModalOpen.type === "reembolso";
          const endpoint = isRefund
            ? "/transferencias/reembolsos/manual"
            : "/transferencias/devolucoes/manual";

          await api.post(endpoint, {
            ...data,
            vendaId: manualOperationModalOpen.selectedVenda?.id,
          });
        }}
      />

      <StoreMappingModal
        open={mappingModalOpen}
        uniqueStores={uniqueStores}
        marketplaces={marketplaces}
        onConfirm={handleMappingConfirm}
        onCancel={handleMappingCancel}
      />

      <ExportVendasModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onExport={handleExportCSV}
        marketplaces={marketplaces}
      />
    </AppLayout>
  );
};

export default Vendas;
