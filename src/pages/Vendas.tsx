import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

// Modais
import { ImportPreviewModal } from "@/components/vendas/ImportVendaModal";
import { StoreMappingModal } from "@/components/vendas/StoreMappingModal";
import { VendaModal } from "@/components/modals/VendaModal";
import { PaymentImportModal } from "@/components/vendas/PaymentImportModal"; // Certifique-se do caminho correto

// Serviços e Colunas
import { vendaService, marketplaceService, pagamentoService } from "@/services/api-routes";
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
  const [importType, setImportType] = useState<'venda' | 'pagamento'>('venda');
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);
  
  // Dados de Preview
  const [previewData, setPreviewData] = useState<any[]>([]); // Vendas
  const [paymentPreviewData, setPaymentPreviewData] = useState<any[]>([]); // Pagamentos

  // Modais
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [uniqueStores, setUniqueStores] = useState<string[]>([]);

  // Modal de Edição/Criação Manual
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<any | null>(null);

  // --- NOVOS ESTADOS DE FILTRO ---
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

// --- LÓGICA DE FILTRAGEM ATUALIZADA ---
  const filteredVendas = useMemo(() => {
    return vendas.filter((v) => {
      // 1. Busca Texto
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (v.nf && String(v.nf).toLowerCase().includes(searchLower)) ||
        (v.loja && String(v.loja).toLowerCase().includes(searchLower));

      // 2. Filtro Marketplace
      const matchesMarketplace =
        marketplaceFilter === "all" || v.marketplaceId === marketplaceFilter;
      
      // 3. Filtro Status
      const matchesStatus = 
        statusFilter === "all" || v.status === statusFilter;

      // 4. Filtro Data (Início e Fim)
      let matchesDate = true;
      if (startDate || endDate) {
          const vendaDate = new Date(v.dataVenda).setHours(0,0,0,0);
          const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
          const end = endDate ? new Date(endDate).setHours(0,0,0,0) : null;

          if (start && vendaDate < start) matchesDate = false;
          if (end && vendaDate > end) matchesDate = false;
      }

      return matchesSearch && matchesMarketplace && matchesStatus && matchesDate;
    });
  }, [vendas, search, marketplaceFilter, statusFilter, startDate, endDate]);

  // --- ESTATÍSTICAS (Baseadas no filtro atual) ---
  const stats = useMemo(() => {
    const totalBaseIcms = filteredVendas.reduce((acc, v) => acc + Number(v.baseIcms || 0), 0);
    
    // Calcula o total realmente recebido (soma dos pagamentos vinculados)
    const totalRecebido = filteredVendas.reduce((acc, v) => {
        const pagos = v.pagamentos?.reduce((pAcc: number, p: any) => pAcc + Number(p.valor), 0) || 0;
        return acc + pagos;
    }, 0);

    return { count: filteredVendas.length, totalBaseIcms, totalRecebido };
  }, [filteredVendas]);

  // --- PAGINAÇÃO (Client-Side) ---
  const totalPages = Math.ceil(filteredVendas.length / itemsPerPage);
  
  const paginatedVendas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendas.slice(start, start + itemsPerPage);
  }, [filteredVendas, currentPage, itemsPerPage]);

  // Reseta para página 1 se filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [search, marketplaceFilter]);


  // --- TRIGGER DO INPUT DE ARQUIVO ---
  const handleTriggerImport = (type: 'venda' | 'pagamento') => {
    setImportType(type);
    setTimeout(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
            fileInputRef.current.click();
        }
    }, 0);
  };

  // --- LEITURA DO EXCEL ---
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

        // --- Helpers de Parsing ---
        const excelDateToJS = (serial: any) => {
           if (!serial) return new Date().toISOString();
           if (typeof serial === 'string') return serial;
           const utc_days  = Math.floor(serial - 25569);
           const utc_value = utc_days * 86400;                                        
           const date_info = new Date(utc_value * 1000);
           return date_info.toISOString();
        }

        const parseNum = (v: any) => {
          if (typeof v === "number") return v;
          if (!v) return 0;
          return parseFloat(String(v).replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
        };

        const getVal = (item: any, possibleNames: string[]) => {
            const keys = Object.keys(item);
            for (const name of possibleNames) {
              const foundKey = keys.find(k => k.trim().toUpperCase() === name.toUpperCase());
              if (foundKey) return item[foundKey];
            }
            return "";
        };

        // --- LÓGICA DE DECISÃO (VENDA vs PAGAMENTO) ---
        if (importType === 'venda') {
            const mapped = rawData.map((item: any) => {
                const rawNf = getVal(item, ["NF", "NOTA", "NOTA FISCAL", "NUMERO", "DOC"]);
                const rawLoja = getVal(item, ["LOJA", "CLIENTE", "NOME LOJA"]) || "LOJA PADRÃO";
                const rawBase = getVal(item, ["BASE ICMS", "VALOR", "VLR CONTABIL"]);
                const rawDataVenda = getVal(item, ["DATA", "DATA VENDA", "EMISSAO"]);

                return {
                    nf: rawNf ? String(rawNf).trim() : "???",
                    loja: String(rawLoja).trim(),
                    baseIcms: parseNum(rawBase),
                    dataVenda: typeof rawDataVenda === 'number' ? excelDateToJS(rawDataVenda) : rawDataVenda,
                };
            }).filter((i: any) => i.baseIcms > 0 || i.nf !== "???");

            setPreviewData(mapped);
            setPreviewModalOpen(true);

        } else {
            // Importação de Pagamentos
            const mapped = rawData.map((item: any) => {
                const nota = getVal(item, ["NOTA", "NF", "NUMERO"]);
                const parcelaPaga = getVal(item, ["PARCELA PAGA", "PARC PAGA"]);
                const parcelas = getVal(item, ["PARCELAS", "TOTAL PARCELAS", "QTD PARC"]);
                const repasse = getVal(item, ["REPASSE", "VALOR REPASSE", "LIQUIDO"]);
                const comissaoVenda = getVal(item, ["COMISSÃO VENDA", "COMISSAO VENDA"]);
                const comissaoFrete = getVal(item, ["COMISSÃO FRETE", "COMISSAO FRETE"]);
                const baseIcms = getVal(item, ["BASE ICMS", "BASE DE CALCULO"]);
                const loja = getVal(item, ["LOJA", "CLIENTE"]);

                return {
                    nota: nota ? String(nota).trim() : "???",
                    loja: loja ? String(loja).trim() : "DESCONHECIDO",
                    parcelaPaga: parseInt(String(parcelaPaga)) || 1,
                    parcelas: parseInt(String(parcelas)) || 1,
                    repasse: parseNum(repasse),
                    comissaoVenda: parseNum(comissaoVenda),
                    comissaoFrete: parseNum(comissaoFrete),
                    baseIcms: parseNum(baseIcms),
                };
            }).filter((i: any) => i.repasse > 0 || i.nota !== "???");

            setPaymentPreviewData(mapped);
            setPaymentModalOpen(true);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao ler arquivo. Verifique o formato.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- CONFIRMAR IMPORTAÇÃO VENDAS ---
  const handleFinalizeImportVenda = async (mappings: any[]) => {
    setIsConfirmingImport(true);
    try {
      const payload = previewData.map((item) => {
        const mapping = mappings.find((m) => m.storeName === item.loja);
        return {
          ...item,
          marketplaceId: mapping?.marketplaceId || null, 
        };
      });

      const res = await vendaService.importBulk(payload);
      toast.success(res.message || "Importação de Vendas concluída");
      
      setMappingModalOpen(false);
      setPreviewModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erro na importação.");
    } finally {
      setIsConfirmingImport(false);
    }
  };

  // --- CONFIRMAR IMPORTAÇÃO PAGAMENTOS ---
  const handleFinalizeImportPagamento = async () => {
    setIsConfirmingImport(true);
    try {
      const res = await pagamentoService.importBulk(paymentPreviewData);
      
      const msg = res.message || `${paymentPreviewData.length} pagamentos processados!`;
      toast.success(msg);
      
      setPaymentModalOpen(false);
      setPaymentPreviewData([]); 
      await fetchData(); 

    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Erro ao salvar pagamentos.";
      toast.error(errorMsg);
    } finally {
      setIsConfirmingImport(false);
    }
  };

  // --- CRUD HANDLERS ---
  const handleEdit = (item: any) => {
    setEditingVenda(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir esta venda e seus pagamentos?")) return;
    try {
        await vendaService.delete(id);
        toast.success("Venda excluída com sucesso");
        fetchData();
    } catch (error: any) {
        toast.error("Erro ao excluir venda");
    }
  };

  const handleSaveVenda = async (data: any) => {
    try {
        if (editingVenda) {
           await vendaService.update(editingVenda.id, data);
           toast.success("Venda atualizada!");
        } else {
           await vendaService.create(data);
           toast.success("Venda criada com sucesso!");
        }
        setModalOpen(false);
        fetchData();
    } catch (e: any) {
        toast.error(e.message || "Erro ao salvar venda.");
    }
  };

  // Função para limpar filtros
  const clearFilters = () => {
      setSearch("");
      setMarketplaceFilter("all");
      setStatusFilter("all");
      setStartDate("");
      setEndDate("");
      setCurrentPage(1);
  };

  // Definição das colunas da tabela
  const columns = getVendasColumns(handleEdit, handleDelete);

  return (
    <AppLayout title="Gestão de Vendas">
      <div className="space-y-6">
        {/* HEADER: Busca, Filtros e Botões de Ação */}
        <VendasHeader
          search={search}
          onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
          
          marketplaceFilter={marketplaceFilter}
          onMarketplaceFilterChange={(val) => { setMarketplaceFilter(val); setCurrentPage(1); }}
          
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          
          startDate={startDate}
          onStartDateChange={(val) => { setStartDate(val); setCurrentPage(1); }}
          endDate={endDate}
          onEndDateChange={(val) => { setEndDate(val); setCurrentPage(1); }}
          
          onClearFilters={clearFilters}
          
          marketplaces={marketplaces}
          onManualClick={() => { setEditingVenda(null); setModalOpen(true); }}
          onImportClick={handleTriggerImport}
        />
        
        {/* INPUT FILE OCULTO (Compartilhado) */}
        <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleImportExcel} 
        />

        {/* CARDS DE ESTATÍSTICA */}
        <VendasStats
          count={stats.count}
          totalLiquido={stats.totalBaseIcms}
          totalRecebido={stats.totalRecebido}
        />

        {/* TABELA COM PAGINAÇÃO */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : (
            <>
              {/* Tabela de Dados */}
              <div className="flex-1 overflow-auto">
                 <DataTable data={paginatedVendas} columns={columns} />
              </div>
              
              {/* Rodapé de Paginação */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                <span className="text-sm text-slate-500 font-medium">
                  Página {currentPage} de {totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- MODAIS --- */}
      
      {/* 1. Preview de Vendas */}
      <ImportPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        data={previewData}
        loading={false}
        onRemoveItem={(idx) => setPreviewData((prev) => prev.filter((_, i) => i !== idx))}
        onConfirm={() => {
          const stores = [...new Set(previewData.map((i) => i.loja))];
          setUniqueStores(stores);
          setPreviewModalOpen(false);
          setMappingModalOpen(true);
        }}
      />

      {/* 2. Mapeamento de Lojas (Só para Vendas) */}
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

      {/* 3. Preview de Pagamentos */}
      <PaymentImportModal 
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        data={paymentPreviewData}
        loading={isConfirmingImport}
        onRemoveItem={(idx) => setPaymentPreviewData((prev) => prev.filter((_, i) => i !== idx))}
        onConfirm={handleFinalizeImportPagamento}
      />

      {/* 4. Modal de Edição/Criação Manual */}
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