import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Save, X, Loader2 } from "lucide-react";

interface DevolucaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  devolucao?: any | null;
}

export function DevolucaoModal({
  open,
  onOpenChange,
  onSave,
  devolucao,
}: DevolucaoModalProps) {
  const [loading, setLoading] = useState(false);

  // Estado inicial do formulário
  const defaultForm = {
    nf: "",
    loja: "",
    devolucao: "",
    data: new Date().toISOString().split("T")[0],
    tratativa: "",
    motivo: "",
    base: "",
    valor: "",
    saldo: "",
  };

  const [formData, setFormData] = useState(defaultForm);

  // Preenche o formulário se estiver editando, ou reseta se for novo
  useEffect(() => {
    if (open) {
      if (devolucao) {
        setFormData({
          nf: devolucao.nf || "",
          loja: devolucao.loja || "",
          devolucao: devolucao.devolucao || "",
          data: devolucao.data
            ? new Date(devolucao.data).toISOString().split("T")[0]
            : defaultForm.data,
          tratativa: devolucao.tratativa || "",
          motivo: devolucao.motivo || "",
          base: devolucao.base?.toString() || "",
          valor: devolucao.valor?.toString() || "",
          saldo: devolucao.saldo?.toString() || "",
        });
      } else {
        setFormData(defaultForm);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, devolucao]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Formata os dados numéricos antes de salvar
      const payload = {
        ...formData,
        base: Number(formData.base) || 0,
        valor: Number(formData.valor) || 0,
        saldo: Number(formData.saldo) || 0,
      };

      await onSave(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex flex-row items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shadow-sm">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-amber-900">
              {devolucao ? "Editar Devolução" : "Nova Devolução"}
            </DialogTitle>
            <DialogDescription className="text-amber-700/70">
              {devolucao
                ? "Atualize os dados desta devolução."
                : "Preencha os dados para registrar uma nova devolução manualmente."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* IDENTIFICAÇÃO */}
            <div className="space-y-2">
              <Label htmlFor="nf" className="text-xs font-bold text-slate-500 uppercase">
                Nota Fiscal (NF)
              </Label>
              <Input
                id="nf"
                name="nf"
                placeholder="Ex: 12345"
                value={formData.nf}
                onChange={handleChange}
                required
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="devolucao" className="text-xs font-bold text-slate-500 uppercase">
                Cód. Devolução
              </Label>
              <Input
                id="devolucao"
                name="devolucao"
                placeholder="Ex: DEV-9988"
                value={formData.devolucao}
                onChange={handleChange}
                className="font-mono text-amber-700 focus-visible:ring-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loja" className="text-xs font-bold text-slate-500 uppercase">
                Loja / Canal
              </Label>
              <Input
                id="loja"
                name="loja"
                placeholder="Ex: Mercado Livre"
                value={formData.loja}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data" className="text-xs font-bold text-slate-500 uppercase">
                Data
              </Label>
              <Input
                id="data"
                name="data"
                type="date"
                value={formData.data}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-slate-100 my-2"></div>

            {/* DETALHES */}
            <div className="space-y-2">
              <Label htmlFor="motivo" className="text-xs font-bold text-slate-500 uppercase">
                Motivo
              </Label>
              <Input
                id="motivo"
                name="motivo"
                placeholder="Ex: Arrependimento, Defeito..."
                value={formData.motivo}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tratativa" className="text-xs font-bold text-slate-500 uppercase">
                Tratativa
              </Label>
              <Input
                id="tratativa"
                name="tratativa"
                placeholder="Ex: Estorno, Vale Troca..."
                value={formData.tratativa}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-slate-100 my-2"></div>

            {/* FINANCEIRO */}
            <div className="space-y-2">
              <Label htmlFor="base" className="text-xs font-bold text-slate-500 uppercase">
                Valor Base (R$)
              </Label>
              <Input
                id="base"
                name="base"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.base}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor" className="text-xs font-bold text-rose-500 uppercase">
                Valor Devolvido (R$)
              </Label>
              <Input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.valor}
                onChange={handleChange}
                required
                className="border-rose-200 focus-visible:ring-rose-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saldo" className="text-xs font-bold text-slate-500 uppercase">
                Saldo Restante (R$)
              </Label>
              <Input
                id="saldo"
                name="saldo"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.saldo}
                onChange={handleChange}
              />
            </div>

          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="gap-2"
            >
              <X className="w-4 h-4" /> Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {devolucao ? "Salvar Alterações" : "Criar Devolução"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}