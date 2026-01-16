import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, RegistrationRequest, UserRole } from "@/types";
import api from "@/services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  users: User[];
  registrationRequests: RegistrationRequest[];
  approveUser: (requestId: string, role: UserRole) => void;
  rejectUser: (requestId: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mantemos estes como estado local por enquanto,
  // até que você crie as rotas de listagem no back-end
  const [users, setUsers] = useState<User[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<
    RegistrationRequest[]
  >([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("@Paraiso:user");
    const token = localStorage.getItem("@Paraiso:token");

    if (storedUser && token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", { email, password });

      // Desestruturando conforme o retorno do seu service: { user, tokens }
      const { user, tokens } = response.data;

      // Pegando o accessToken que o generateTokens criou
      const token = tokens.accessToken;

      api.defaults.headers.Authorization = `Bearer ${token}`;

      localStorage.setItem("@Paraiso:user", JSON.stringify(user));
      localStorage.setItem("@Paraiso:token", token);

      // Opcional: se quiser salvar o refresh token para o futuro
      localStorage.setItem("@Paraiso:refreshToken", tokens.refreshToken);

      setUser(user);
      return true;
    } catch (error) {
      console.error("Erro na autenticação:", error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Chamada para a nova rota configurada no back-end
      await api.post("/users/register", { name, email, password });
      return true;
    } catch (error) {
      console.error("Erro ao registrar:", error);
      // Você pode capturar o erro específico do axios aqui se desejar
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("@Paraiso:user");
    localStorage.removeItem("@Paraiso:token");
    api.defaults.headers.Authorization = "";
    setUser(null);
  };

  // Funções administrativas (Mockadas até você criar as rotas no back-end)
  const approveUser = (requestId: string, role: UserRole) => {
    /* lógica local ou API */
  };
  const rejectUser = (requestId: string) => {
    /* lógica local ou API */
  };
  const updateUserRole = (userId: string, role: UserRole) => {
    /* lógica local ou API */
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        users,
        registrationRequests,
        approveUser,
        rejectUser,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
