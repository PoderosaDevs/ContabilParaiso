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
import { Trash2, Loader2, Coins } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface PaymentImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  onConfirm: (data: string) => void;
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
  const [dataRepasse, setDataRepasse] = useState(
    new Date().toISOString().split("T")[0],
  );

  const totals = data.reduce(
    (acc, item) => ({
      repasse: acc.repasse + (Number(item.repasse) || 0),
      comissao: acc.comissao + (Number(item.comissaoVenda) || 0),
    }),
    { repasse: 0, comissao: 0 },
  );

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
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  Total Repasse
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(totals.repasse)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  Total Comissões
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(totals.comissao)}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative flex flex-col min-h-0">
          {loading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="mt-2 text-sm font-semibold text-slate-700 animate-pulse">
                Processando registros, por favor aguarde...
              </p>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead className="font-bold">NOTA</TableHead>
                      <TableHead className="font-bold">LOJA</TableHead>
                      <TableHead className="font-bold text-center">
                        PARCELA
                      </TableHead>
                      <TableHead className="font-bold text-right text-blue-600">
                        REPASSE
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        COM. VENDA
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        COM. FRETE
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        FRETES E TARIFAS
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        BASE ICMS
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50">
                        <TableCell className="font-medium font-mono">
                          {item.nota}
                        </TableCell>
                        <TableCell className="text-xs uppercase">
                          {item.loja}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {item.parcelaPaga} / {item.parcelas}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-600">
                          {formatCurrency(item.repasse)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.comissaoVenda)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.comissaoFrete)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.frete_e_taxas)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(item.baseIcms)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveItem(idx)}
                            disabled={loading}
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
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-500">
              {data.length} registros prontos para processar
            </span>
          </div>

          <div className="flex flex-row items-center gap-1.5">
            <label
              htmlFor="data-repasse"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Data do Repasse
            </label>
            <input
              id="data-repasse"
              type="date"
              className="flex h-9 w-40 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              value={dataRepasse}
              onChange={(e) => setDataRepasse(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex-1 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              onClick={() => onConfirm(dataRepasse)}
              disabled={loading || data.length === 0 || !dataRepasse}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[180px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Pagamentos"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}