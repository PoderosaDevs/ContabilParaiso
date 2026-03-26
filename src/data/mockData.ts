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
    baseIcms: 0,
    comissao: 0,
    comissaoFrete: 0,
    descontos: 0,
    valorLiquido: 0,
    status: "pago",
  },
  {
    id: "2",
    numeroNf: "NF-001235",
    marketplaceId: "2",
    dataVenda: new Date("2024-01-16"),
    baseIcms: 0,
    comissao: 0,
    comissaoFrete: 0,
    descontos: 0,
    valorLiquido: 0,
    status: "pago",
  },
  {
    id: "3",
    numeroNf: "NF-001236",
    marketplaceId: "3",
    dataVenda: new Date("2024-01-17"),
    baseIcms: 0,
    comissao: 0,
    comissaoFrete: 0,
    descontos: 0,
    valorLiquido: 0,
    status: "pendente",
  },
  {
    id: "4",
    numeroNf: "NF-001237",
    marketplaceId: "1",
    dataVenda: new Date("2024-01-18"),
    baseIcms: 0,
    comissao: 0,
    comissaoFrete: 0,
    descontos: 0,
    valorLiquido: 0,
    status: "pendente",
  },
  {
    id: "5",
    numeroNf: "NF-001238",
    marketplaceId: "4",
    dataVenda: new Date("2024-01-19"),
    baseIcms: 0,
    comissao: 0,
    comissaoFrete: 0,
    descontos: 0,
    valorLiquido: 0,
    status: "pago",
  },
  {
    id: "6",
    numeroNf: "NF-001239",
    marketplaceId: "5",
    dataVenda: new Date("2024-01-20"),
    baseIcms: 0,
    comissao: 0,
    comissaoFrete: 0,
    descontos: 0,
    valorLiquido: 0,
    status: "cancelado",
  },
];

export const mockRepasses: Repasse[] = [
  {
    id: "1",
    nf: "NF-001234",
    valorLiquido: 0,
    marketplaceId: "1",
    dataRepasse: new Date("2024-01-20"),
    status: "recebido",
  },
  {
    id: "2",
    nf: "NF-001235",
    valorLiquido: 0,
    marketplaceId: "2",
    dataRepasse: new Date("2024-01-21"),
    status: "recebido",
  },
  {
    id: "3",
    nf: "NF-001238",
    valorLiquido: 0,
    marketplaceId: "4",
    dataRepasse: new Date("2024-01-24"),
    status: "recebido",
  },
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalVendas: 0,
  totalRepasses: 0,
  pendentes: 0,
  marketplacesAtivos: 5,
  variacaoMensal: 0,
};

export const mockChartData = [
  { name: "Jan", vendas: 0, repasses: 0 },
  { name: "Fev", vendas: 0, repasses: 0 },
  { name: "Mar", vendas: 0, repasses: 0 },
  { name: "Abr", vendas: 0, repasses: 0 },
  { name: "Mai", vendas: 0, repasses: 0 },
  { name: "Jun", vendas: 0, repasses: 0 },
];