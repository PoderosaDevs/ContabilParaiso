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
import { Switch } from "@/components/ui/switch"; // Importar o Switch
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "@/components/ui/form";

// Schema atualizado
const formSchema = z.object({
  titulo: z.string().min(1, "O título é obrigatório"),
  freteParte: z.boolean().default(false), // Garante que comece como false
});

type FormData = z.infer<typeof formSchema>;

interface MarketplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Atualizei a tipagem do onSave para aceitar o novo campo
  onSave: (data: { titulo: string; freteParte: boolean }) => void; 
  marketplace?: any | null;
}

export const MarketplaceModal = ({
  open,
  onOpenChange,
  onSave,
  marketplace,
}: MarketplaceModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      titulo: "", 
      freteParte: false 
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        titulo: marketplace?.titulo || "",
        freteParte: !!marketplace?.freteParte, // Garante valor booleano
      });
    }
  }, [open, marketplace, form]);

  const onSubmit = async (data: FormData) => {
  setIsLoading(true);
  try {
    // Forçamos o tipo aqui, pois o Zod já garantiu a validade
    await onSave(data as { titulo: string; freteParte: boolean });
    onOpenChange(false);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {marketplace ? "Editar" : "Novo"} Marketplace
          </DialogTitle>
          <DialogDescription>
            Digite o nome do canal de venda e configurações de frete.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Marketplace</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mercado Livre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Novo campo Switch */}
            <FormField
              control={form.control}
              name="freteParte"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Frete a parte?</FormLabel>
                    <FormDescription>
                      Marque se o frete for cobrado separadamente.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-white"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};