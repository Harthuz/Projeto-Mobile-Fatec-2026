import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../services/api.service";

type AuthContextType = {
  isLogged: boolean;
  userId: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLogged, setIsLogged] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const savedUserId = await AsyncStorage.getItem("@user_id");
      const savedUsername = await AsyncStorage.getItem("@user_username");

      if (savedUserId && savedUsername) {
        setUserId(savedUserId);
        setUsername(savedUsername);
        setIsLogged(true);
      }
    } catch (err) {
      console.error("Erro ao carregar usuário salvo:", err);
    } finally {
      setLoading(false);
    }
  }

  async function login(userStr: string, passStr: string) {
    const data = await apiService.login(userStr, passStr);
    
    await AsyncStorage.setItem("@user_id", data.userId);
    await AsyncStorage.setItem("@user_username", userStr);

    setUserId(data.userId);
    setUsername(userStr);
    setIsLogged(true);
  }

  async function register(userStr: string, passStr: string) {
    await apiService.register(userStr, passStr);
  }

  async function logout() {
    await AsyncStorage.removeItem("@user_id");
    await AsyncStorage.removeItem("@user_username");

    // Limpar estatísticas locais para evitar vazamento de dados entre sessões
    await AsyncStorage.removeItem("@profile_nome");
    await AsyncStorage.removeItem("@profile_username");
    await AsyncStorage.removeItem("@profile_avatar");

    setUserId(null);
    setUsername(null);
    setIsLogged(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isLogged,
        userId,
        username,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}