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
import { mockRepasses as initialRepasses, mockMarketplaces as initialMarketplaces, mockVendas as initialVendas } from "@/data/mockData";
import { Repasse, Marketplace, Venda } from "@/types";
import { Search, Plus, Download, CheckCircle2, Clock, AlertTriangle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { RepasseModal } from "@/components/modals/RepasseModal";
import { toast } from "sonner";

const Repasses = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRepasse, setEditingRepasse] = useState<Repasse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repasseToDelete, setRepasseToDelete] = useState<Repasse | null>(null);

  useEffect(() => {
    const storedRepasses = localStorage.getItem("repasses");
    const storedMarketplaces = localStorage.getItem("marketplaces");
    const storedVendas = localStorage.getItem("vendas");
    
    if (storedRepasses) {
      setRepasses(JSON.parse(storedRepasses).map((r: Repasse) => ({ ...r, dataRepasse: new Date(r.dataRepasse) })));
    } else {
      setRepasses(initialRepasses);
      localStorage.setItem("repasses", JSON.stringify(initialRepasses));
    }
    
    if (storedMarketplaces) {
      setMarketplaces(JSON.parse(storedMarketplaces));
    } else {
      setMarketplaces(initialMarketplaces);
    }
    
    if (storedVendas) {
      setVendas(JSON.parse(storedVendas));
    } else {
      setVendas(initialVendas);
    }
  }, []);

  const saveRepasses = (data: Repasse[]) => {
    setRepasses(data);
    localStorage.setItem("repasses", JSON.stringify(data));
  };

  const handleSave = (repasse: Repasse) => {
    const existing = repasses.find((r) => r.id === repasse.id);
    if (existing) {
      saveRepasses(repasses.map((r) => (r.id === repasse.id ? repasse : r)));
    } else {
      saveRepasses([...repasses, repasse]);
    }
    setEditingRepasse(null);
  };

  const handleDelete = () => {
    if (repasseToDelete) {
      saveRepasses(repasses.filter((r) => r.id !== repasseToDelete.id));
      toast.success("Repasse excluído!");
      setRepasseToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getMarketplaceName = (id: string) => {
    return marketplaces.find((m) => m.id === id)?.name || "Desconhecido";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "recebido":
        return "bg-success/10 text-success";
      case "pendente":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredRepasses = repasses.filter((r) => {
    const matchesSearch =
      r.nf.toLowerCase().includes(search.toLowerCase()) ||
      getMarketplaceName(r.marketplaceId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRecebido = repasses
    .filter((r) => r.status === "recebido")
    .reduce((acc, r) => acc + r.valorLiquido, 0);

  const totalPendente = vendas
    .filter((v) => v.status === "pendente")
    .reduce((acc, v) => acc + v.valorLiquido, 0);

  const columns = [
    {
      key: "nf",
      header: "Nº NF",
      render: (item: Repasse) => (
        <span className="font-mono font-medium text-foreground">{item.nf}</span>
      ),
    },
    {
      key: "marketplace",
      header: "Marketplace",
      render: (item: Repasse) => (
        <span className="text-foreground">
          {getMarketplaceName(item.marketplaceId)}
        </span>
      ),
    },
    {
      key: "valorLiquido",
      header: "Valor Líquido",
      render: (item: Repasse) => (
        <span className="font-semibold text-foreground">
          R$ {item.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "dataRepasse",
      header: "Data do Repasse",
      render: (item: Repasse) => (
        <span className="text-muted-foreground">
          {format(new Date(item.dataRepasse), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Repasse) => (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
            getStatusColor(item.status)
          )}
        >
          {item.status === "recebido" ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (item: Repasse) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingRepasse(item);
                setModalOpen(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setRepasseToDelete(item);
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
    <AppLayout title="Repasses">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Recebido</p>
              <p className="text-2xl font-bold text-success">
                R$ {totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendente de Repasse</p>
              <p className="text-2xl font-bold text-warning">
                R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diferença</p>
              <p className="text-2xl font-bold text-destructive">
                R$ {(totalPendente).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
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
                setEditingRepasse(null);
                setModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Repasse
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border">
          <DataTable
            data={filteredRepasses}
            columns={columns}
            emptyMessage="Nenhum repasse encontrado"
          />
        </div>
      </div>

      <RepasseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        marketplaces={marketplaces}
        repasse={editingRepasse}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o repasse "{repasseToDelete?.nf}"? Esta ação não pode ser desfeita.
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

export default Repasses;
