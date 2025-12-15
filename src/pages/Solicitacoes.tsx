import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistrationRequest, User, UserRole } from "@/types";
import { CheckCircle, XCircle, Clock, Users, UserCheck, UserX, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Solicitacoes = () => {
  const { registrationRequests, users, approveUser, rejectUser, updateUserRole } = useAuth();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("funcionario");

  const pendingRequests = registrationRequests.filter((r) => r.status === "pendente");

  const handleApprove = () => {
    if (selectedRequest) {
      approveUser(selectedRequest.id, selectedRole);
      toast.success(`Usuário ${selectedRequest.name} aprovado como ${selectedRole}`);
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleReject = (request: RegistrationRequest) => {
    rejectUser(request.id);
    toast.success(`Solicitação de ${request.name} rejeitada`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "aprovado":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary/10 text-primary"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case "funcionario":
        return <Badge variant="secondary">Funcionário</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const requestColumns = [
    {
      key: "name",
      header: "Nome",
      render: (item: RegistrationRequest) => (
        <span className="font-medium text-foreground">{item.name}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (item: RegistrationRequest) => (
        <span className="text-muted-foreground">{item.email}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Data da Solicitação",
      render: (item: RegistrationRequest) => (
        <span className="text-muted-foreground">
          {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: RegistrationRequest) => getStatusBadge(item.status),
    },
    {
      key: "actions",
      header: "Ações",
      render: (item: RegistrationRequest) =>
        item.status === "pendente" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => {
                setSelectedRequest(item);
                setApproveDialogOpen(true);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(item)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        ) : null,
    },
  ];

  const userColumns = [
    {
      key: "name",
      header: "Nome",
      render: (item: User) => (
        <span className="font-medium text-foreground">{item.name}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (item: User) => (
        <span className="text-muted-foreground">{item.email}</span>
      ),
    },
    {
      key: "role",
      header: "Nível",
      render: (item: User) => getRoleBadge(item.role),
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (item: User) => (
        <span className="text-muted-foreground">
          {format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Alterar Nível",
      render: (item: User) => (
        <Select
          value={item.role}
          onValueChange={(value: UserRole) => {
            updateUserRole(item.id, value);
            toast.success(`Nível de ${item.name} alterado para ${value}`);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="funcionario">Funcionário</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <AppLayout title="Solicitações e Usuários">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold text-foreground">{pendingRequests.length}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Usuários</p>
              <p className="text-xl font-bold text-foreground">{users.length}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-success/10">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-xl font-bold text-foreground">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-muted">
              <UserX className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Funcionários</p>
              <p className="text-xl font-bold text-foreground">
                {users.filter((u) => u.role === "funcionario").length}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Solicitações de Cadastro</h2>
          <div className="bg-card rounded-xl border">
            <DataTable
              data={registrationRequests}
              columns={requestColumns}
              emptyMessage="Nenhuma solicitação encontrada"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Usuários Cadastrados</h2>
          <div className="bg-card rounded-xl border">
            <DataTable
              data={users}
              columns={userColumns}
              emptyMessage="Nenhum usuário encontrado"
            />
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Usuário</DialogTitle>
            <DialogDescription>
              Selecione o nível de acesso para {selectedRequest?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin - Acesso total ao sistema
                  </div>
                </SelectItem>
                <SelectItem value="funcionario">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Funcionário - Acesso básico
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="gradient-primary text-primary-foreground">
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Solicitacoes;
