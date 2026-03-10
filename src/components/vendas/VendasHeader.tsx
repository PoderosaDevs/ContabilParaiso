import { 
  Search, 
  ChevronDown, 
  Plus, 
  FileSpreadsheet, 
  FileUp,
  RotateCcw, // Ícone para Devolução
  Banknote,  // Ícone para Reembolso
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface VendasHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  marketplaceFilter: string;
  onMarketplaceFilterChange: (value: string) => void;
  marketplaces: any[];
  
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onClearFilters: () => void;

  onManualClick: () => void;
  // ATUALIZADO: Adicionado 'reembolso' e 'devolucao' na tipagem
  onImportClick: (type: 'venda' | 'pagamento' | 'reembolso' | 'devolucao') => void;
}

export const VendasHeader = ({ 
  search, onSearchChange, 
  marketplaceFilter, onMarketplaceFilterChange, marketplaces,
  statusFilter, onStatusFilterChange,
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  onClearFilters,
  onManualClick, onImportClick 
}: VendasHeaderProps) => {

  const hasActiveFilters = statusFilter !== "all" || startDate !== "" || endDate !== "" || marketplaceFilter !== "all";

  return (
    <div className="flex flex-col gap-4 w-full mb-6">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
         <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gerenciamento de Vendas</h1>
         
         <div className="flex gap-2 w-full lg:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-xl h-10 px-6 shadow-md shadow-slate-200 w-full lg:w-auto transition-all active:scale-95">
                  Ações <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-xl border-slate-100">
                <DropdownMenuItem onClick={onManualClick} className="cursor-pointer py-2.5">
                  <Plus className="w-4 h-4 mr-2 text-blue-500" /> Nova Venda
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-1" />
                <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Importação</div>
                
                <DropdownMenuItem onClick={() => onImportClick('venda')} className="cursor-pointer py-2.5">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Planilha de Vendas
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onImportClick('pagamento')} className="cursor-pointer py-2.5">
                  <FileUp className="w-4 h-4 mr-2 text-indigo-600" /> Planilha de Pagamentos
                </DropdownMenuItem>

                {/* ATUALIZADO: Reembolso com tipo correto e ícone apropriado */}
                <DropdownMenuItem onClick={() => onImportClick('reembolso')} className="cursor-pointer py-2.5">
                  <Banknote className="w-4 h-4 mr-2 text-rose-500" /> Planilha de Reembolso
                </DropdownMenuItem>

                {/* ATUALIZADO: Devolução com tipo correto e ícone apropriado */}
                <DropdownMenuItem onClick={() => onImportClick('devolucao')} className="cursor-pointer py-2.5">
                  <RotateCcw className="w-4 h-4 mr-2 text-amber-600" /> Planilha de Devolução
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </div>

      {/* Barra de Filtros (Mantida como original) */}
      <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por NF, Loja..." 
            value={search} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="pl-10 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full lg:w-[160px] rounded-lg border-slate-200 bg-slate-50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="PENDENTE">🕒 Pendente</SelectItem>
            <SelectItem value="PARCIALMENTE_PAGO">🟠 Parcial</SelectItem>
            <SelectItem value="PAGO">✅ Pago</SelectItem>
            <SelectItem value="CANCELADO">🚫 Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={marketplaceFilter} onValueChange={onMarketplaceFilterChange}>
          <SelectTrigger className="w-full lg:w-[180px] rounded-lg border-slate-200 bg-slate-50">
            <SelectValue placeholder="Marketplace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Canais</SelectItem>
            {marketplaces.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 w-full lg:w-auto">
            <Input 
                type="date" 
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full lg:w-auto rounded-lg border-slate-200 bg-slate-50 text-xs"
            />
            <span className="text-slate-400">-</span>
            <Input 
                type="date" 
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full lg:w-auto rounded-lg border-slate-200 bg-slate-50 text-xs"
            />
        </div>

        {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={onClearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Limpar Filtros">
                <X className="w-4 h-4" />
            </Button>
        )}
      </div>
    </div>
  );
};