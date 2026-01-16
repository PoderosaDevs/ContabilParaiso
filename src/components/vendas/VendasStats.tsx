import { FileSpreadsheet, CheckCircle2, Wallet } from "lucide-react";

interface VendasStatsProps {
  count: number;
  totalLiquido: number;     // Valor total que deveria receber (Receita Prevista)
  totalRecebido: number;    // Soma dos pagamentos já realizados (Receita Recebida)
}

export const VendasStats = ({ count, totalLiquido, totalRecebido }: VendasStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card: Quantidade de Vendas */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Vendas no Período</p>
          <h3 className="text-2xl font-bold text-slate-800">{count}</h3>
        </div>
        <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
      </div>

      {/* Card: Receita Prevista */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Receita Prevista</p>
          <h3 className="text-2xl font-bold text-amber-600">
            R$ {totalLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Card: Receita Recebida (NOVO) */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Receita Recebida</p>
          <h3 className="text-2xl font-bold text-green-600">
            R$ {totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
          <Wallet className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};