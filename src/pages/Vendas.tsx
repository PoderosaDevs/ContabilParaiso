import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockVendas as initialVendas, mockMarketplaces as initialMarketplaces } from "@/data/mockData";
import { Venda, Marketplace } from "@/types";
import { Search, Plus, Download, Filter, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { VendaModal } from "@/components/modals/VendaModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const Vendas = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>("all");
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendaToDelete, setVendaToDelete] = useState<Venda | null>(null);

  useEffect(() => {
    const storedVendas = localStorage.getItem("vendas");
    const storedMarketplaces = localStorage.getItem("marketplaces");
    
    if (storedVendas) {
      setVendas(JSON.parse(storedVendas).map((v: Venda) => ({ ...v, dataVenda: new Date(v.dataVenda) })));
    } else {
      setVendas(initialVendas);
      localStorage.setItem("vendas", JSON.stringify(initialVendas));
    }
    
    if (storedMarketplaces) {
      setMarketplaces(JSON.parse(storedMarketplaces));
    } else {
      setMarketplaces(initialMarketplaces);
    }
  }, []);

  const saveVendas = (data: Venda[]) => {
    setVendas(data);
    localStorage.setItem("vendas", JSON.stringify(data));
  };

  const handleSave = (venda: Venda) => {
    const existing = vendas.find((v) => v.id === venda.id);
    if (existing) {
      saveVendas(vendas.map((v) => (v.id === venda.id ? venda : v)));
    } else {
      saveVendas([...vendas, venda]);
    }
    setEditingVenda(null);
  };

  const handleDelete = () => {
    if (vendaToDelete) {
      saveVendas(vendas.filter((v) => v.id !== vendaToDelete.id));
      toast.success("Venda excluída!");
      setVendaToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getMarketplaceName = (id: string) => {
    return marketplaces.find((m) => m.id === id)?.name || "Desconhecido";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-success/10 text-success";
      case "pendente":
        return "bg-warning/10 text-warning";
      case "cancelado":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredVendas = vendas.filter((v) => {
    const matchesSearch =
      v.numeroNf.toLowerCase().includes(search.toLowerCase()) ||
      getMarketplaceName(v.marketplaceId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    const matchesMarketplace =
      marketplaceFilter === "all" || v.marketplaceId === marketplaceFilter;
    return matchesSearch && matchesStatus && matchesMarketplace;
  });

  const totalVendas = filteredVendas.reduce((acc, v) => acc + v.valorLiquido, 0);

  const columns = [
    {
      key: "numeroNf",
      header: "Nº NF",
      render: (item: Venda) => (
        <span className="font-mono font-medium text-foreground">
          {item.numeroNf}
        </span>
      ),
    },
    {
      key: "marketplace",
      header: "Marketplace",
      render: (item: Venda) => (
        <span className="text-foreground">
          {getMarketplaceName(item.marketplaceId)}
        </span>
      ),
    },
    {
      key: "dataVenda",
      header: "Data",
      render: (item: Venda) => (
        <span className="text-muted-foreground">
          {format(new Date(item.dataVenda), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      ),
    },
    {
      key: "baseIcms",
      header: "Base ICMS",
      render: (item: Venda) => (
        <span className="text-foreground">
          R$ {item.baseIcms.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "comissao",
      header: "Comissão",
      render: (item: Venda) => (
        <span className="text-destructive">
          -R$ {item.comissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "valorLiquido",
      header: "Valor Líquido",
      render: (item: Venda) => (
        <span className="font-semibold text-foreground">
          R$ {item.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Venda) => (
        <span
          className={cn(
            "inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize",
            getStatusColor(item.status)
          )}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (item: Venda) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingVenda(item);
                setModalOpen(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setVendaToDelete(item);
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
    <AppLayout title="Vendas">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por NF ou marketplace..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Marketplace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {marketplaces.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={() => {
                setEditingVenda(null);
                setModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-xl border p-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Total de Registros</p>
            <p className="text-xl font-bold text-foreground">
              {filteredVendas.length}
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">Valor Total Líquido</p>
            <p className="text-xl font-bold text-primary">
              R$ {totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border overflow-x-auto">
          <DataTable
            data={filteredVendas}
            columns={columns}
            emptyMessage="Nenhuma venda encontrada"
          />
        </div>
      </div>

      <VendaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        marketplaces={marketplaces}
        venda={editingVenda}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a venda "{vendaToDelete?.numeroNf}"? Esta ação não pode ser desfeita.
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

export default Vendas;
