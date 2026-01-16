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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Venda } from "@/types";

const formSchema = z.object({
  vendaId: z.string().min(1, "Selecione uma venda (NF)"),
  dataPagamento: z.string().min(1, "Data do pagamento é obrigatória"),
  valorPago: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
  metodoPagamento: z.string().optional(),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (pagamento: any) => void;
  vendasPendentes: Venda[]; // Lista de vendas para associar o pagamento
  pagamento?: any | null; // Caso seja edição
}

export const PagamentoModal = ({
  open,
  onOpenChange,
  onSave,
  vendasPendentes,
  pagamento,
}: PagamentoModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendaId: pagamento?.vendaId || "",
      dataPagamento: pagamento?.dataPagamento 
        ? new Date(pagamento.dataPagamento).toISOString().split("T")[0] 
        : new Date().toISOString().split("T")[0],
      valorPago: pagamento?.valorPago || 0,
      metodoPagamento: pagamento?.metodoPagamento || "Transferência",
      observacao: pagamento?.observacao || "",
    },
  });

  // Atualiza o formulário quando o pagamento para edição muda
  useEffect(() => {
    if (pagamento) {
      form.reset({
        vendaId: pagamento.vendaId,
        dataPagamento: new Date(pagamento.dataPagamento).toISOString().split("T")[0],
        valorPago: pagamento.valorPago,
        metodoPagamento: pagamento.metodoPagamento,
        observacao: pagamento.observacao,
      });
    }
  }, [pagamento, form]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        id: pagamento?.id || `pag-${Date.now()}`,
        ...data,
        dataPagamento: new Date(data.dataPagamento),
      };

      await onSave(payload);
      toast.success(pagamento ? "Pagamento atualizado!" : "Pagamento registrado!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  // Busca a venda selecionada para mostrar o valor esperado (valor líquido)
  const selectedVendaId = form.watch("vendaId");
  const selectedVenda = vendasPendentes.find(v => v.id === selectedVendaId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{pagamento ? "Editar" : "Novo"} Pagamento</DialogTitle>
          <DialogDescription>
            Associe o crédito recebido a uma Nota Fiscal de venda.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vendaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venda / NF Relacionada</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a NF" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendasPendentes.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.numeroNf} - (Líquido: R$ {v.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Crédito</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valorPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Recebido (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metodoPagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Recebimento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Transferência">Transferência / PIX</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Cartão">Cartão de Crédito</SelectItem>
                      <SelectItem value="Saldo Marketplace">Saldo Marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Lote 452, ajuste de frete..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedVenda && (
              <div className="p-3 bg-muted rounded-lg border border-dashed border-primary/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Esperado (Líquido):</span>
                  <span className="font-semibold text-primary">
                    R$ {selectedVenda.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {form.watch("valorPago") > 0 && (
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-muted-foreground">Diferença:</span>
                    <span className={form.watch("valorPago") >= selectedVenda.valorLiquido ? "text-green-600" : "text-red-600"}>
                      R$ {(form.watch("valorPago") - selectedVenda.valorLiquido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={isLoading}>
                {isLoading ? "Processando..." : "Registrar Pagamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};