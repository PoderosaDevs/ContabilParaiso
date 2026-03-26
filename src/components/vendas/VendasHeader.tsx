import {
  Search,
  ChevronDown,
  FileSpreadsheet,
  FileUp,
  RotateCcw,
  Banknote,
  X,
  Calendar as CalendarIcon,
  Filter,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface VendasHeaderProps {
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
  onManualClick: () => void;
  onImportClick: (
    type: "venda" | "pagamento" | "reembolso" | "devolucao",
  ) => void;
}

const STATUS_OPTIONS = [
  { value: "PENDENTE", label: "Pendente", icon: "🕒" },
  { value: "PARCIALMENTE_PAGO", label: "Parcialmente Pago", icon: "🟠" },
  {
    value: "PARCIALMENTE_REEMBOLSADO",
    label: "Parcial. Reembolsado",
    icon: "💸",
  },
  {
    value: "PARCIALMENTE_CONTESTACAO",
    label: "Parcial. Contestação",
    icon: "⚠️",
  },
  { value: "PARCIALMENTE_DEVOLVIDO", label: "Parcial. Devolvido", icon: "📦" },
  { value: "REEMBOLSADO", label: "Reembolsado", icon: "💰" },
  { value: "CONTESTACAO", label: "Contestação", icon: "🚫" },
  { value: "DEVOLVIDO", label: "Devolvido", icon: "↩️" },
  { value: "PAGO", label: "Pago", icon: "✅" },
  { value: "CANCELADO", label: "Cancelado", icon: "❌" },
  { value: "FINALIZADO", label: "Finalizado", icon: "🏁" },
];

export const VendasHeader = ({
  search,
  onSearchChange,
  marketplaceFilter,
  onMarketplaceFilterChange,
  marketplaces,
  statusFilter,
  onStatusFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters,
  onManualClick,
  onImportClick,
}: VendasHeaderProps) => {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!startDate || !endDate) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      if (!startDate) onStartDateChange(firstDay);
      if (!endDate) onEndDateChange(lastDay);
    }
  }, []);

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleStatusToggle = (status: string) => {
    const newFilters = statusFilter.includes(status)
      ? statusFilter.filter((s) => s !== status)
      : [...statusFilter, status];
    onStatusFilterChange(newFilters);
  };

  const hasActiveFilters =
    statusFilter.length > 0 || marketplaceFilter !== "all";

  return (
    <div className="flex flex-col gap-4 w-full mb-6 text-slate-900">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Gerenciamento de Vendas
        </h1>

        <div className="flex gap-2 w-full lg:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-xl h-10 px-6 shadow-md transition-all active:scale-95">
                Ações <ChevronDown className="w-4 h-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 rounded-xl p-2 shadow-xl border-slate-100"
            >
              <DropdownMenuItem
                onClick={onManualClick}
                className="cursor-pointer py-2.5"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-500" />{" "}
                Exportar Vendas
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Importação de Arquivos
              </div>
              <DropdownMenuItem
                onClick={() => onImportClick("venda")}
                className="cursor-pointer py-2.5"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />{" "}
                Planilha de Vendas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onImportClick("pagamento")}
                className="cursor-pointer py-2.5"
              >
                <FileUp className="w-4 h-4 mr-2 text-indigo-600" /> Planilha de
                Pagamentos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onImportClick("reembolso")}
                className="cursor-pointer py-2.5"
              >
                <Banknote className="w-4 h-4 mr-2 text-rose-500" /> Planilha de
                Reembolso
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onImportClick("devolucao")}
                className="cursor-pointer py-2.5"
              >
                <RotateCcw className="w-4 h-4 mr-2 text-amber-600" /> Planilha
                de Devolução
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full font-medium">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por NF, Loja..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-800"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full lg:w-auto justify-between rounded-lg border-slate-200 bg-slate-50 font-semibold text-slate-800 hover:bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status</span>
                {statusFilter.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-md bg-slate-900 text-white border-none text-[10px]"
                  >
                    {statusFilter.length}
                  </Badge>
                )}
              </div>
              <ChevronDown className="w-4 h-4 opacity-50 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 rounded-xl" align="start">
            <div className="p-2 space-y-1">
              {STATUS_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleStatusToggle(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-sm transition-colors",
                    statusFilter.includes(option.value)
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "hover:bg-slate-50 text-slate-600",
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center transition-all",
                      statusFilter.includes(option.value)
                        ? "bg-slate-900 border-slate-900"
                        : "border-slate-300",
                    )}
                  >
                    {statusFilter.includes(option.value) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span>
                    {option.icon} {option.label}
                  </span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select
          value={marketplaceFilter}
          onValueChange={onMarketplaceFilterChange}
        >
          <SelectTrigger className="w-full lg:w-[180px] rounded-lg border-slate-200 bg-slate-50 font-semibold text-slate-800">
            <SelectValue placeholder="Marketplace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Canais</SelectItem>
            {marketplaces.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Campo Data Início */}
          <div
            onClick={() => startInputRef.current?.showPicker()}
            className="relative group lg:w-[145px] w-full h-9 flex items-center bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CalendarIcon className="ml-2.5 w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
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

          <span className="text-slate-300 font-bold">/</span>

          {/* Campo Data Fim */}
          <div
            onClick={() => endInputRef.current?.showPicker()}
            className="relative group lg:w-[145px] w-full h-9 flex items-center bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CalendarIcon className="ml-2.5 w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
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

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearFilters}
            className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
