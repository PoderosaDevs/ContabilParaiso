import { Marketplace, Venda, Repasse, DashboardMetrics } from "@/types";

export const mockMarketplaces: Marketplace[] = [
  { id: "1", name: "Mercado Livre", cnpj: "03.007.331/0001-41" },
  { id: "2", name: "Amazon Brasil", cnpj: "15.436.940/0001-03" },
  { id: "3", name: "Shopee Brasil", cnpj: "28.271.329/0001-79" },
  { id: "4", name: "Magazine Luiza", cnpj: "47.960.950/0001-21" },
  { id: "5", name: "Americanas", cnpj: "33.014.556/0001-96" },
];

export const mockVendas: Venda[] = [
  {
    id: "1",
    numeroNf: "NF-001234",
    marketplaceId: "1",
    dataVenda: new Date("2024-01-15"),
    baseIcms: 1200.0,
    comissao: 180.0,
    comissaoFrete: 45.0,
    descontos: 50.0,
    valorLiquido: 925.0,
    status: "pago",
  },
  {
    id: "2",
    numeroNf: "NF-001235",
    marketplaceId: "2",
    dataVenda: new Date("2024-01-16"),
    baseIcms: 2500.0,
    comissao: 375.0,
    comissaoFrete: 80.0,
    descontos: 100.0,
    valorLiquido: 1945.0,
    status: "pago",
  },
  {
    id: "3",
    numeroNf: "NF-001236",
    marketplaceId: "3",
    dataVenda: new Date("2024-01-17"),
    baseIcms: 800.0,
    comissao: 120.0,
    comissaoFrete: 30.0,
    descontos: 20.0,
    valorLiquido: 630.0,
    status: "pendente",
  },
  {
    id: "4",
    numeroNf: "NF-001237",
    marketplaceId: "1",
    dataVenda: new Date("2024-01-18"),
    baseIcms: 3200.0,
    comissao: 480.0,
    comissaoFrete: 95.0,
    descontos: 150.0,
    valorLiquido: 2475.0,
    status: "pendente",
  },
  {
    id: "5",
    numeroNf: "NF-001238",
    marketplaceId: "4",
    dataVenda: new Date("2024-01-19"),
    baseIcms: 1800.0,
    comissao: 270.0,
    comissaoFrete: 60.0,
    descontos: 80.0,
    valorLiquido: 1390.0,
    status: "pago",
  },
  {
    id: "6",
    numeroNf: "NF-001239",
    marketplaceId: "5",
    dataVenda: new Date("2024-01-20"),
    baseIcms: 950.0,
    comissao: 142.5,
    comissaoFrete: 40.0,
    descontos: 30.0,
    valorLiquido: 737.5,
    status: "cancelado",
  },
];

export const mockRepasses: Repasse[] = [
  {
    id: "1",
    nf: "NF-001234",
    valorLiquido: 925.0,
    marketplaceId: "1",
    dataRepasse: new Date("2024-01-20"),
    status: "recebido",
  },
  {
    id: "2",
    nf: "NF-001235",
    valorLiquido: 1945.0,
    marketplaceId: "2",
    dataRepasse: new Date("2024-01-21"),
    status: "recebido",
  },
  {
    id: "3",
    nf: "NF-001238",
    valorLiquido: 1390.0,
    marketplaceId: "4",
    dataRepasse: new Date("2024-01-24"),
    status: "recebido",
  },
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalVendas: 8102.5,
  totalRepasses: 4260.0,
  pendentes: 3105.0,
  marketplacesAtivos: 5,
  variacaoMensal: 12.5,
};

export const mockChartData = [
  { name: "Jan", vendas: 4000, repasses: 2400 },
  { name: "Fev", vendas: 3000, repasses: 1398 },
  { name: "Mar", vendas: 2000, repasses: 9800 },
  { name: "Abr", vendas: 2780, repasses: 3908 },
  { name: "Mai", vendas: 1890, repasses: 4800 },
  { name: "Jun", vendas: 2390, repasses: 3800 },
];
