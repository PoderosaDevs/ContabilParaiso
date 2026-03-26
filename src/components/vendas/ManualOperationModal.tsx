import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Banknote, 
  RotateCcw, 
  Loader2, 
  Calendar, 
  Hash, 
  Store,
  FileText,
  ClipboardList
} from "lucide-react";
import { Venda } from "@/services/api-routes";

const manualOperationSchema = z.object({
  nf: z.string().min(1, "NF é obrigatória"),
  loja: z.string().min(1, "Loja é obrigatória"),
  dataOperacao: z.string().min(1, "Data é obrigatória"),
  numeroDevolucao: z.string().optional(),
  parcelaPaga: z.coerce.number().optional(),
  totalParcelas: z.coerce.number().optional(),
  comissaoVenda: z.coerce.number().optional(),
  comissaoFrete: z.coerce.number().optional(),
  repasse: z.coerce.number().optional(),
  motivo: z.string().optional(),
  tratativa: z.string().optional(),
  valorDevolucao: z.coerce.number().optional(),
  baseIcms: z.coerce.number().min(0, "Valor inválido"),
  type: z.enum(["reembolso", "devolucao"]),
}).superRefine((data, ctx) => {
  if (data.type === "devolucao") {
    if (!data.numeroDevolucao || data.numeroDevolucao.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número de devolução é obrigatório",
        path: ["numeroDevolucao"],
      });
    }
    if (!data.motivo || data.motivo.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Motivo é obrigatório para devoluções",
        path: ["motivo"],
      });
    }
  }
});

type ManualOperationForm = z.infer<typeof manualOperationSchema>;

interface ManualOperationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "reembolso" | "devolucao";
  onSubmit: (data: ManualOperationForm) => Promise<void>;
  defaultData?: Venda | null;
}

export function ManualOperationModal({
  open,
  onOpenChange,
  type,
  onSubmit,
  defaultData,
}: ManualOperationModalProps) {
  const [loading, setLoading] = useState(false);
  const isRefund = type === "reembolso";

  const form = useForm<ManualOperationForm>({
    resolver: zodResolver(manualOperationSchema),
    defaultValues: {
      type: type,
      dataOperacao: new Date().toISOString().split("T")[0],
      nf: "",
      loja: "",
      baseIcms: 0,
      numeroDevolucao: "",
      motivo: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        type: type,
        dataOperacao: new Date().toISOString().split("T")[0],
        nf: defaultData?.nf || "",
        loja: defaultData?.loja || "",
        baseIcms: Number(defaultData?.baseIcms) || 0,
        repasse: isRefund ? Number(defaultData?.baseIcms) || 0 : 0,
        valorDevolucao: !isRefund ? Number(defaultData?.baseIcms) || 0 : 0,
        parcelaPaga: defaultData?.pagamentos?.length || 1,
        totalParcelas: defaultData?.qtdParcelas || 1,
        comissaoVenda: Number(defaultData?.comissaoVenda) || 0,
        comissaoFrete: Number(defaultData?.comissaoFrete) || 0,
        numeroDevolucao: "",
        motivo: "",
        tratativa: "",
      });
    }
  }, [open, defaultData, type, form, isRefund]);

  const config = {
    title: isRefund ? "Lançar Reembolso Manual" : "Lançar Devolução Manual",
    description: isRefund 
      ? "Registre um reembolso unitário preenchendo os dados de repasse." 
      : "Registre uma devolução unitária detalhando o motivo e valores.",
    Icon: isRefund ? Banknote : RotateCcw,
    colorClass: isRefund ? "bg-rose-600" : "bg-amber-600",
    accentText: isRefund ? "text-rose-600" : "text-amber-600",
  };

  const handleProcessSubmit = async (values: ManualOperationForm) => {
    setLoading(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className={`p-6 text-white ${config.colorClass}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <config.Icon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{config.title}</DialogTitle>
              <DialogDescription className="text-white/80">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleProcessSubmit)} className="p-6 bg-white space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase"><Hash className="w-3 h-3"/> NF / Pedido</FormLabel>
                    <FormControl><Input placeholder="Ex: 260515" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataOperacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase"><Calendar className="w-3 h-3"/> Data</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="loja"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase"><Store className="w-3 h-3"/> Loja / Marketplace</FormLabel>
                  <FormControl><Input placeholder="Ex: ÉPOCA BP" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="h-px bg-slate-100 w-full" />

            {isRefund ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="parcelaPaga" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase">Parcela Atual</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="totalParcelas" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase">Total Parcelas</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="comissaoVenda" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Com. Venda</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="comissaoFrete" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Com. Frete</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="repasse" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-[10px] uppercase font-bold ${config.accentText}`}>Valor Repasse</FormLabel>
                      <FormControl><Input className="border-rose-200 bg-rose-50/30 font-bold" type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <FormField
                  control={form.control}
                  name="numeroDevolucao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                        <ClipboardList className="w-3 h-3"/> N° de Devolução
                      </FormLabel>
                      <FormControl>
                        <Input className="border-amber-100" placeholder="Ex: DEV88291" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="motivo" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase">Motivo</FormLabel>
                      <FormControl><Input placeholder="Ex: Arrependimento" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tratativa" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase">Tratativa</FormLabel>
                      <FormControl><Input placeholder="Ex: Estorno Vale" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="baseIcms" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Base ICMS</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="valorDevolucao" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-[10px] uppercase font-bold ${config.accentText}`}>Valor Devolução</FormLabel>
                      <FormControl><Input className="border-amber-200 bg-amber-50/30 font-bold" type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 border-t gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className={`${config.colorClass} text-white min-w-[140px]`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                Confirmar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}