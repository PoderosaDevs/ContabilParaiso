import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MarketplaceRanking } from "@/components/dashboard/MarketplaceRanking";
import { DollarSign, ArrowLeftRight, Clock, Store, Calendar } from "lucide-react";
import { subMonths, format } from "date-fns";
import { DashboardAnalyticsResponse, dashboardService } from "@/services/dashboard-routes";

const Index = () => {
  const [data, setData] = useState<DashboardAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Define um range padrão inicial (Últimos 6 meses até a data de hoje)
  const [dataInicio, setDataInicio] = useState<string>(
    format(subMonths(new Date(), 5), "yyyy-MM-01") // Primeiro dia de 5 meses atrás
  );
  const [dataFim, setDataFim] = useState<string>(
    format(new Date(), "yyyy-MM-dd") // Data de hoje
  );

  // O useEffect agora "escuta" as mudanças em dataInicio e dataFim
  useEffect(() => {
    setLoading(true);
    dashboardService.getAnalytics({ dataInicio, dataFim })
      .then((res) => setData(res))
      .catch((err) => console.error("Erro ao carregar dados do dashboard:", err))
      .finally(() => setLoading(false));
  }, [dataInicio, dataFim]); // Recarrega sempre que o usuário mexer no filtro

  const resumo = data?.resumoFinanceiro || { totalVendas: 0, totalPagamentos: 0, valoresPendentes: 0, totalMarketplaces: 0 };

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 antialiased">
        
        {/* Cabeçalho do Painel + Filtro de Data */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Filtro de Período</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">Altere o intervalo para recalcular os gráficos e totais.</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-background border border-border/80 rounded-lg pl-9 pr-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer"
              />
            </div>
            <span className="text-muted-foreground font-medium">até</span>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-background border border-border/80 rounded-lg pl-9 pr-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Grid de Métricas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total de Vendas"
            value={loading ? "..." : `R$ ${resumo.totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className="w-5 h-5" />}
            variant="primary"
          />
          <MetricCard
            title="Total de Repasses (Pagos)"
            value={loading ? "..." : `R$ ${resumo.totalPagamentos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={<ArrowLeftRight className="w-5 h-5" />}
            variant="success"
          />
          <MetricCard
            title="Valores Pendentes"
            value={loading ? "..." : `R$ ${resumo.valoresPendentes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={<Clock className="w-5 h-5" />}
            variant="warning"
          />
          <MetricCard
            title="Marketplaces Ativos"
            value={loading ? "..." : resumo.totalMarketplaces.toString()}
            icon={<Store className="w-5 h-5" />}
            variant="primary"
          />
        </div>

        {/* Grid de Gráficos e Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            {loading ? (
              <div className="h-[450px] bg-card rounded-xl border animate-pulse flex items-center justify-center text-muted-foreground">
                Recalculando faturamento por período...
              </div>
            ) : (
              <RevenueChart chartData={data?.dadosGraficoLinha || []} />
            )}
          </div>
          
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            {loading ? (
              <div className="h-[450px] bg-card rounded-xl border animate-pulse flex items-center justify-center text-muted-foreground">
                Ordenando canais mais fortes...
              </div>
            ) : (
              <MarketplaceRanking rankingData={data?.rankingMarketplaces || []} />
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default Index;