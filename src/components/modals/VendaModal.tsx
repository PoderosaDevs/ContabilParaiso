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
import { Venda, Marketplace } from "@/types";

const formSchema = z.object({
  numeroNf: z.string().min(1, "Número da NF é obrigatório"),
  marketplaceId: z.string().min(1, "Selecione um marketplace"),
  dataVenda: z.string().min(1, "Data é obrigatória"),
  baseIcms: z.coerce.number().min(0, "Valor deve ser positivo"),
  comissao: z.coerce.number().min(0, "Valor deve ser positivo"),
  comissaoFrete: z.coerce.number().min(0, "Valor deve ser positivo"),
  descontos: z.coerce.number().min(0, "Valor deve ser positivo"),
  status: z.enum(["pendente", "pago", "cancelado"]),
});

type FormData = z.infer<typeof formSchema>;

interface VendaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (venda: Venda) => void;
  marketplaces: Marketplace[];
  venda?: Venda | null;
}

export const VendaModal = ({
  open,
  onOpenChange,
  onSave,
  marketplaces,
  venda,
}: VendaModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroNf: venda?.numeroNf || "",
      marketplaceId: venda?.marketplaceId || "",
      dataVenda: venda?.dataVenda ? new Date(venda.dataVenda).toISOString().split("T")[0] : "",
      baseIcms: venda?.baseIcms || 0,
      comissao: venda?.comissao || 0,
      comissaoFrete: venda?.comissaoFrete || 0,
      descontos: venda?.descontos || 0,
      status: venda?.status || "pendente",
    },
  });

  const baseIcms = form.watch("baseIcms") || 0;
  const comissao = form.watch("comissao") || 0;
  const comissaoFrete = form.watch("comissaoFrete") || 0;
  const descontos = form.watch("descontos") || 0;
  const valorLiquido = baseIcms - comissao - comissaoFrete - descontos;

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    const newVenda: Venda = {
      id: venda?.id || `venda-${Date.now()}`,
      numeroNf: data.numeroNf,
      marketplaceId: data.marketplaceId,
      dataVenda: new Date(data.dataVenda),
      baseIcms: data.baseIcms,
      comissao: data.comissao,
      comissaoFrete: data.comissaoFrete,
      descontos: data.descontos,
      valorLiquido: data.baseIcms - data.comissao - data.comissaoFrete - data.descontos,
      status: data.status,
    };

    onSave(newVenda);
    toast.success(venda ? "Venda atualizada!" : "Venda criada!");
    form.reset();
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{venda ? "Editar" : "Nova"} Venda</DialogTitle>
          <DialogDescription>
            {venda ? "Atualize os dados da venda" : "Preencha os dados para registrar uma nova venda"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numeroNf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº NF</FormLabel>
                    <FormControl>
                      <Input placeholder="NF-000001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataVenda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Venda</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Marketplace</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {marketplaces.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
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
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="baseIcms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base ICMS (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comissão (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="comissaoFrete"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comissão Frete (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descontos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descontos (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor Líquido:</span>
                <span className="text-lg font-bold text-primary">
                  R$ {valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
