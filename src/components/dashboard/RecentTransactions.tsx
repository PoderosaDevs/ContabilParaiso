import { mockVendas, mockMarketplaces } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentTransactions() {
  const recentVendas = mockVendas.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-success/10 text-success";
      case "pendente":
        return "bg-warning/10 text-warning";
      case "cancelado":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getMarketplaceName = (id: string) => {
    return mockMarketplaces.find((m) => m.id === id)?.name || "Desconhecido";
  };

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Transações Recentes
        </h3>
        <p className="text-sm text-muted-foreground">Últimas vendas registradas</p>
      </div>
      <div className="space-y-4">
        {recentVendas.map((venda) => (
          <div
            key={venda.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {getMarketplaceName(venda.marketplaceId).charAt(0)}
              </div>
              <div>
                <p className="font-medium text-foreground">{venda.numeroNf}</p>
                <p className="text-sm text-muted-foreground">
                  {getMarketplaceName(venda.marketplaceId)} •{" "}
                  {format(venda.dataVenda, "dd MMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">
                R$ {venda.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <span
                className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                  getStatusColor(venda.status)
                )}
              >
                {venda.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
