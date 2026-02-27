import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthState } from "../types/AuthState";
import type { AuthContextType } from "../types/AuthContext";



const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({})

  useEffect(() => {
      if(auth.token){
        localStorage.setItem('auth', JSON.stringify(auth));
      }else{
        localStorage.setItem('auth', JSON.stringify(auth));
      }
  }, [auth])

  const isAuthenticated = ():boolean => {

    if(!auth.token) return false;

    try {
      const tokenPayload = JSON.parse(atob(auth.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if(tokenPayload.exp && tokenPayload.exp < currentTime){
        //Token Expired
        setLocalStorageAuthEmpty();
        return false;
      }
      return true;

    } catch (error) {
      setLocalStorageAuthEmpty();
      return false;
    }
  }

  const setLocalStorageAuthEmpty = () => {
    setAuth({});
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{auth, setAuth, isAuthenticated, setLocalStorageAuthEmpty}}>
      {children}
    </AuthContext.Provider>
  )

}

export default AuthContext;
