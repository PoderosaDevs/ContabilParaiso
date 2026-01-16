import { 
  Search, 
  ChevronDown, 
  Plus, 
  FileSpreadsheet, 
  FileUp, 
  UserPlus 
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
  onManualClick: () => void;
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const VendasHeader = ({ 
  search, 
  onSearchChange, 
  marketplaceFilter, 
  onMarketplaceFilterChange, 
  marketplaces, 
  onManualClick, 
  onImportExcel 
}: VendasHeaderProps) => {

  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center w-full mb-6">
      {/* Área de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:max-w-3xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar NF ou Marketplace..." 
            value={search} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="pl-10 rounded-xl h-10 border-slate-200 focus-visible:ring-blue-400"
          />
        </div>
        
        <Select value={marketplaceFilter} onValueChange={onMarketplaceFilterChange}>
          <SelectTrigger className="w-full sm:w-[220px] rounded-xl h-10 border-slate-200">
            <SelectValue placeholder="Filtrar por Marketplace" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Todos Marketplaces</SelectItem>
            {marketplaces.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botão de Ações Unificado */}
      <div className="flex gap-2 w-full lg:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-xl h-10 px-6 shadow-md shadow-slate-200 w-full lg:w-auto transition-all active:scale-95">
              Ações 
              <ChevronDown className="w-4 h-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-xl border-slate-100">
            {/* Seção Cadastro Manual */}
            <DropdownMenuItem 
              onClick={onManualClick} 
              className="rounded-lg cursor-pointer py-2.5 focus:bg-blue-50 focus:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-2 text-blue-500" /> 
              Nova Venda
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-1" />
            
            {/* Seção Planilhas */}
            <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Importação
            </div>
            
            {/* AMBOS OS BOTÕES USAM O MESMO INPUT ID */}
            <DropdownMenuItem className="rounded-lg cursor-pointer py-0 p-0 focus:bg-green-50 focus:text-green-700">
              <label htmlFor="universal-import-input" className="flex items-center w-full py-2.5 px-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> 
                Planilha de Vendas
              </label>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-lg cursor-pointer py-0 p-0 focus:bg-indigo-50 focus:text-indigo-700">
              <label htmlFor="universal-import-input" className="flex items-center w-full py-2.5 px-2 cursor-pointer">
                <FileUp className="w-4 h-4 mr-2 text-indigo-600" /> 
                Planilha de Pagamentos
              </label>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-1" />
            
            {/* Seção Pagamento Manual (Ainda placeholder, ou implementar modal depois) */}
            <DropdownMenuItem 
              disabled // Desabilitado por enquanto ou criar modal de pagamento manual
              className="rounded-lg cursor-pointer py-2.5 text-orange-600 font-medium focus:bg-orange-50 focus:text-orange-700 opacity-50"
            >
              <UserPlus className="w-4 h-4 mr-2" /> 
              Novo Pagamento (Em breve)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* INPUT ÚNICO MÁGICO */}
        <input 
          type="file" 
          id="universal-import-input" 
          className="hidden" 
          accept=".xlsx,.xls" 
          onChange={onImportExcel} 
          onClick={(e) => (e.target as HTMLInputElement).value = ""} // Permite selecionar o mesmo arquivo 2x seguidas
        />
      </div>
    </div>
  );
};