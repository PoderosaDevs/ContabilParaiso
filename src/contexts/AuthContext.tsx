import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, RegistrationRequest, UserRole } from "@/types";

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

// Initial admin user
const INITIAL_ADMIN: User = {
  id: "admin-1",
  name: "Administrador",
  email: "admin@paraisocosmeticos.com",
  role: "admin",
  createdAt: new Date(),
};

// Stored passwords (simulated - in production use proper auth)
const INITIAL_PASSWORDS: Record<string, string> = {
  "admin@paraisocosmeticos.com": "admin123",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const storedUser = localStorage.getItem("currentUser");
    const storedUsers = localStorage.getItem("users");
    const storedRequests = localStorage.getItem("registrationRequests");
    const storedPasswords = localStorage.getItem("passwords");

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers([INITIAL_ADMIN]);
      localStorage.setItem("users", JSON.stringify([INITIAL_ADMIN]));
    }

    if (storedRequests) {
      setRegistrationRequests(JSON.parse(storedRequests));
    }

    if (storedPasswords) {
      setPasswords(JSON.parse(storedPasswords));
    } else {
      setPasswords(INITIAL_PASSWORDS);
      localStorage.setItem("passwords", JSON.stringify(INITIAL_PASSWORDS));
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const storedPasswords = JSON.parse(localStorage.getItem("passwords") || "{}");
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    if (storedPasswords[email] === password) {
      const foundUser = storedUsers.find((u: User) => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const storedRequests = JSON.parse(localStorage.getItem("registrationRequests") || "[]");
    
    // Check if email already exists
    if (storedUsers.some((u: User) => u.email === email) || 
        storedRequests.some((r: RegistrationRequest) => r.email === email && r.status === "pendente")) {
      return false;
    }

    const newRequest: RegistrationRequest = {
      id: `req-${Date.now()}`,
      name,
      email,
      password,
      createdAt: new Date(),
      status: "pendente",
    };

    const updatedRequests = [...storedRequests, newRequest];
    setRegistrationRequests(updatedRequests);
    localStorage.setItem("registrationRequests", JSON.stringify(updatedRequests));
    return true;
  };

  const approveUser = (requestId: string, role: UserRole) => {
    const storedRequests = JSON.parse(localStorage.getItem("registrationRequests") || "[]");
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const storedPasswords = JSON.parse(localStorage.getItem("passwords") || "{}");
    
    const request = storedRequests.find((r: RegistrationRequest) => r.id === requestId);
    if (!request) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: request.name,
      email: request.email,
      role,
      createdAt: new Date(),
    };

    const updatedUsers = [...storedUsers, newUser];
    const updatedPasswords = { ...storedPasswords, [request.email]: request.password };
    const updatedRequests = storedRequests.map((r: RegistrationRequest) =>
      r.id === requestId ? { ...r, status: "aprovado" } : r
    );

    setUsers(updatedUsers);
    setPasswords(updatedPasswords);
    setRegistrationRequests(updatedRequests);

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
    localStorage.setItem("registrationRequests", JSON.stringify(updatedRequests));
  };

  const rejectUser = (requestId: string) => {
    const storedRequests = JSON.parse(localStorage.getItem("registrationRequests") || "[]");
    const updatedRequests = storedRequests.map((r: RegistrationRequest) =>
      r.id === requestId ? { ...r, status: "rejeitado" } : r
    );

    setRegistrationRequests(updatedRequests);
    localStorage.setItem("registrationRequests", JSON.stringify(updatedRequests));
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = storedUsers.map((u: User) =>
      u.id === userId ? { ...u, role } : u
    );

    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
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
