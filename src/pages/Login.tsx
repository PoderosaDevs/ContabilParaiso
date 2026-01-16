import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } else {
      toast.error("Email ou senha inválidos");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex">
      
      {/* ===== Lado Esquerdo: Formulário ===== */}
      {/* MUDANÇA: bg-slate-50 para tirar o branco excessivo */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-slate-50 z-10">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Logo / Ícone */}
          <div className="flex flex-col space-y-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // MUDANÇA: bg-white para destacar no fundo cinza e borda suave
                className="bg-white border-slate-200 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">Senha</Label>
              </div>
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
            
            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  Entrar <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Criar conta
            </Link>
          </div>

          {/* Credenciais de teste */}
          <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs text-muted-foreground shadow-sm">
            <p className="font-semibold mb-1 text-slate-700">Credenciais de teste:</p>
            <p>Email: admin@paraisocosmeticos.com</p>
            <p>Senha: admin123</p>
          </div>
        </div>
      </div>

      {/* ===== Lado Direito: Decorativo ===== */}
      <div className="hidden lg:flex flex-1 relative bg-white items-center justify-center overflow-hidden border-l border-slate-100">
        {/* Blobs / Manchas Originais */}
        <div className="absolute inset-0 w-full h-full">
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-lg p-12 text-center">
          <div className="inline-flex p-4 rounded-full bg-white border border-slate-100 shadow-xl mb-8">
             <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
             </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900">
            Controle Financeiro Simplificado
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Gerencie suas vendas e recebimentos por marketplace em um único lugar, com a clareza que seu negócio precisa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;