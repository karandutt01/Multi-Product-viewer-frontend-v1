import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthState } from "../types/AuthState";
import type { AuthContextType } from "../types/AuthContext";
import { parse } from "path";



const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({})
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {

    const intializeAuth = () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        if(storedAuth){
          const parseAuth = JSON.parse(storedAuth);
          if(parseAuth.token){
            setAuth(parseAuth)
          }
        }
      } catch (error) {
        localStorage.removeItem('auth');

      }finally{
        setIsInitialized(true)
      }
    }

    intializeAuth();
  }, [])

  useEffect(() => {
    if (isInitialized) {
      if(auth.token){
        localStorage.setItem('auth', JSON.stringify(auth));
      }else{
        localStorage.setItem('auth', JSON.stringify(auth));
      }
    }
  }, [auth, isInitialized])

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

  if (!isInitialized) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{auth, setAuth, isAuthenticated, setLocalStorageAuthEmpty}}>
      {children}
    </AuthContext.Provider>
  )

}

export default AuthContext;
