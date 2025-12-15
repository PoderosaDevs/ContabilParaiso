import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { mockDashboardMetrics } from "@/data/mockData";
import { DollarSign, ArrowLeftRight, Clock, Store } from "lucide-react";

const Index = () => {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de Vendas"
            value={`R$ ${mockDashboardMetrics.totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            change={mockDashboardMetrics.variacaoMensal}
            icon={<DollarSign className="w-6 h-6" />}
            variant="primary"
          />
          <MetricCard
            title="Total de Repasses"
            value={`R$ ${mockDashboardMetrics.totalRepasses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            change={8.2}
            icon={<ArrowLeftRight className="w-6 h-6" />}
            variant="success"
          />
          <MetricCard
            title="Valores Pendentes"
            value={`R$ ${mockDashboardMetrics.pendentes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            change={-5.4}
            icon={<Clock className="w-6 h-6" />}
            variant="warning"
          />
          <MetricCard
            title="Marketplaces Ativos"
            value={mockDashboardMetrics.marketplacesAtivos.toString()}
            icon={<Store className="w-6 h-6" />}
          />
        </div>

        {/* Charts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <RecentTransactions />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
