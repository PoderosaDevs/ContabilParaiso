import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Loader2, Banknote, RotateCcw, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mapeamento de Motivos conforme as imagens fornecidas
const MOTIVOS_MAP: Record<number, string> = {
  1: "ARREPENDIMENTO", 2: "AVARIA", 3: "CANCELADO POR NÓS", 4: "CLIENTE COMPROU ERRADO",
  5: "DESISTÊNCIA CLIENTE", 6: "DESISTÊNCIA DO CLIENTE", 7: "ETIQUETA TROCADA",
  8: "FALHA NA ENTREGA", 9: "FALHA NA OPERAÇÃO", 10: "IRREGULARIDADES NA OPERAÇÃO",
  11: "ITEM AVARIADO", 12: "ITEM FALTANTE", 13: "ITEM INCORRETO", 14: "ITEM TROCADO",
  15: "LÍQUIDO DERRAMADO", 16: "NÃO IDENTIFICADO", 17: "ORIGINALIDADE",
  18: "PEDIDO ERRADO", 19: "TROCA DE ETIQUETA"
};

interface OperationImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  onConfirm: () => void;
  loading: boolean;
  onRemoveItem: (index: number) => void;
  type: 'reembolso' | 'devolucao'; // Define o comportamento do modal
}

export function OperationImportModal({ 
  open, 
  onOpenChange, 
  data, 
  onConfirm, 
  loading, 
  onRemoveItem,
  type 
}: OperationImportModalProps) {
  
  // Configurações dinâmicas baseadas no tipo
  const isRefund = type === 'reembolso';
  
  const config = {
    title: isRefund ? "Importação de Reembolsos" : "Importação de Devoluções",
    description: isRefund ? "Revise os valores que serão debitados." : "Confirme as notas que retornaram ao estoque.",
    labelTotal: isRefund ? "Total a Reembolsar" : "Total em Devolução",
    btnConfirm: isRefund ? "Confirmar Reembolsos" : "Confirmar Devoluções",
    colorClass: isRefund ? "bg-rose-50/50" : "bg-amber-50/50",
    iconClass: isRefund ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600",
    textClass: isRefund ? "text-rose-700" : "text-amber-700",
    accentClass: isRefund ? "text-rose-600" : "text-amber-600",
    btnClass: isRefund ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700",
    Icon: isRefund ? Banknote : RotateCcw
  };

  const totalValue = data.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  const formatCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-6xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className={`px-6 py-4 border-b ${config.colorClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${config.iconClass}`}>
                <config.Icon className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle>{config.title}</DialogTitle>
                <DialogDescription>{config.description}</DialogDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{config.labelTotal}</p>
              <p className={`text-lg font-bold ${config.textClass}`}>{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-bold">NOTA</TableHead>
                    <TableHead className="font-bold">LOJA</TableHead>
                    <TableHead className="font-bold">DATA</TableHead>
                    <TableHead className="font-bold">MOTIVO</TableHead>
                    <TableHead className={`font-bold text-right ${config.accentClass}`}>VALOR</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50">
                      <TableCell className="font-medium font-mono">#{item.nota}</TableCell>
                      <TableCell className="text-xs uppercase font-semibold">{item.loja}</TableCell>
                      <TableCell className="text-xs">
                         <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.data}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] px-2 py-1 rounded font-bold border ${isRefund ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                          {MOTIVOS_MAP[item.motivo] || `ID ${item.motivo}`}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${config.accentClass}`}>
                        {formatCurrency(item.valor)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => onRemoveItem(idx)} className="h-8 w-8 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-slate-50">
          <div className="mr-auto self-center">
            <span className="text-sm font-medium text-slate-500">{data.length} itens detectados</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading || data.length === 0} 
            className={`${config.btnClass} text-white transition-all active:scale-95`}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : config.btnConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}