import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface StoreMapping {
  storeName: string;
  marketplaceId: string;
}

interface StoreMappingModalProps {
  open: boolean;
  uniqueStores: string[];
  marketplaces: any[];
  loading?: boolean;
  onConfirm: (mappings: StoreMapping[]) => void;
  onCancel: () => void;
}

export const StoreMappingModal = ({ open, uniqueStores, marketplaces, loading = false, onConfirm, onCancel }: StoreMappingModalProps) => {
  const [mappings, setMappings] = useState<StoreMapping[]>([]);

  useEffect(() => {
    setMappings(uniqueStores.map(name => ({ storeName: name, marketplaceId: "" })));
  }, [uniqueStores]);

  const updateMapping = (storeName: string, mktId: string) => {
    setMappings(prev => prev.map(m => m.storeName === storeName ? { ...m, marketplaceId: mktId } : m));
  };

  const isComplete = mappings.every(m => m.marketplaceId !== "");

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !loading && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vincular Lojas aos Marketplaces</DialogTitle>
          <DialogDescription>
            Encontramos {uniqueStores.length} lojas diferentes na planilha. Associe cada uma ao canal correto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {mappings.map((mapping) => (
            <div key={mapping.storeName} className="flex items-center justify-between gap-4 p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 overflow-hidden">
                <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">{mapping.storeName}</span>
              </div>
              
              <Select disabled={loading} onValueChange={(val) => updateMapping(mapping.storeName, val)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecionar canal..." />
                </SelectTrigger>
                <SelectContent>
                  {marketplaces.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>Voltar</Button>
          <Button 
            onClick={() => onConfirm(mappings)} 
            disabled={!isComplete || loading}
            className="gradient-primary text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finalizar Importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};