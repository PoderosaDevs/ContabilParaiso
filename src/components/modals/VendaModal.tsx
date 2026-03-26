import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, 
  Calendar, 
  Download, 
  Filter,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const exportSchema = z.object({
  startDate: z.string().min(1, "Data inicial é obrigatória"),
  endDate: z.string().min(1, "Data final é obrigatória"),
  marketplaceId: z.string().default("all"),
  status: z.string().default("all"),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "Data inicial não pode ser maior que a final",
  path: ["endDate"],
});

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportVendasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (filters: ExportFormData) => Promise<void>;
  marketplaces: any[];
}

export const ExportVendasModal = ({
  open,
  onOpenChange,
  onExport,
  marketplaces,
}: ExportVendasModalProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      marketplaceId: "all",
      status: "all",
    },
  });

  const onSubmit = async (data: ExportFormData) => {
    setIsExporting(true);
    try {
      await onExport(data);
      setIsSuccess(true);
      toast.success("Dados extraídos com sucesso!");
    } catch (error) {
      toast.error("Falha ao gerar arquivo de exportação.");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    form.reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setIsSuccess(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden border-none shadow-2xl p-0">
        <div className="bg-slate-900 p-6 text-white transition-all">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {isSuccess ? "Exportação Concluída" : "Exportar Relatório"}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {isSuccess ? "Seu arquivo .CSV foi gerado com sucesso." : "Selecione os filtros para gerar sua planilha de vendas."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center text-center space-y-6 bg-white">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
              <Download className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Download pronto!</h3>
              <p className="text-slate-500 max-w-[300px]">
                O relatório foi processado com base nos filtros aplicados. O que deseja fazer agora?
              </p>
            </div>
            <div className="flex gap-3 w-full max-w-sm pt-4">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-slate-200 hover:bg-slate-50"
                onClick={handleReset}
              >
                <RefreshCcw className="w-4 h-4" /> Nova Consulta
              </Button>
              <Button 
                className="flex-1 gap-2 bg-slate-900 hover:bg-slate-800 text-white"
                onClick={handleClose}
              >
                <X className="w-4 h-4" /> Fechar Modal
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-white">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  O arquivo será gerado no formato <strong>.CSV</strong> contendo todos os detalhes de faturamento, taxas de marketplace e status de pagamento.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" /> Data Inicial
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-lg bg-slate-50 border-slate-200 focus:bg-white transition-all" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" /> Data Final
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-lg bg-slate-50 border-slate-200 focus:bg-white transition-all" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marketplaceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" /> Marketplace
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Todos os Canais</SelectItem>
                          {marketplaces.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" /> Status
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Todos os Status</SelectItem>
                          <SelectItem value="PAGO">✅ Pago</SelectItem>
                          <SelectItem value="PENDENTE">🕒 Pendente</SelectItem>
                          <SelectItem value="CANCELADO">🚫 Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-6 mt-6 border-t">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleClose}
                  className="hover:bg-slate-200 transition-colors"
                  disabled={isExporting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isExporting} 
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 shadow-lg shadow-blue-200 transition-all active:scale-95 min-w-[200px]"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extraindo Dados...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Gerar Relatório CSV
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};