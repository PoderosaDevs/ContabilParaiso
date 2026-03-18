import { FileSpreadsheet, RotateCcw, BadgeCent, Wallet } from "lucide-react";

interface DevolucoesStatsProps {
  count: number;
  totalBase: number;   // Valor base da nota
  totalValor: number;  // Valor total devolvido/impactado
  totalSaldo: number;  // Saldo restante
}

export const DevolucoesStats = ({ count, totalBase, totalValor, totalSaldo }: DevolucoesStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Card: Quantidade de Devoluções */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Qtd. Devoluções</p>
          <h3 className="text-2xl font-bold text-slate-800">{count}</h3>
        </div>
        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
      </div>

      {/* Card: Valor Base Total */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Base Afetada</p>
          <h3 className="text-2xl font-bold text-slate-600">
            R$ {totalBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">
          <BadgeCent className="w-5 h-5" />
        </div>
      </div>

      {/* Card: Valor Total Devolvido (Impacto Principal) */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between border-rose-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
        <div>
          <p className="text-sm text-rose-600/70 font-bold uppercase tracking-wider text-[10px]">Valor Devolvido</p>
          <h3 className="text-2xl font-bold text-rose-600">
            R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 z-10 mr-2">
          <RotateCcw className="w-5 h-5" />
        </div>
      </div>

      {/* Card: Saldo Pendente */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Saldo Restante</p>
          <h3 className="text-2xl font-bold text-amber-600">
            R$ {totalSaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
          <Wallet className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};