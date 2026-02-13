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
import { Trash2, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  onConfirm: () => void;
  loading: boolean;
  onRemoveItem: (index: number) => void;
}

export function ImportPreviewModal({
  open,
  onOpenChange,
  data,
  onConfirm,
  loading,
  onRemoveItem,
}: ImportPreviewModalProps) {
  
  // Calcula o total baseado apenas na BASE ICMS
  const totalBase = data.reduce((acc, item) => acc + (Number(item.baseIcms) || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    // Tenta formatar se vier como data ISO, senão retorna o texto original
    try {
        const date = new Date(dateString);
        if(!isNaN(date.getTime())) {
            return date.toLocaleDateString("pt-BR", { timeZone: 'UTC' });
        }
        return dateString;
    } catch {
        return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <DialogTitle>Conferência de Importação</DialogTitle>
                <DialogDescription>
                  Revise os dados (Nota, Data, Loja e Base ICMS).
                </DialogDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold">
                Total Base ICMS
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(totalBase)}
              </p>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                {data.length} itens
              </span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-900 w-[120px]">NF</TableHead>
                    <TableHead className="font-bold text-slate-900 w-[120px]">DATA</TableHead>
                    <TableHead className="font-bold text-slate-900">LOJA</TableHead>
                    <TableHead className="font-bold text-slate-900 text-right">BASE ICMS</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        {item.nf || <span className="text-red-500 font-bold">???</span>}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(item.dataVenda)}
                      </TableCell>
                      <TableCell className="uppercase text-slate-600">
                        {item.loja}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(item.baseIcms)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(idx)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading || data.length === 0}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              `Confirmar ${data.length} Itens`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}