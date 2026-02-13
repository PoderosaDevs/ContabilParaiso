import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Ban, 
  CalendarClock, 
  Store,
  TrendingUp,
  ArrowDownToLine,
  Target,
  PieChart,
  CreditCard
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// --- HELPERS ---
const formatCurrency = (value: number | string | null | undefined) => {
  if (!value) return "R$ 0,00";
  const num = Number(value);
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch {
    return "-";
  }
};

// --- COLUNAS ---

export const getVendasColumns = (
  onEdit: (item: any) => void,
  onDelete: (id: string) => void,
) => [
  
  // 1. IDENTIFICAÇÃO
  {
    key: "nf",
    header: () => <div className="text-center w-full">Identificação</div>,
    render: (v: any) => (
      <div className="flex flex-col items-center justify-center gap-1 w-full min-w-[100px]">
        <div className="flex items-center gap-2">
           <span className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs shadow-sm">
             #{v.nf || "S/N"}
           </span>
        </div>
        <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
          <CalendarClock className="w-3 h-3 text-slate-400" />
          {formatDate(v.dataVenda)}
        </span>
      </div>
    ),
  },

  // 2. CANAL (LOJA)
  {
    key: "loja",
    header: () => <div className="text-center w-full">Canal</div>,
    render: (v: any) => (
      <div className="flex flex-col items-center justify-center gap-1.5 w-full min-w-[120px]">
        <div className="flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight truncate max-w-[140px]" title={v.loja}>
            {v.loja || "Loja Desconhecida"}
          </span>
        </div>
        
        {v.marketplace ? (
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 font-semibold flex items-center gap-1">
             <TrendingUp className="w-3 h-3" />
             {v.marketplace.titulo}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 italic px-1 bg-slate-50 rounded border border-slate-100">
            Loja Física
          </span>
        )}
      </div>
    ),
  },

  // 3. VALOR BRUTO
  {
    key: "bruto",
    header: () => <div className="text-center w-full">Valor Bruto</div>,
    render: (v: any) => (
      <div className="flex flex-col items-center justify-center w-full min-w-[100px]">
         <div className="flex flex-col items-center gap-0.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm w-[110px]">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">TOTAL NF</span>
            <span className="text-sm font-bold text-slate-700">{formatCurrency(v.baseIcms)}</span>
         </div>
      </div>
    ),
  },

  // 4. FLUXO DE CAIXA (Líquido, Recebido, Taxas)
  {
    key: "financeiro",
    header: () => <div className="text-center w-full">Fluxo de Caixa</div>,
    render: (v: any) => {
        // Cálculos
        const bruto = Number(v.baseIcms || 0);
        const taxas = (Number(v.comissaoVenda || 0) + Number(v.comissaoFrete || 0));
        
        // Se tiver liquidoReceber salvo usa ele, senão calcula
        const liquido = v.liquidoReceber ? Number(v.liquidoReceber) : (bruto - taxas);
        
        // Total Recebido (Soma dos pagamentos)
        const recebido = v.pagamentos?.reduce((acc: number, p: any) => acc + Number(p.valor || 0), 0) || 0;
        
        return (
          <div className="flex flex-col items-center justify-center gap-1.5 w-full min-w-[150px]">
            
            {/* A: LÍQUIDO (META) */}
            <div className="flex items-center justify-between w-full max-w-[150px] px-2 py-0.5 bg-blue-50/50 rounded border border-blue-100">
               <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1" title="Valor Líquido Previsto">
                 <Target className="w-3 h-3" /> Líquido
               </span>
               <span className="text-xs font-bold text-blue-700">
                 {formatCurrency(liquido)}
               </span>
            </div>

            {/* B: RECEBIDO (REAL) */}
            <div className="flex items-center justify-between w-full max-w-[150px] px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100">
               <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1" title="Valor já pago">
                 <ArrowDownToLine className="w-3 h-3" /> Recebido
               </span>
               <span className="text-xs font-bold text-emerald-700">
                 {formatCurrency(recebido)}
               </span>
            </div>

            {/* C: TAXAS */}
            {taxas > 0 ? (
                <div className="flex items-center justify-between w-full max-w-[150px] px-2 text-slate-400">
                   <span className="text-[9px] font-medium flex items-center gap-1">
                     <PieChart className="w-3 h-3 text-red-400" /> Taxas
                   </span>
                   <span className="text-[10px] font-medium text-red-500">
                     -{formatCurrency(taxas)}
                   </span>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full max-w-[150px]">
                    <span className="text-[9px] text-slate-300 italic">-- Sem taxas --</span>
                </div>
            )}
          </div>
        );
    },
  },

  // 5. STATUS & PARCELAS
  {
    key: "status",
    header: () => <div className="text-center w-full">Status & Parcelas</div>,
    render: (v: any) => {
        const statusConfig: any = {
            PENDENTE: { label: "Pendente", color: "bg-slate-100 text-slate-500 border-slate-200", icon: Clock },
            PARCIALMENTE_PAGO: { label: "Recebendo", color: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertCircle },
            EM_DEBITO: { label: "Em Débito", color: "bg-red-50 text-red-600 border-red-200", icon: AlertCircle },
            PAGO: { label: "Pago", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
            CANCELADO: { label: "Cancelado", color: "bg-rose-50 text-rose-600 border-rose-200", icon: Ban }
        };

        const config = statusConfig[v.status] || statusConfig.PENDENTE;
        const Icon = config.icon;

        const pagamentosFeitos = v.pagamentos?.length || 0;
        const totalParcelas = v.qtdParcelas || 1;
        const isParcelado = totalParcelas > 1;
        
        let percentual = 0;
        if (totalParcelas > 0) percentual = Math.round((pagamentosFeitos / totalParcelas) * 100);
        if (v.status === 'PAGO') percentual = 100;

        const barColor = percentual === 100 ? 'bg-emerald-500' : percentual > 0 ? 'bg-amber-500' : 'bg-slate-200';

        return (
            <div className="flex flex-col items-center justify-center gap-2 w-full min-w-[150px]">
                
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ${config.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">{config.label}</span>
                </div>

                {!isParcelado ? (
                    <div className="flex items-center gap-1.5 opacity-60 mt-1">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-medium text-slate-500">Pagamento Único</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 w-full max-w-[120px] mt-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div 
                                className={`h-full transition-all duration-500 ease-out ${barColor}`}
                                style={{ width: `${percentual}%` }}
                            />
                        </div>
                        
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium px-0.5">
                            <span>{pagamentosFeitos}/{totalParcelas} pagas</span>
                            {totalParcelas - pagamentosFeitos > 0 ? (
                                <span className="text-amber-600 font-bold">Faltam {totalParcelas - pagamentosFeitos}</span>
                            ) : (
                                <span className="text-emerald-600 font-bold">Finalizado</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    },
  },

  // 6. AÇÕES
  {
    key: "actions",
    header: "",
    render: (item: any) => (
      <div className="flex justify-center items-center w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-100 rounded-xl">
            <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-2 py-1.5">
              Gerenciar Venda
            </DropdownMenuLabel>
            
            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2 py-2 text-sm">
              <Pencil className="w-4 h-4 text-blue-500" /> 
              <span>Editar Dados</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50 gap-2 py-2 text-sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-4 h-4" /> 
              <span>Excluir Registro</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },

];