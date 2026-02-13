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
import { Trash2, FileSpreadsheet, Loader2, Coins } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  onConfirm: () => void;
  loading: boolean;
  onRemoveItem: (index: number) => void;
}

export function PaymentImportModal({
  open,
  onOpenChange,
  data,
  onConfirm,
  loading,
  onRemoveItem,
}: PaymentImportModalProps) {
  
  // Cálculo de totais para conferência rápida
  const totals = data.reduce((acc, item) => ({
    repasse: acc.repasse + (Number(item.repasse) || 0),
    comissao: acc.comissao + (Number(item.comissaoVenda) || 0)
  }), { repasse: 0, comissao: 0 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-6xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Coins className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle>Importação de Pagamentos/Repasses</DialogTitle>
                <DialogDescription>
                  Confirme os valores de repasse e comissões antes de processar.
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Repasse</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(totals.repasse)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Comissões</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(totals.comissao)}</p>
              </div>
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
                    <TableHead className="font-bold text-center">PARCELA</TableHead>
                    <TableHead className="font-bold text-right text-blue-600">REPASSE</TableHead>
                    <TableHead className="font-bold text-right">COM. VENDA</TableHead>
                    <TableHead className="font-bold text-right">COM. FRETE</TableHead>
                    <TableHead className="font-bold text-right">BASE ICMS</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50">
                      <TableCell className="font-medium font-mono">{item.nota}</TableCell>
                      <TableCell className="text-xs uppercase">{item.loja}</TableCell>
                      <TableCell className="text-center text-xs">
                        {item.parcelaPaga} / {item.parcelas}
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        {formatCurrency(item.repasse)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.comissaoVenda)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.comissaoFrete)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.baseIcms)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(idx)}
                          className="h-8 w-8 hover:text-red-600"
                        >
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
            <span className="text-sm font-medium text-slate-500">
              {data.length} registros prontos para processar
            </span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading || data.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar Pagamentos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}