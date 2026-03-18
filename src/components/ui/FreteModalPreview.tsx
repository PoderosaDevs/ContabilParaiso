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
import { Loader2, Truck } from "lucide-react";

interface PreviewProps {
  data: any[];
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean; // Adicionado para desativar o botão enquanto a API processa
}

export function FretePreviewModal({ data, onClose, onConfirm, loading }: PreviewProps) {
  return (
    <Dialog open onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Prévia da Importação de Faturas</DialogTitle>
              <DialogDescription>
                Revise as notas lidas na planilha antes de enviar para o processamento.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 sticky top-0 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700">NOTA FISCAL</th>
                    <th className="px-4 py-3 font-bold text-slate-700">FATURA</th>
                    <th className="px-4 py-3 font-bold text-slate-700">LOJA</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium font-mono">#{item.nf}</td>
                      <td className="px-4 py-3 text-slate-600">{item.fatura || "---"}</td>
                      <td className="px-4 py-3 text-xs font-semibold uppercase">{item.loja}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-500">
              {data.length} faturas prontas para processamento
            </span>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={loading || data.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirmar Importação
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}