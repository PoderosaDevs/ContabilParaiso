import { AlertCircle, Trash2, CheckCircle2, WalletCards, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
  title?: string;
  loading?: boolean;
}

export const ImportPreviewModal = ({ 
  open, 
  onOpenChange, 
  data, 
  onRemoveItem, 
  onConfirm,
  title,
  loading = false
}: ImportPreviewModalProps) => {

  // Detecta pagamento verificando as chaves numeroParcela ou parcelaPaga
  const isPayment = data.length > 0 && ('numeroParcela' in data[0] || 'parcelaPaga' in data[0]);

  const formatCurrency = (value: number) => {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isPayment ? (
               <WalletCards className="text-blue-600 w-6 h-6" />
            ) : (
               <AlertCircle className="text-orange-500 w-6 h-6" />
            )}
            {title || `Conferência de Valores`} 
            <Badge variant="secondary" className="ml-2">{data.length} itens</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto border rounded-lg my-4 shadow-sm relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium text-slate-600">Processando registros...</span>
              </div>
            </div>
          )}

          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr className="divide-x border-b">
                <th className="p-3 text-left w-[120px]">NF</th>
                {isPayment ? (
                  <>
                    <th className="p-3 text-center">Parcela</th>
                    <th className="p-3 text-right">Valor Pago</th>
                    <th className="p-3 text-left">Info</th>
                  </>
                ) : (
                  <>
                    <th className="p-3 text-left">Loja</th>
                    <th className="p-3 text-right">Base ICMS</th>
                    <th className="p-3 text-right text-red-600">Com. Venda</th>
                    <th className="p-3 text-right text-red-600">Com. Frete</th>
                    <th className="p-3 text-right text-red-600">Desconto</th>
                    <th className="p-3 text-right font-bold bg-primary/5">Líquido Final</th>
                  </>
                )}
                <th className="p-3 text-center w-[80px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30 divide-x transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-700">{item.nf || item.nfVenda}</td>
                  {isPayment ? (
                    <>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                           {item.parcelaPaga || item.numeroParcela} / {item.numeroParcelas || item.totalParcelasDaVenda || "?"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-bold text-green-700">
                        {formatCurrency(item.valor)}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground italic">
                        Importação de recebimento
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 truncate max-w-[150px]" title={item.loja}>{item.loja}</td>
                      <td className="p-3 text-right">{formatCurrency(item.baseIcms)}</td>
                      <td className="p-3 text-right text-red-500">-{formatCurrency(item.comissaoVenda)}</td>
                      <td className="p-3 text-right text-red-500">-{formatCurrency(item.comissaoFrete)}</td>
                      <td className="p-3 text-right text-red-500">-{formatCurrency(item.desconto)}</td>
                      <td className="p-3 text-right font-bold text-green-600 bg-green-50/30">
                        {formatCurrency(item.liquidoReceber)}
                      </td>
                    </>
                  )}
                  <td className="p-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={loading}
                      onClick={() => onRemoveItem(idx)} 
                      className="text-destructive h-8 w-8 hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="gap-2 border-t pt-4 sm:justify-between">
          <div className="text-xs text-muted-foreground flex items-center">
             <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
             Valide os dados antes de confirmar o processamento.
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
             </Button>
             <Button 
               onClick={onConfirm} 
               disabled={loading || data.length === 0}
               className="bg-slate-900 hover:bg-slate-800 text-white px-6 min-w-[160px]"
             >
               {loading ? (
                 <>
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Salvando...
                 </>
               ) : (
                 `Confirmar ${data.length} ${isPayment ? "Pagamentos" : "Vendas"}`
               )}
             </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};