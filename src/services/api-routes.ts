import api from "./api";

// ==========================================
// TIPAGENS (INTERFACES)
// ==========================================

export interface Marketplace {
  id: string;
  titulo: string;
  createdAt: string;
}

export interface Venda {
  id: string;
  nf: string;
  loja: string;
  baseIcms: number;
  comissaoVenda: number | null;
  comissaoFrete: number | null;
  desconto: number | null;
  liquidoReceber: number;
  marketplaceId: string;
  marketplace?: Marketplace;
  createdAt: string;
  qtdParcelas: number | null; // Total de parcelas definido na venda
}

export interface CreateVendaDTO {
  nf: string;
  loja: string;
  marketplaceId: string;
  baseIcms: number;
  comissaoVenda?: number;
  comissaoFrete?: number;
  desconto?: number;
  qtdParcelas?: number | null;
}

export interface Pagamento {
  id: string;
  valor: number;
  data: string;
  nfVenda: string;
  vendaId: string;
  venda?: Venda;
  numeroParcela: number; // Qual parcela é esta (ex: 1)
}

// DTO para Criação e Importação de Pagamentos
export interface CreatePagamentoDTO {
  valor: number;
  data?: Date | string;
  nfVenda: string; // Identificador para o Service achar a venda
  parcelaPaga: number; // Mapeado para numeroParcela no banco
  numeroParcelas?: number; // Mapeado para qtdParcelas na venda (via update)
}

export interface ImportResponse {
  count: number;
  message: string;
  processados?: number;
  falhas?: number;
}

// ==========================================
// SERVIÇOS
// ==========================================

export const marketplaceService = {
  getAll: () => api.get<Marketplace[]>("/marketplaces").then((res) => res.data),
  getById: (id: string) =>
    api.get<Marketplace>(`/marketplaces/${id}`).then((res) => res.data),
  create: (titulo: string) =>
    api.post<Marketplace>("/marketplaces", { titulo }),
  update: (id: string, titulo: string) =>
    api.put<Marketplace>(`/marketplaces/${id}`, { titulo }),
  delete: (id: string) => api.delete(`/marketplaces/${id}`),
};

export const vendaService = {
  getAll: () => api.get<Venda[]>("/vendas").then((res) => res.data),
  getById: (id: string) =>
    api.get<Venda>(`/vendas/${id}`).then((res) => res.data),
  create: (data: CreateVendaDTO) => api.post<Venda>("/vendas", data),
  // Importação de Vendas
  importBulk: (vendas: CreateVendaDTO[]) =>
    api.post<ImportResponse>("/vendas/import", { vendas }),
  update: (id: string, data: Partial<CreateVendaDTO>) =>
    api.put<Venda>(`/vendas/${id}`, data),
  delete: (id: string) => api.delete(`/vendas/${id}`),
};

export const pagamentoService = {
  getAll: () => api.get<Pagamento[]>("/pagamentos").then((res) => res.data),
  create: (data: CreatePagamentoDTO) =>
    api.post<Pagamento>("/pagamentos", data),

  // --- NOVA ROTA: Importação de Pagamentos ---
  importBulk: (pagamentos: CreatePagamentoDTO[]) =>
    api
      .post<ImportResponse>("/pagamentos/import", { pagamentos })
      .then((res) => res.data),

  update: (id: string, data: Partial<CreatePagamentoDTO>) =>
    api.put<Pagamento>(`/pagamentos/${id}`, data),
  delete: (id: string) => api.delete(`/pagamentos/${id}`),
};
