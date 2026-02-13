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
  nf: string;               // Renomeado de 'numeroNf' para alinhar com o modal
  dataVenda: Date | string; // Aceita string (ISO) ou objeto Date
  baseIcms: number;
  loja: string;             // Novo campo obrigatório
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
