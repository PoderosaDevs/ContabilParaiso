import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface PreviewProps {
  data: any[];
  onClose: () => void;
  onConfirm: () => void;
}

export function FretePreviewModal({ data, onClose, onConfirm }: PreviewProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Prévia da Importação de Frete</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 border-b">
              <tr>
                <th className="p-3 text-left">NF</th>
                <th className="p-3 text-left">Fatura</th>
                <th className="p-3 text-left">Status de Validação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item, idx) => (
                <tr key={idx} className={!item.encontrado ? "bg-red-50" : item.jaPago ? "bg-amber-50" : ""}>
                  <td className="p-3 font-medium">{item.nf}</td>
                  <td className="p-3">{item.fatura || "---"}</td>
                  <td className="p-3">
                    {!item.encontrado ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>NF não encontrada</span>
                      </div>
                    ) : item.jaPago ? (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Já consta como pago</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pronto para pagar</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={onConfirm}
            disabled={!data.some(i => i.encontrado && !i.jaPago)}
          >
            Confirmar Pagamento de Fretes Válidos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}