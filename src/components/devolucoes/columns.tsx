import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Store,
  TrendingUp,
  RotateCcw,
  AlertCircle,
  MessageSquareWarning,
  ReceiptText,
  BadgeCent
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
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch {
    return "-";
  }
};

// --- COLUNAS DE DEVOLUÇÃO ---

export const getDevolucoesColumns = (
  onEdit: (item: any) => void,
  onDelete: (id: string) => void,
) => [
  // 1. IDENTIFICAÇÃO (NF e Cód. Devolução)
  {
    key: "nf",
    header: () => <div className="text-center w-full">Identificação</div>,
    render: (v: any) => (
      <div className="flex flex-col items-center justify-center gap-1.5 w-full min-w-[100px]">
        <div className="flex items-center gap-2">
          <span className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs shadow-sm">
            #{v.nf || "S/N"}
          </span>
        </div>
        {v.devolucao && (
          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1 font-semibold">
            <RotateCcw className="w-3 h-3" />
            {v.devolucao}
          </span>
        )}
        <span className="text-[10px] text-slate-400 font-medium">
          {formatDate(v.data || v.dataVenda)}
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
          <span
            className="text-xs font-bold text-slate-700 uppercase tracking-tight truncate max-w-[140px]"
            title={v.loja}
          >
            {v.loja || "Loja Desconhecida"}
          </span>
        </div>

        {v.marketplace ? (
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {v.marketplace.titulo || v.marketplace.nome}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 italic px-1 bg-slate-50 rounded border border-slate-100">
            Loja Física
          </span>
        )}
      </div>
    ),
  },

  // 3. DETALHES DA DEVOLUÇÃO (Tratativa e Motivo)
  {
    key: "detalhes",
    header: () => <div className="text-center w-full">Detalhes do Retorno</div>,
    render: (v: any) => (
      <div className="flex flex-col items-center justify-center gap-1.5 w-full min-w-[140px]">
        {/* Tratativa */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 w-full max-w-[130px] justify-center"
          title={`Tratativa: ${v.tratativa}`}
        >
          <ReceiptText className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="text-[9px] font-bold text-slate-600 uppercase truncate">
            {v.tratativa || "N/A"}
          </span>
        </div>

        {/* Motivo */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 border border-amber-200 w-full max-w-[130px] justify-center"
          title={`Motivo: ${v.motivo}`}
        >
          <MessageSquareWarning className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[9px] font-bold text-amber-700 uppercase truncate">
            {v.motivo || "Sem motivo"}
          </span>
        </div>
      </div>
    ),
  },

  // 4. FINANCEIRO (Base, Valor e Saldo)
  {
    key: "valores",
    header: () => <div className="text-center w-full">Valores Impactados</div>,
    render: (v: any) => (
      <div className="flex flex-col items-center justify-center gap-1.5 w-full min-w-[150px]">
        {/* A: BASE */}
        <div className="flex items-center justify-between w-full max-w-[140px] px-2 text-slate-500">
          <span className="text-[9px] font-medium flex items-center gap-1">
            <BadgeCent className="w-3 h-3 text-slate-400" /> Base
          </span>
          <span className="text-[10px] font-semibold">
            {formatCurrency(v.base)}
          </span>
        </div>

        {/* B: VALOR DA DEVOLUÇÃO (Destaque principal) */}
        <div className="flex items-center justify-between w-full max-w-[140px] px-2 py-1 bg-rose-50 rounded border border-rose-100">
          <span
            className="text-[10px] text-rose-600 font-bold flex items-center gap-1"
            title="Valor total devolvido/impactado"
          >
            <AlertCircle className="w-3 h-3" /> Valor
          </span>
          <span className="text-xs font-bold text-rose-700">
            {formatCurrency(v.valor)}
          </span>
        </div>

        {/* C: SALDO */}
        {Number(v.saldo) !== 0 ? (
          <div className="flex items-center justify-between w-full max-w-[140px] px-2 text-slate-400">
            <span className="text-[9px] font-medium flex items-center gap-1">
              Saldo Restante
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {formatCurrency(v.saldo)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full max-w-[140px]">
            <span className="text-[9px] text-emerald-500/80 italic font-medium">
              Sem saldo pendente
            </span>
          </div>
        )}
      </div>
    ),
  },

  // 5. AÇÕES
  {
    key: "actions",
    header: "",
    render: (item: any) => (
      <div className="flex justify-center items-center w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 shadow-lg border-slate-100 rounded-xl"
          >
            <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-2 py-1.5">
              Ações da Devolução
            </DropdownMenuLabel>
            
            <DropdownMenuItem
              onClick={() => onEdit(item)}
              className="cursor-pointer gap-2 py-2 text-sm"
            >
              <Pencil className="w-4 h-4 text-blue-500" />
              <span>Editar Registro</span>
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