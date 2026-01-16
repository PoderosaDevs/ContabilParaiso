import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle, ArrowRight, Loader2, PieChart, Store, Wallet, Sparkles } from "lucide-react";

const features = [
  { icon: Wallet, text: "Recebimentos Totais" },
  { icon: Store, text: "Por Marketplace" },
  { icon: PieChart, text: "Análise de Vendas" },
];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    const success = await register(name, email, password);

    if (success) {
      setIsRegistered(true);
      toast.success("Solicitação enviada com sucesso!");
    } else {
      toast.error(
        "Este email já está em uso ou possui uma solicitação pendente"
      );
    }

    setIsLoading(false);
  };

  // TELA DE SUCESSO
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
           <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-md text-center border shadow-xl relative z-10 bg-white">
          <CardContent className="pt-12 pb-12 space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Solicitação Enviada!</h2>
                <p className="text-slate-500">
                Sua solicitação de cadastro foi enviada para aprovação. Um
                administrador irá analisar e você será notificado quando aprovado.
                </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // TELA DE REGISTRO
  return (
    <div className="w-full min-h-screen flex">
      
      {/* ===== Lado Esquerdo: Decorativo ===== */}
      <div className="hidden lg:flex flex-1 relative bg-white items-center justify-center overflow-hidden border-r border-slate-100">
        <div className="absolute inset-0 w-full h-full">
           <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
           <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-md p-12">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">
            Comece a controlar sua operação hoje.
          </h2>
          <div className="space-y-6">
            {features.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary">
                        <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-700">{item.text}</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Lado Direito: Formulário ===== */}
      {/* MUDANÇA: bg-slate-50 aqui também */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-slate-50 z-10">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Logo Mobile */}
          <div className="lg:hidden flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Criar Conta</h1>
            <p className="text-sm text-muted-foreground">
              Solicite acesso ao sistema de contabilidade preenchendo os dados abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white border-slate-200 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-slate-200 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-slate-200 focus:border-primary/50 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white border-slate-200 focus:border-primary/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                "Solicitar Cadastro"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;