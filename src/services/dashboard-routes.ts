
// --- INTERFACES DE TIPAGEM (TypeScript) ---

import api from "./api";

export interface ResumoFinanceiro {
  totalVendas: number;
  totalPagamentos: number;
  totalMarketplaces: number;
  valoresPendentes: number;
}

export interface DadoGraficoLinha {
  mes: string;
  marketplace: string;
  valorTotal: number;
}

export interface RankingMarketplace {
  marketplaceId: string;
  nome: string;
  totalVendas: number;
}

export interface DashboardAnalyticsResponse {
  resumoFinanceiro: ResumoFinanceiro;
  dadosGraficoLinha: DadoGraficoLinha[];
  rankingMarketplaces: RankingMarketplace[];
}

export interface DashboardParams {
  dataInicio?: string;
  dataFim?: string;
}

// --- DASHBOARD SERVICE ---

export const dashboardService = {
  /**
   * Busca todas as métricas consolidadas para a tela de Dashboard (Resumos, Gráfico e Ranking)
   * @param params Opcional contendo { dataInicio, dataFim } no formato YYYY-MM-DD
   */
  getAnalytics: (params?: DashboardParams) => {
    return api
      .get<DashboardAnalyticsResponse>("/dashboard", { params })
      .then((res) => res.data);
  },
};