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
import { useState } from "react";

interface OperationImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  onConfirm: (dataRepasse: string) => void;
  loading: boolean;
  onRemoveItem: (index: number) => void;
  type: "reembolso" | "devolucao";
}

export function OperationImportModal({
  open,
  onOpenChange,
  data,
  onConfirm,
  loading,
  onRemoveItem,
  type,
}: OperationImportModalProps) {
  const [dataRepasse, setDataRepasse] = useState(
    new Date().toISOString().split("T")[0],
  );
  const isRefund = type === "reembolso";

  const config = {
    title: isRefund ? "Importação de Reembolsos" : "Importação de Devoluções",
    description: isRefund
      ? "Confirme os valores de repasse e comissões do reembolso."
      : "Confirme os dados e motivos das devoluções.",
    labelTotal: isRefund ? "Total Repasse" : "Total Devolução",
    btnConfirm: "Avançar para Vínculo",
    colorClass: isRefund ? "bg-rose-50/50" : "bg-amber-50/50",
    iconClass: isRefund
      ? "bg-rose-100 text-rose-600"
      : "bg-amber-100 text-amber-600",
    textClass: isRefund ? "text-rose-700" : "text-amber-700",
    accentClass: isRefund ? "text-rose-600" : "text-amber-600",
    btnClass: isRefund
      ? "bg-rose-600 hover:bg-rose-700"
      : "bg-amber-600 hover:bg-amber-700",
    Icon: isRefund ? Banknote : RotateCcw,
  };

  const totalValue = data.reduce((acc, item) => {
    const val = isRefund ? (item.repasse ?? 0) : (item.valor ?? 0);
    return acc + (Number(val) || 0);
  }, 0);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

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
              <p className="text-[10px] text-muted-foreground uppercase font-bold">
                {config.labelTotal}
              </p>
              <p className={`text-lg font-bold ${config.textClass}`}>
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-100">
                  {isRefund ? (
                    <TableRow>
                      <TableHead className="font-bold">NOTA</TableHead>
                      <TableHead className="font-bold">LOJA</TableHead>
                      <TableHead className="font-bold text-center">
                        PARCELA
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        BASE ICMS
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        COM. VENDA
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        COM. FRETE
                      </TableHead>
                      <TableHead
                        className={`font-bold text-right ${config.accentClass}`}
                      >
                        REPASSE
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableHead className="font-bold">NF</TableHead>
                      <TableHead className="font-bold">LOJA</TableHead>
                      <TableHead className="font-bold text-center">
                        DEVOLUÇÃO
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        TRATATIVA
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        MOTIVO
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        BASE
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        SALDO
                      </TableHead>
                      <TableHead
                        className={`font-bold text-right ${config.accentClass}`}
                      >
                        VALOR
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {data.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50">
                      {isRefund ? (
                        <>
                          <TableCell className="font-medium font-mono">
                            #{item.nota}
                          </TableCell>
                          <TableCell className="text-xs uppercase font-semibold">
                            {item.loja}
                          </TableCell>
                          <TableCell className="text-center text-xs whitespace-nowrap">
                            {item.parcelaPaga} / {item.parcelas}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(item.baseIcms)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.comissaoVenda)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.comissaoFrete)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${config.accentClass}`}
                          >
                            {formatCurrency(item.repasse)}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium font-mono">
                            #{item.nf}
                          </TableCell>
                          <TableCell className="text-xs uppercase font-semibold">
                            {item.loja}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {item.devolucao || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-[10px] px-2 py-1 rounded font-bold border bg-slate-100 text-slate-700">
                              {item.tratativa}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-[10px] px-2 py-1 rounded font-bold border bg-amber-100 text-amber-800 border-amber-200">
                              {item.motivo}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(item.baseIcms)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.saldo)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${config.accentClass}`}
                          >
                            {formatCurrency(item.valor)}
                          </TableCell>
                        </>
                      )}
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

        <DialogFooter className="p-4 border-t bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-500">
              {data.length} itens detectados
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 border-x px-4">
            <label
              htmlFor="data-op"
              className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Data
            </label>
            <input
              id="data-op"
              type="date"
              className="h-8 w-36 rounded border bg-white px-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
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
              className={`${config.btnClass} text-white transition-all active:scale-95`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {config.btnConfirm}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
