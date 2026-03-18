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
  RotateCcw,
  Landmark,
  ShieldCheck,
  Truck,
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
import { Venda } from "@/services/api-routes";

const formatCurrency = (value: number | string | null | undefined) => {
  if (!value) return "R$ 0,00";
  const num = Number(value);
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

export const getVendasColumns = (
  onEdit: (item: Venda) => void,
  onDelete: (id: string) => void,
) => [
  {
    key: "nf",
    header: () => <div className="text-center w-full">Identificação</div>,
    render: (v: Venda) => (
      <div className="flex flex-col items-center justify-center gap-1 w-full min-w-[100px]">
        <span className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs shadow-sm">
          #{v.nf || "S/N"}
        </span>
        <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
          <CalendarClock className="w-3 h-3 text-slate-400" />
          {formatDate(v.dataVenda)}
        </span>
      </div>
    ),
  },

  {
    key: "loja",
    header: () => <div className="text-center w-full">Canal</div>,
    render: (v: Venda) => (
      <div className="flex flex-col items-center justify-center gap-1.5 w-full min-w-[120px]">
        <div className="flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase truncate max-w-[140px]">
            {v.loja}
          </span>
        </div>
        {v.marketplace && (
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {v.marketplace.titulo}
          </span>
        )}
      </div>
    ),
  },

  {
    key: "bruto",
    header: () => <div className="text-center w-full">Valor Bruto</div>,
    render: (v: Venda) => (
      <div className="flex flex-col items-center justify-center w-full min-w-[100px]">
        <div className="flex flex-col items-center gap-0.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm w-[110px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            TOTAL NF
          </span>
          <span className="text-sm font-bold text-slate-700">
            {formatCurrency(v.baseIcms)}
          </span>
        </div>
      </div>
    ),
  },

  {
    key: "financeiro",
    header: () => <div className="text-center w-full">Fluxo de Caixa</div>,
    render: (v: Venda) => {
      const baseIcms = Number(v.baseIcms || 0);
      const taxas = Number(v.comissaoVenda || 0) + Number(v.comissaoFrete || 0);
      const frete_taxas = Number(v.frete_e_taxas || 0);
      const liquido = v.liquidoReceber ? Number(v.liquidoReceber) : baseIcms - taxas - frete_taxas;

      const totalPagos = v.pagamentos?.reduce((acc, p) => acc + Number(p.valor || 0), 0) || 0;
      const totalReembolsos = v.reembolsos?.reduce((acc, r) => acc + Number(r.valor || 0), 0) || 0;
      const totalDevolucoes = v.devolucoes?.reduce((acc, d) => acc + Number(d.valor || 0), 0) || 0;

      const recebidoTotal = totalPagos + totalReembolsos + totalDevolucoes;
      const isEstorno = v.status.includes("REEMBOLSADO") || v.status.includes("DEVOLVIDO");
      const isPagoCorretamente = recebidoTotal >= baseIcms && baseIcms > 0;

      return (
        <div className="flex flex-col items-center justify-center gap-1.5 w-full min-w-[160px]">
          {!isEstorno && (
            <>
              <div className="flex items-center justify-between w-full max-w-[150px] px-2 py-0.5 bg-blue-50/50 rounded border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                  <Target className="w-3 h-3" /> Líquido
                </span>
                <span className="text-xs font-bold text-blue-700">{formatCurrency(liquido)}</span>
              </div>

              {taxas > 0 && (
                <div className="flex items-center justify-between w-full max-w-[150px] px-2 text-slate-400">
                  <span className="text-[9px] font-medium flex items-center gap-1">
                    <PieChart className="w-3 h-3 text-red-400" /> Taxas
                  </span>
                  <span className="text-[10px] font-medium text-red-500">-{formatCurrency(taxas)}</span>
                </div>
              )}

              {frete_taxas > 0 && (
                <div className="flex items-center justify-between w-full max-w-[150px] px-2 text-slate-400">
                  <span className="text-[9px] font-medium flex items-center gap-1">
                    <Truck className="w-3 h-3 text-orange-400" /> Frete
                  </span>
                  <span className="text-[10px] font-medium text-orange-500">-{formatCurrency(frete_taxas)}</span>
                </div>
              )}
            </>
          )}

          <div className={`flex items-center justify-between w-full max-w-[150px] px-2 py-1 rounded border transition-colors ${isPagoCorretamente ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <span className={`text-[10px] font-bold flex items-center gap-1 ${isPagoCorretamente ? "text-emerald-600" : "text-amber-600"}`}>
              <ArrowDownToLine className="w-3 h-3" /> Recebido
            </span>
            <span className={`text-xs font-bold ${isPagoCorretamente ? "text-emerald-700" : "text-amber-700"}`}>
              {formatCurrency(recebidoTotal)}
            </span>
          </div>

          {isEstorno && (totalReembolsos > 0 || totalDevolucoes > 0) && (
            <div className="flex justify-between w-full max-w-[150px] px-2 text-[9px] text-blue-500 font-medium">
              <span>Estornos (Rec.):</span>
              <span>{formatCurrency(totalReembolsos + totalDevolucoes)}</span>
            </div>
          )}

          {isPagoCorretamente && (
            <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">
              <ShieldCheck className="w-3 h-3" /> Conciliado
            </div>
          )}
        </div>
      );
    },
  },

  {
    key: "status",
    header: () => <div className="text-center w-full">Status do Processo</div>,
    render: (v: Venda) => {
      const statusConfig: any = {
        PENDENTE: { label: "Pendente", color: "bg-slate-100 text-slate-500 border-slate-200", icon: Clock },
        PARCIALMENTE_PAGO: { label: "Recebendo", color: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertCircle },
        PARCIALMENTE_REEMBOLSADO: { label: "P. Reembolso", color: "bg-orange-50 text-orange-600 border-orange-200", icon: RotateCcw },
        PARCIALMENTE_DEVOLVIDO: { label: "P. Devolvido", color: "bg-cyan-50 text-cyan-600 border-cyan-200", icon: RotateCcw },
        REEMBOLSADO: { label: "Reembolsado", color: "bg-purple-50 text-purple-600 border-purple-200", icon: Landmark },
        DEVOLVIDO: { label: "Devolvido", color: "bg-rose-50 text-rose-600 border-rose-200", icon: RotateCcw },
        PAGO: { label: "Pago", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
        FINALIZADO: { label: "Finalizado", color: "bg-blue-50 text-blue-600 border-blue-200", icon: CheckCircle2 },
        CANCELADO: { label: "Cancelado", color: "bg-red-50 text-red-600 border-red-200", icon: Ban },
      };

      const config = statusConfig[v.status] || statusConfig.PENDENTE;
      const Icon = config.icon;

      return (
        <div className="flex flex-col items-center justify-center gap-2 w-full min-w-[150px]">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {config.label}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {v.pagamentos?.length || 0} de {v.qtdParcelas || 1} parcelas
          </span>
        </div>
      );
    },
  },

  {
    key: "actions",
    header: "",
    render: (item: Venda) => (
      <div className="flex justify-center items-center w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-100 rounded-xl">
            <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-2 py-1.5">
              Gerenciar
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2 py-2 text-sm">
              <Landmark className="w-4 h-4 text-purple-500" /> <span>Lançar Reembolso</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2 py-2 text-sm">
              <RotateCcw className="w-4 h-4 text-cyan-500" /> <span>Lançar Devolução</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2 py-2 text-sm">
              <Pencil className="w-4 h-4 text-blue-500" /> <span>Editar Venda</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer focus:bg-red-50 gap-2 py-2 text-sm" onClick={() => onDelete(item.id)}>
              <Trash2 className="w-4 h-4" /> <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];