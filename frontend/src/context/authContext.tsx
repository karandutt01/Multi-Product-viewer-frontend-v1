import { createContext, useState, ReactNode, Dispatch, SetStateAction, useContext } from "react";

interface AuthContextType {
  auth: Record<string, any>;
  setAuth: Dispatch<SetStateAction<Record<string, any>>>;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState({})

  return (
    <AuthContext.Provider value={{auth, setAuth}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
