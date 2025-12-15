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
import { Repasse, Marketplace } from "@/types";

const formSchema = z.object({
  nf: z.string().min(1, "Número da NF é obrigatório"),
  marketplaceId: z.string().min(1, "Selecione um marketplace"),
  valorLiquido: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  dataRepasse: z.string().min(1, "Data é obrigatória"),
  status: z.enum(["recebido", "pendente"]),
});

type FormData = z.infer<typeof formSchema>;

interface RepasseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (repasse: Repasse) => void;
  marketplaces: Marketplace[];
  repasse?: Repasse | null;
}

export const RepasseModal = ({
  open,
  onOpenChange,
  onSave,
  marketplaces,
  repasse,
}: RepasseModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nf: repasse?.nf || "",
      marketplaceId: repasse?.marketplaceId || "",
      valorLiquido: repasse?.valorLiquido || 0,
      dataRepasse: repasse?.dataRepasse
        ? new Date(repasse.dataRepasse).toISOString().split("T")[0]
        : "",
      status: repasse?.status || "pendente",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    const newRepasse: Repasse = {
      id: repasse?.id || `repasse-${Date.now()}`,
      nf: data.nf,
      marketplaceId: data.marketplaceId,
      valorLiquido: data.valorLiquido,
      dataRepasse: new Date(data.dataRepasse),
      status: data.status,
    };

    onSave(newRepasse);
    toast.success(repasse ? "Repasse atualizado!" : "Repasse registrado!");
    form.reset();
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{repasse ? "Editar" : "Novo"} Repasse</DialogTitle>
          <DialogDescription>
            {repasse ? "Atualize os dados do repasse" : "Registre um novo repasse recebido"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nf"
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
              name="valorLiquido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Líquido (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dataRepasse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Repasse</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                      <SelectItem value="recebido">Recebido</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
