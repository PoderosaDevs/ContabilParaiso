export type UserRole = "admin" | "funcionario" | "pendente";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  status: "pendente" | "aprovado" | "rejeitado";
}

export interface Marketplace {
  id: string;
  name: string;
  cnpj: string;
}

export interface Venda {
  id: string;
  numeroNf: string;
  marketplaceId: string;
  marketplace?: Marketplace;
  dataVenda: Date;
  baseIcms: number;
  comissao: number;
  comissaoFrete: number;
  descontos: number;
  valorLiquido: number;
  status: "pendente" | "pago" | "cancelado";
}

export interface Repasse {
  id: string;
  nf: string;
  valorLiquido: number;
  marketplaceId: string;
  marketplace?: Marketplace;
  dataRepasse: Date;
  status: "recebido" | "pendente";
}

export interface DashboardMetrics {
  totalVendas: number;
  totalRepasses: number;
  pendentes: number;
  marketplacesAtivos: number;
  variacaoMensal: number;
}
