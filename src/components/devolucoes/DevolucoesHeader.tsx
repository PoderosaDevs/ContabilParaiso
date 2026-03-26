import { 
  Search, ChevronDown, FileSpreadsheet, X, Calendar as CalendarIcon, Filter, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface DevolucoesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  marketplaceFilter: string;
  onMarketplaceFilterChange: (value: string) => void;
  marketplaces: any[];
  statusFilter: string[];
  onStatusFilterChange: (values: string[]) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onClearFilters: () => void;
  onExportClick: () => void;
}

const DEVOLUCAO_STATUS = [
  { value: "DEVOLVIDO", label: "Devolvido", icon: "↩️" },
  { value: "PARCIALMENTE_DEVOLVIDO", label: "Parcial. Devolvido", icon: "📦" },
];

export const DevolucoesHeader = ({ 
  search, onSearchChange, marketplaceFilter, onMarketplaceFilterChange, marketplaces,
  statusFilter, onStatusFilterChange, startDate, onStartDateChange, endDate, onEndDateChange,
  onClearFilters, onExportClick 
}: DevolucoesHeaderProps) => {

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    if (!startDate) onStartDateChange(firstDay);
    if (!endDate) onEndDateChange(lastDay);
  }, []);

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleStatusToggle = (status: string) => {
    const currentFilters = Array.isArray(statusFilter) ? statusFilter : [];
    const newFilters = currentFilters.includes(status)
      ? currentFilters.filter((s) => s !== status)
      : [...currentFilters, status];
    onStatusFilterChange(newFilters);
  };

  const validStatusSelected = Array.isArray(statusFilter) 
    ? statusFilter.filter(s => DEVOLUCAO_STATUS.some(opt => opt.value === s))
    : [];

  const activeStatusCount = validStatusSelected.length;
  
  const hasManualFilters = 
    activeStatusCount > 0 || 
    (marketplaceFilter && marketplaceFilter !== "all") || 
    (search && search.trim().length > 0);

  return (
    <div className="flex flex-col gap-4 w-full mb-6 text-slate-900">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Devoluções</h1>
          <p className="text-sm text-slate-500 font-medium">Análise de impacto e retorno de mercadorias</p>
        </div>
        
        <Button 
          onClick={onExportClick}
          className="bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-xl h-10 px-6 shadow-md transition-all active:scale-95 w-full lg:w-auto font-semibold"
        >
          <FileSpreadsheet className="w-4 h-4 mr-1" /> Exportar Dados
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full font-medium">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Buscar por NF, SKU ou Cliente..." 
            value={search} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="pl-10 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-semibold h-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full lg:w-auto justify-between rounded-lg border-slate-200 bg-slate-50 font-bold text-slate-800 hover:bg-slate-800 transition-colors h-10">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status</span>
                {activeStatusCount > 0 && (
                  <Badge className="ml-1 rounded-full bg-slate-900 text-white border-none text-[10px] h-5 w-5 flex items-center justify-center p-0">
                    {activeStatusCount}
                  </Badge>
                )}
              </div>
              <ChevronDown className="w-4 h-4 opacity-50 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 rounded-xl shadow-xl border-slate-100" align="start">
            <div className="space-y-1">
              <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Filtrar por Status</div>
              {DEVOLUCAO_STATUS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleStatusToggle(option.value)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all",
                    validStatusSelected.includes(option.value) 
                      ? "bg-slate-100 text-slate-900 font-bold" 
                      : "hover:bg-slate-50 text-slate-600 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                  <div className={cn(
                    "w-5 h-5 border rounded-md flex items-center justify-center transition-all",
                    validStatusSelected.includes(option.value) ? "bg-slate-900 border-slate-900 shadow-sm" : "border-slate-300 bg-white"
                  )}>
                    {validStatusSelected.includes(option.value) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select value={marketplaceFilter} onValueChange={onMarketplaceFilterChange}>
          <SelectTrigger className="w-full lg:w-[180px] rounded-lg border-slate-200 bg-slate-50 font-bold text-slate-800 hover:bg-slate-800 transition-colors h-10">
            <SelectValue placeholder="Marketplace" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-slate-100 font-medium">
            <SelectItem value="all">Todos Canais</SelectItem>
            {marketplaces.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 w-full lg:w-auto bg-slate-50 border border-slate-200 rounded-lg p-1 h-10">
          <div 
            onClick={() => startInputRef.current?.showPicker()}
            className="relative group lg:w-[130px] w-full h-8 flex items-center rounded-md hover:bg-white hover:shadow-sm transition-all cursor-pointer px-2"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
            <span className="ml-2 text-xs font-bold text-slate-800">
              {startDate ? formatDateDisplay(startDate) : "Início"}
            </span>
            <input 
              ref={startInputRef}
              type="date" 
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none [color-scheme:light]"
            />
          </div>

          <span className="text-slate-300 font-bold select-none">/</span>

          <div 
            onClick={() => endInputRef.current?.showPicker()}
            className="relative group lg:w-[130px] w-full h-8 flex items-center rounded-md hover:bg-white hover:shadow-sm transition-all cursor-pointer px-2"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
            <span className="ml-2 text-xs font-bold text-slate-800">
              {endDate ? formatDateDisplay(endDate) : "Fim"}
            </span>
            <input 
              ref={endInputRef}
              type="date" 
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none [color-scheme:light]"
            />
          </div>
        </div>

        {hasManualFilters && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClearFilters} 
            className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};