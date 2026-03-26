import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Upload,
  Loader2,
  AlertCircle,
  Download,
  XCircle,
  CheckCircle2,
  Clock,
  Receipt,
  SearchX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FretePreviewModal } from "@/components/ui/FreteModalPreview";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vendaService } from "@/services/api-routes";

interface VendaFrete {
  id: string;
  nf: string | number;
  loja: string;
  marketplaceId: string;
  fretePago: boolean;
  NumeroFatura?: string | null;
}

interface FreteError {
  nf: string;
  loja: string;
  fatura: string;
  motivo: "NÃO ENCONTRADO" | "JÁ PAGO" | "ERRO DESCONHECIDO";
}

const Frete = () => {
  const [vendas, setVendas] = useState<VendaFrete[]>([]);
  const [loading, setLoading] = useState(false);
  const [importErrors, setImportErrors] = useState<FreteError[]>([]);
  const [errorStoreFilter, setErrorStoreFilter] = useState<string>("all");
  const [searchNf, setSearchNf] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);

  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVendas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vendaService.getAllFrete(
        currentPage,
        itemsPerPage,
        searchNf.trim(),
        statusFilter
      );

      setVendas(response.data || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      toast.error("Erro ao carregar vendas de frete.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchNf, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchVendas();
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchVendas]);

  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchNf(val);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  const columns = [
    {
      key: "nf",
      header: () => <div className="text-left font-semibold text-slate-700">Nota Fiscal</div>,
      render: (v: any) => (
        <span className="font-medium font-mono text-slate-700 text-sm bg-slate-100 px-2 py-1 rounded border border-slate-200">
          #{v.nf || "S/N"}
        </span>
      ),
    },
    {
      key: "loja",
      header: () => <div className="text-left font-semibold text-slate-700">Loja</div>,
      render: (v: any) => (
        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
          {v.loja}
        </span>
      ),
    },
    {
      key: "NumeroFatura",
      header: () => <div className="text-left font-semibold text-slate-700">Fatura</div>,
      render: (v: any) => {
        const fatura = v.NumeroFatura;
        return fatura ? (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-md shadow-sm">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono font-bold text-slate-700 tracking-tight">
              {fatura}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full w-fit">
            <SearchX className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Aguardando
            </span>
          </div>
        );
      },
    },
    {
      key: "statusFrete",
      header: () => <div className="text-left font-semibold text-slate-700">Status do Frete</div>,
      render: (v: any) => {
        const isPago = v.fretePago;
        return (
          <Badge
            variant="outline"
            className={
              isPago
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 w-fit px-2.5 py-1"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 w-fit px-2.5 py-1"
            }
          >
            {isPago ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pago</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Pendente</span>
              </>
            )}
          </Badge>
        );
      },
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawData.length) {
          toast.warning("Planilha vazia.");
          return;
        }

        const processed = rawData.map((row: any) => ({
          nf: String(row.NOTA || row.NF || row.nf || "").trim(),
          fatura: String(row.FATURA || row.fatura || "").trim(),
          loja: String(row.LOJA || row.loja || "DESCONHECIDA").trim(),
        }));

        setPreviewData(processed);
      } catch (err) {
        toast.error("Erro ao ler planilha de frete.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    setImportErrors([]);

    try {
      const response = await vendaService.importFretes(previewData!);
      const { successCount, errors } = response;

      if (successCount > 0) {
        toast.success(`${successCount} faturas de frete processadas!`);
        setSearchNf("");
        setCurrentPage(1);
        await fetchVendas();
      }

      if (errors && errors.length > 0) {
        toast.error(`${errors.length} notas apresentaram problemas.`);
        setImportErrors(errors);
      }

      setPreviewData(null);
    } catch (error) {
      toast.error("Falha ao processar importação.");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportErrorsToCSV = () => {
    const filteredErrors = importErrors.filter(
      (err) => errorStoreFilter === "all" || err.loja === errorStoreFilter,
    );
    const ws = XLSX.utils.json_to_sheet(filteredErrors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Erros de Frete");
    XLSX.writeFile(wb, `Erros_Frete_${new Date().getTime()}.xlsx`);
  };

  return (
    <AppLayout title="Conciliação de Frete">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Gestão de Fretes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Visualize faturas pendentes ou importe planilhas para dar baixa.
            </p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={loading || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Importar Faturas (Excel)
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
          />
        </div>

        {importErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="p-4 bg-red-100 border-b border-red-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">
                  Atenção: {importErrors.length} notas não puderam ser processadas
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Select value={errorStoreFilter} onValueChange={setErrorStoreFilter}>
                  <SelectTrigger className="w-[180px] bg-white border-red-200 h-9">
                    <SelectValue placeholder="Filtrar por Loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Lojas</SelectItem>
                    {Array.from(new Set(importErrors.map((e) => e.loja))).map((loja) => (
                      <SelectItem key={loja} value={loja}>
                        {loja}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={exportErrorsToCSV} className="bg-white border-red-200 text-red-700 hover:bg-red-50 h-9">
                  <Download className="w-4 h-4 mr-2" /> Exportar Erros
                </Button>

                <Button variant="ghost" size="icon" onClick={() => setImportErrors([])} className="text-red-600 hover:bg-red-200 h-9 w-9">
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-0 overflow-auto max-h-[300px]">
              <table className="w-full text-sm text-left text-red-900">
                <thead className="text-xs uppercase bg-red-100/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Nota Fiscal</th>
                    <th className="px-6 py-3">Fatura</th>
                    <th className="px-6 py-3">Loja</th>
                    <th className="px-6 py-3">Motivo do Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {importErrors
                    .filter(err => errorStoreFilter === "all" || err.loja === errorStoreFilter)
                    .map((err, idx) => (
                    <tr key={idx} className="border-b border-red-100 bg-white">
                      <td className="px-6 py-3 font-medium">#{err.nf}</td>
                      <td className="px-6 py-3">{err.fatura}</td>
                      <td className="px-6 py-3">{err.loja}</td>
                      <td className="px-6 py-3">
                        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200">
                          {err.motivo}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Buscar por NF ou Fatura..."
            value={searchNf}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-xs bg-white"
          />
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Situação do Frete" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pagamento Pendente</SelectItem>
              <SelectItem value="pago">Frete Pago</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white border rounded-xl shadow-sm min-h-[400px] flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                <DataTable columns={columns} data={vendas} />
              </div>
              
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                <span className="text-sm text-slate-500 font-medium">
                  Total: {totalItems} registros | Página {currentPage} de {totalPages || 1}
                </span>
                
                {totalPages > 1 && (
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
                      disabled={currentPage >= totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {previewData && (
        <FretePreviewModal
          data={previewData}
          onClose={() => setPreviewData(null)}
          onConfirm={handleConfirmImport}
          loading={isProcessing}
        />
      )}
    </AppLayout>
  );
};

export default Frete;