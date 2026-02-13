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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Venda } from "@/types";

const formSchema = z.object({
  nf: z.string().min(1, "Nota Fiscal é obrigatória"),
  dataVenda: z.string().min(1, "Data é obrigatória"),
  baseIcms: z.coerce.number().min(0.01, "Valor base deve ser maior que zero"),
  loja: z.string().min(1, "O nome da loja é obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

interface VendaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FormData) => Promise<void>;
  venda?: Venda | null;
}

export const VendaModal = ({
  open,
  onOpenChange,
  onSave,
  venda,
}: VendaModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nf: "",
      dataVenda: "",
      baseIcms: 0,
      loja: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nf: venda?.nf || "",
        // Formata a data para YYYY-MM-DD para o input HTML funcionar corretamente
        dataVenda: venda?.dataVenda 
          ? new Date(venda.dataVenda).toISOString().split('T')[0] 
          : "",
        baseIcms: venda?.baseIcms || 0,
        loja: venda?.loja || "",
      });
    }
  }, [venda, open, form]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{venda ? "Editar" : "Nova"} Venda</DialogTitle>
          <DialogDescription>
            Insira os dados da nota fiscal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Linha 1: Nota e Data */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NOTA</FormLabel>
                    <FormControl>
                      <Input placeholder="Nº Nota" {...field} />
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
                    <FormLabel>DATA VENDA</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 2: Base ICMS e Loja */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="baseIcms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BASE ICMS (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LOJA</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da Loja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};