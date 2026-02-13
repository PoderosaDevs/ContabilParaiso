import api from "./api";

// ==========================================
// TIPAGENS (INTERFACES)
// ==========================================

// Atualizado com os status que definimos na lógica visual e no Prisma
export type VendaStatus = "PENDENTE" | "PARCIALMENTE_PAGO" | "PAGO" | "CANCELADO";

export interface Marketplace {
  id: string;
  titulo: string;
  createdAt: string;
}

export interface Pagamento {
  id: string;
  valor: number | string; // Pode vir string do Decimal do banco, front trata
  data: string;
  nfVenda: string;
  vendaId: string;
  numeroParcela: number;
  // Campos opcionais de auditoria se você adicionou no banco
  comissaoRetida?: number | null; 
}

export interface Venda {
  id: string;
  nf: string;
  loja: string;
  baseIcms: number; // Valor Bruto
  liquidoReceber: number; // Valor Líquido (calculado ou previsto)
  
  comissaoVenda: number | null;
  comissaoFrete: number | null;
  desconto: number | null;
  
  status: VendaStatus; 
  
  marketplaceId: string;
  marketplace?: Marketplace;
  
  dataVenda: string; // <-- Importante: Data real da venda (Excel)
  createdAt: string; // Data de registro no sistema
  
  qtdParcelas: number | null;
  
  // <-- CRUCIAL: Array de pagamentos para calcular a barra de progresso
  pagamentos?: Pagamento[]; 
}

// DTO para CRIAR uma venda (Manual ou Importação)
export interface CreateVendaDTO {
  nf: string;
  loja: string;
  marketplaceId?: string | null; // Pode ser null se não mapeou ainda
  baseIcms: number;
  dataVenda?: string; // Data vinda da planilha
  
  comissaoVenda?: number;
  comissaoFrete?: number;
  desconto?: number;
  qtdParcelas?: number | null;
  liquidoReceber?: number;
}

// DTO Flexível: Aceita tanto o padrão do banco quanto os nomes da Planilha de Pagamentos
export interface CreatePagamentoDTO {
  // --- Campos Padrão (API) ---
  valor?: number;
  data?: Date | string;
  nfVenda?: string; 
  numeroParcela?: number;
  
  // --- Campos da Planilha (Importação) ---
  // Adicionamos aqui para o TS aceitar o objeto `paymentPreviewData` direto
  nota?: string;           // Vira nfVenda
  repasse?: number;        // Vira valor
  parcelaPaga?: number;    // Vira numeroParcela
  parcelas?: number;       // Vira qtdParcelas (update na venda)
  comissaoVenda?: number;  // Para auditoria/update
  comissaoFrete?: number;  // Para auditoria/update
  baseIcms?: number;       // Para validação
  loja?: string;
}

export interface ImportResponse {
  count: number;
  message: string;
  processados?: number;
  falhas?: string[]; // Lista NFs que deram erro
  duplicates?: string[]; // Lista NFs/Parcelas duplicadas
}

// ==========================================
// SERVIÇOS
// ==========================================

export const marketplaceService = {
  getAll: () => api.get<Marketplace[]>("/marketplaces").then((res) => res.data),
  getById: (id: string) =>
    api.get<Marketplace>(`/marketplaces/${id}`).then((res) => res.data),
  create: (titulo: string) =>
    api.post<Marketplace>("/marketplaces", { titulo }).then((res) => res.data),
  update: (id: string, titulo: string) =>
    api.put<Marketplace>(`/marketplaces/${id}`, { titulo }).then((res) => res.data),
  delete: (id: string) => api.delete(`/marketplaces/${id}`),
};

export const vendaService = {
  // Busca todas as vendas (incluindo pagamentos para a tabela rica)
  getAll: () => api.get<Venda[]>("/vendas").then((res) => res.data),
  
  getById: (id: string) =>
    api.get<Venda>(`/vendas/${id}`).then((res) => res.data),
  
  create: (data: CreateVendaDTO) => 
    api.post<Venda>("/vendas", data).then((res) => res.data),
  
  // Importação em Massa de Vendas
  importBulk: (vendas: CreateVendaDTO[]) =>
    api.post<ImportResponse>("/vendas/import", { vendas }).then((res) => res.data),
    
  update: (id: string, data: Partial<CreateVendaDTO>) =>
    api.put<Venda>(`/vendas/${id}`, data).then((res) => res.data),
  
  delete: (id: string) => api.delete(`/vendas/${id}`),
};

export const pagamentoService = {
  getAll: () => api.get<Pagamento[]>("/pagamentos").then((res) => res.data),
  
  create: (data: CreatePagamentoDTO) =>
    api.post<Pagamento>("/pagamentos", data).then((res) => res.data),

  // Importação em Massa de Pagamentos (Aceita o array do Excel)
  importBulk: (pagamentos: CreatePagamentoDTO[]) =>
    api.post<ImportResponse>("/pagamentos/import", { pagamentos }).then((res) => res.data),

  update: (id: string, data: Partial<CreatePagamentoDTO>) =>
    api.put<Pagamento>(`/pagamentos/${id}`, data).then((res) => res.data),
    
  delete: (id: string) => api.delete(`/pagamentos/${id}`),
};