import { RankingMarketplace } from "@/services/dashboard-routes";
import { useMemo } from "react";

interface MarketplaceRankingProps {
  rankingData: RankingMarketplace[];
}

export function MarketplaceRanking({ rankingData }: MarketplaceRankingProps) {
  // Encontra o teto do faturamento de forma reativa para calcular a proporção exata da barra
  const maiorFaturamento = useMemo(() => {
    return rankingData.length > 0 ? Math.max(...rankingData.map((r) => r.totalVendas)) : 1;
  }, [rankingData]);

  return (
    <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm flex flex-col h-full min-h-[460px]">
      <div className="mb-5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Ranking de Marketplaces
        </h3>
        <p className="text-xs text-muted-foreground">
          Principais fontes de receita ordenadas por volume bruto
        </p>
      </div>
      
      <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
        {rankingData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <p className="text-xs text-muted-foreground">
              Aguardando novas consolidações de faturamento.
            </p>
          </div>
        ) : (
          rankingData.map((item, index) => {
            const porcentagemBarra = (item.totalVendas / maiorFaturamento) * 100;
            const isTopThree = index < 3;

            return (
              <div key={item.marketplaceId} className="group space-y-1.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Badge numérico sofisticado */}
                    <span className={`flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold transition-colors
                      ${isTopThree 
                        ? "bg-primary/10 text-primary font-extrabold" 
                        : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium text-foreground/90 tracking-tight group-hover:text-primary transition-colors">
                      {item.nome.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-foreground tracking-tight">
                    R$ {item.totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Container da trilha da barra */}
                <div className="w-100 h-2 rounded-full bg-secondary/50 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out relative
                      ${isTopThree ? "bg-primary" : "bg-primary/60"}`}
                    style={{ width: `${porcentagemBarra}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}