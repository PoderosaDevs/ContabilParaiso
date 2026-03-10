import api from "./api";

// ==========================================
// TIPAGENS (INTERFACES)
// ==========================================

export type VendaStatus =
  | "PENDENTE"
  | "PARCIALMENTE_PAGO"
  | "PAGO"
  | "CANCELADO";

export interface Marketplace {
  id: string;
  titulo: string;
  createdAt: string;
}

export interface Pagamento {
  id: string;
  valor: number | string;
  data: string;
  nfVenda: string;
  vendaId: string;
  numeroParcela: number;
  comissaoRetida?: number | null;
}

export interface Venda {
  id: string;
  nf: string;
  loja: string;
  baseIcms: number;
  liquidoReceber: number;
  comissaoVenda: number | null;
  comissaoFrete: number | null;
  desconto: number | null;
  status: VendaStatus;
  marketplaceId: string;
  marketplace?: Marketplace;
  dataVenda: string;
  createdAt: string;
  qtdParcelas: number | null;
  pagamentos?: Pagamento[];
}

export interface CreateVendaDTO {
  nf: string;
  loja: string;
  marketplaceId?: string | null;
  baseIcms: number;
  dataVenda?: string;
  comissaoVenda?: number;
  comissaoFrete?: number;
  desconto?: number;
  qtdParcelas?: number | null;
  liquidoReceber?: number;
}

// NOVO: DTO para Reembolsos e Devoluções (Modal Unificado)
export interface CreateOperationDTO {
  nota: string;
  loja: string;
  data: string;
  valor: number;
  motivo: number; // ID numérico 1-19 que mapeamos no modal
}

export interface CreatePagamentoDTO {
  valor?: number;
  data?: Date | string;
  nfVenda?: string;
  numeroParcela?: number;
  nota?: string;
  repasse?: number;
  parcelaPaga?: number;
  parcelas?: number;
  comissaoVenda?: number;
  comissaoFrete?: number;
  baseIcms?: number;
  loja?: string;
}

export interface ImportResponse {
  count: number;
  message: string;
  processados?: number;
  falhas?: string[];
  duplicates?: string[];
}

// ==========================================
// SERVIÇOS
// ==========================================

export const marketplaceService = {
  getAll: () => api.get<Marketplace[]>("/marketplaces").then((res) => res.data),
  getById: (id: string) =>
    api.get<Marketplace>(`/marketplaces/${id}`).then((res) => res.data),
  create: (titulo: string, freteParte: boolean) =>
    api
      .post<Marketplace>("/marketplaces", { titulo, freteParte })
      .then((res) => res.data),
  update: (id: string, data: { titulo: string; freteParte: boolean }) =>
    api.put<Marketplace>(`/marketplaces/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/marketplaces/${id}`),
};

export const vendaService = {
  getAll: () => api.get<Venda[]>("/vendas").then((res) => res.data),
  getById: (id: string) =>
    api.get<Venda>(`/vendas/${id}`).then((res) => res.data),
  create: (data: CreateVendaDTO) =>
    api.post<Venda>("/vendas", data).then((res) => res.data),

  // Importação em Massa de Vendas
  importBulk: (vendas: CreateVendaDTO[]) =>
    api
      .post<ImportResponse>("/vendas/import", { vendas })
      .then((res) => res.data),

  // --- NOVOS MÉTODOS DE OPERAÇÃO ---
  importRefunds: (reembolsos: CreateOperationDTO[]) =>
    api
      .post<ImportResponse>("/vendas/import-reembolsos", { reembolsos })
      .then((res) => res.data),

  importReturns: (devolucoes: CreateOperationDTO[]) =>
    api
      .post<ImportResponse>("/vendas/import-devolucoes", { devolucoes })
      .then((res) => res.data),
  // ---------------------------------

  update: (id: string, data: Partial<CreateVendaDTO>) =>
    api.put<Venda>(`/vendas/${id}`, data).then((res) => res.data),

  delete: (id: string) => api.delete(`/vendas/${id}`),
};

export const pagamentoService = {
  getAll: () => api.get<Pagamento[]>("/pagamentos").then((res) => res.data),
  create: (data: CreatePagamentoDTO) =>
    api.post<Pagamento>("/pagamentos", data).then((res) => res.data),
  importBulk: (pagamentos: CreatePagamentoDTO[]) =>
    api
      .post<ImportResponse>("/pagamentos/import", { pagamentos })
      .then((res) => res.data),
  update: (id: string, data: Partial<CreatePagamentoDTO>) =>
    api.put<Pagamento>(`/pagamentos/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/pagamentos/${id}`),
};
