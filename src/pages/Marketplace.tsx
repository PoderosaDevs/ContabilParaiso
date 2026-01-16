import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Store, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarketplaceModal } from "@/components/modals/MarketplaceModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { marketplaceService } from "@/services/api-routes";

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMarketplace, setEditingMarketplace] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [marketplaceToDelete, setMarketplaceToDelete] = useState<any | null>(null);

  const fetchMarketplaces = async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getAll();
      setMarketplaces(data);
    } catch (error) {
      toast.error("Erro ao carregar marketplaces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaces();
  }, []);

  const handleSave = async (data: { titulo: string }) => {
    try {
      if (editingMarketplace) {
        await marketplaceService.update(editingMarketplace.id, data.titulo);
        toast.success("Atualizado com sucesso!");
      } else {
        await marketplaceService.create(data.titulo);
        toast.success("Criado com sucesso!");
      }
      fetchMarketplaces();
      setModalOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar.");
    }
  };

  const handleDelete = async () => {
    if (marketplaceToDelete) {
      try {
        await marketplaceService.delete(marketplaceToDelete.id);
        toast.success("Removido!");
        fetchMarketplaces();
        setDeleteDialogOpen(false);
      } catch (error) {
        toast.error("Erro: existem vendas vinculadas a este marketplace.");
      }
    }
  };

  const filteredMarketplaces = marketplaces.filter((m) =>
    m.titulo?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "titulo",
      header: "Nome",
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded gradient-primary flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">{item.titulo}</span>
        </div>
      ),
    },
    {
      key: "vendas",
      header: "Vendas",
      render: (item: any) => <span>{item._count?.vendas || 0} registros</span>,
    },
    {
      key: "actions",
      header: "Ações",
      render: (item: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingMarketplace(item); setModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => { setMarketplaceToDelete(item); setDeleteDialogOpen(true); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AppLayout title="Marketplace">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-10" 
            />
          </div>
          <Button className="gradient-primary" onClick={() => { setEditingMarketplace(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Novo
          </Button>
        </div>

        <div className="bg-card border rounded-xl">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <DataTable data={filteredMarketplaces} columns={columns} emptyMessage="Nenhum canal encontrado." />
          )}
        </div>
      </div>

      <MarketplaceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        marketplace={editingMarketplace}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Deseja excluir "{marketplaceToDelete?.titulo}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Marketplace;