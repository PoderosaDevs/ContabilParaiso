import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockMarketplaces as initialMarketplaces } from "@/data/mockData";
import { Marketplace as MarketplaceType } from "@/types";
import { Search, Plus, Store, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [marketplaces, setMarketplaces] = useState<MarketplaceType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMarketplace, setEditingMarketplace] = useState<MarketplaceType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [marketplaceToDelete, setMarketplaceToDelete] = useState<MarketplaceType | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("marketplaces");
    if (stored) {
      setMarketplaces(JSON.parse(stored));
    } else {
      setMarketplaces(initialMarketplaces);
      localStorage.setItem("marketplaces", JSON.stringify(initialMarketplaces));
    }
  }, []);

  const saveMarketplaces = (data: MarketplaceType[]) => {
    setMarketplaces(data);
    localStorage.setItem("marketplaces", JSON.stringify(data));
  };

  const handleSave = (marketplace: MarketplaceType) => {
    const existing = marketplaces.find((m) => m.id === marketplace.id);
    if (existing) {
      saveMarketplaces(marketplaces.map((m) => (m.id === marketplace.id ? marketplace : m)));
    } else {
      saveMarketplaces([...marketplaces, marketplace]);
    }
    setEditingMarketplace(null);
  };

  const handleDelete = () => {
    if (marketplaceToDelete) {
      saveMarketplaces(marketplaces.filter((m) => m.id !== marketplaceToDelete.id));
      toast.success(`${marketplaceToDelete.name} excluído!`);
      setMarketplaceToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const filteredMarketplaces = marketplaces.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.cnpj.includes(search)
  );

  const columns = [
    {
      key: "name",
      header: "Nome",
      render: (item: MarketplaceType) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-medium text-foreground">{item.name}</span>
        </div>
      ),
    },
    {
      key: "cnpj",
      header: "CNPJ",
      render: (item: MarketplaceType) => (
        <span className="font-mono text-muted-foreground">{item.cnpj}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (item: MarketplaceType) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingMarketplace(item);
                setModalOpen(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setMarketplaceToDelete(item);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AppLayout title="Marketplace">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={() => {
              setEditingMarketplace(null);
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Marketplace
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Total de Marketplaces</p>
            <p className="text-2xl font-bold text-foreground">{marketplaces.length}</p>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold text-success">{marketplaces.length}</p>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Inativos</p>
            <p className="text-2xl font-bold text-muted-foreground">0</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border">
          <DataTable
            data={filteredMarketplaces}
            columns={columns}
            emptyMessage="Nenhum marketplace encontrado"
          />
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
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{marketplaceToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Marketplace;
