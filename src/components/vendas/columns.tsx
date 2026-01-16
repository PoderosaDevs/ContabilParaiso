import { MoreHorizontal, Pencil, Trash2, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

// Recebe as funções de ação como parâmetros
export const getVendasColumns = (onEdit: (item: any) => void, onDelete: (id: string) => void) => [
  { 
    key: "nf", 
    header: "Nota Fiscal", 
    render: (v: any) => <span className="font-bold font-mono text-gray-700">{v.nf}</span>
  },
  { 
    key: "loja", 
    header: "Loja / Marketplace", 
    render: (v: any) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{v.loja}</span>
        <span className="text-xs text-muted-foreground">{v.marketplace?.titulo}</span>
      </div>
    ) 
  },
  { 
    key: "parcelas", 
    header: "Progresso", 
    render: (v: any) => {
      const total = v.qtdParcelas; 
      const pagas = v.pagamentos?.length || 0;
      
      if (total === null || total === undefined) {
        return (
           <Badge variant="outline" className="border-dashed border-gray-400 text-gray-500 bg-gray-50">
             {pagas} / ?
           </Badge>
        );
      }
      const isComplete = pagas >= total;
      return (
        <Badge variant="outline" className={`${isComplete ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
          {pagas}/{total}
        </Badge>
      );
    } 
  },
  { 
    key: "valor", 
    header: "Líquido", 
    render: (v: any) => (
      <span className="font-semibold text-gray-700">
        R$ {Number(v.liquidoReceber).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </span>
    )
  },
  { 
    key: "status", 
    header: "Status", 
    render: (v: any) => {
       const totalPago = v.pagamentos?.reduce((acc: number, p: any) => acc + Number(p.valor), 0) || 0;
       
       if (v.qtdParcelas === null) {
          return <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase">Aguardando</span>;
       }

       const isPaid = totalPago >= (Number(v.liquidoReceber) - 0.1);
       return isPaid 
          ? <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase">Concluído</span> 
          : <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full uppercase">Em Aberto</span>;
    }
  },
  { 
    key: "actions", 
    header: "Ações", 
    render: (item: any) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 border-gray-300">
            Ações <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="w-4 h-4 mr-2" /> Editar Venda
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => onDelete(item.id)}>
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
];