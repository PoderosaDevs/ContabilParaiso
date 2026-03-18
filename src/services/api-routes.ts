import api from "./api";

// ==========================================
// TIPAGENS (INTERFACES)
// ==========================================

export type VendaStatus =
  | "PENDENTE"
  | "PARCIALMENTE_PAGO"
  | "PARCIALMENTE_REEMBOLSADO"
  | "PARCIALMENTE_CONTESTACAO"
  | "PARCIALMENTE_DEVOLVIDO"
  | "REEMBOLSADO"
  | "CONTESTACAO"
  | "DEVOLVIDO"
  | "PAGO"
  | "CANCELADO"
  | "FINALIZADO";

export interface Marketplace {
  id: string;
  titulo: string;
  freteParte: boolean;
  createdAt: string;
}

export interface Pagamento {
  id: string;
  valor: number;
  data: string;
  nfVenda: string;
  vendaId: string;
  numeroParcela: number;
  comissaoRetida?: number | null;
}

export interface Reembolso {
  id: string;
  data: string;
  nfVenda: string;
  loja: string;
  valor: number;
  parcelaPaga: number;
  vendaId: string;
}

export interface Devolucao {
  id: string;
  data: string;
  nfVenda: string;
  valorBase: number;
  numeroDevolucao: string;
  valor: number;
  saldo: number;
  tratativa: string;
  motivo: string;
  loja: string;
  vendaId: string;
  venda?: Venda;
}

export interface Venda {
  id: string;
  nf: string;
  loja: string;
  baseIcms: number;
  liquidoReceber: number;
  comissaoVenda: number | null;
  comissaoFrete: number | null;
  frete_e_taxas: number | null;
  desconto: number | null;
  status: VendaStatus;
  marketplaceId: string;
  marketplace?: Marketplace;
  dataVenda: string;
  createdAt: string;
  qtdParcelas: number | null;
  pagamentos?: Pagamento[];
  reembolsos?: Reembolso[];
  devolucoes?: Devolucao[];
  fretePago: boolean;
  NumeroFatura: string | null;
}

// --- DTOs para Criação ---

export interface CreateVendaDTO {
  nf: string;
  loja: string;
  marketplaceId: string;
  baseIcms: number;
  dataVenda?: string;
  comissaoVenda?: number;
  comissaoFrete?: number;
  frete_e_taxas?: number;
  desconto?: number;
  qtdParcelas?: number | null;
  liquidoReceber?: number;
}

export interface CreatePagamentoDTO {
  valor: number;
  data: Date | string;
  nfVenda: string;
  numeroParcela?: number;
  loja?: string;
}

export interface CreateReembolsoDTO {
  valor: number;
  data: Date | string;
  nfVenda: string;
  parcelaPaga: number;
  loja?: string;
}

export interface CreateDevolucaoDTO {
  nfVenda: string;
  valorBase: number;
  numeroDevolucao: string;
  valor: number;
  saldo: number;
  tratativa: string;
  motivo: string;
  loja: string;
  data: Date | string;
}

export interface ImportResponse {
  count: number;
  message: string;
  skipped?: string[];
  duplicates?: string[];
}

// ==========================================
// SERVIÇOS
// ==========================================

export const marketplaceService = {
  getAll: () => api.get<Marketplace[]>("/marketplaces").then((res) => res.data),
  getById: (id: string) => api.get<Marketplace>(`/marketplaces/${id}`).then((res) => res.data),
  create: (titulo: string, freteParte: boolean) =>
    api.post<Marketplace>("/marketplaces", { titulo, freteParte }).then((res) => res.data),
  update: (id: string, data: { titulo: string; freteParte: boolean }) =>
    api.put<Marketplace>(`/marketplaces/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/marketplaces/${id}`),
};

export const vendaService = {
  getAll: () => api.get<Venda[]>("/vendas").then((res) => res.data),
  getById: (id: string) => api.get<Venda>(`/vendas/${id}`).then((res) => res.data),
  create: (data: CreateVendaDTO) => api.post<Venda>("/vendas", data).then((res) => res.data),
  update: (id: string, data: Partial<CreateVendaDTO>) =>
    api.put<Venda>(`/vendas/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/vendas/${id}`),
  
  importBulk: (vendas: CreateVendaDTO[]) =>
    api.post<ImportResponse>("/vendas/import", { vendas }).then((res) => res.data),
};

export const reembolsoService = {
  getAll: () => api.get<Reembolso[]>("/reembolsos").then((res) => res.data),
  create: (data: CreateReembolsoDTO) => api.post<Reembolso>("/reembolsos", data).then((res) => res.data),
  delete: (id: string) => api.delete(`/reembolsos/${id}`),
};

export const devolucaoService = {
  getAll: () => api.get<Devolucao[]>("/devolucoes").then((res) => res.data),
  create: (data: CreateDevolucaoDTO) => api.post<Devolucao>("/devolucoes", data).then((res) => res.data),
  delete: (id: string) => api.delete(`/devolucoes/${id}`),
};

export const transferenciaService = {
  importReembolsos: (reembolsos: CreateReembolsoDTO[]) =>
    api.post<ImportResponse>("/transferencias/import-reembolsos", reembolsos).then((res) => res.data),
    
  importDevolucoes: (devolucoes: CreateDevolucaoDTO[]) =>
    api.post<ImportResponse>("/transferencias/import-devolucoes", devolucoes).then((res) => res.data),

  getAllDevolucoes: () => 
    api.get<Devolucao[]>("/transferencias/devolucoes").then((res) => res.data),
    
  getDevolucaoById: (id: string) =>
    api.get<Devolucao>(`/transferencias/devolucoes/${id}`).then((res) => res.data),
    
  updateDevolucao: (id: string, data: Partial<CreateDevolucaoDTO>) =>
    api.put<Devolucao>(`/transferencias/devolucoes/${id}`, data).then((res) => res.data),
    
  deleteDevolucao: (id: string) => 
    api.delete(`/transferencias/devolucoes/${id}`),
};

export const pagamentoService = {
  getAll: () => api.get<Pagamento[]>("/pagamentos").then((res) => res.data),
  create: (data: CreatePagamentoDTO) => api.post<Pagamento>("/pagamentos", data).then((res) => res.data),
  importBulk: (pagamentos: CreatePagamentoDTO[]) =>
    api.post<ImportResponse>("/pagamentos/import", { pagamentos }).then((res) => res.data),
  delete: (id: string) => api.delete(`/pagamentos/${id}`),
};