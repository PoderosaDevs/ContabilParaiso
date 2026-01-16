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

// Schema rigoroso: titulo deve ser preenchido
const formSchema = z.object({
  // O .min(1) força que a string não seja vazia
  titulo: z.string().min(1, "O título é obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

interface MarketplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { titulo: string }) => void; // Tipagem obrigatória
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
    defaultValues: { titulo: "" },
  });

  // Limpa ou preenche o form sempre que o modal abre ou muda o item editado
  useEffect(() => {
    if (open) {
      form.reset({
        titulo: marketplace?.titulo || "",
      });
    }
  }, [open, marketplace, form]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Usamos o "as" para garantir que o tipo enviado é o exigido pela interface
      await onSave(data as { titulo: string });
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
            Digite o nome do canal de venda.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
