import { Dispatch, SetStateAction } from "react";

export interface AuthContextType {
  auth: Record<string, any>;
  setAuth: Dispatch<SetStateAction<Record<string, any>>>;
  isAuthenticated: () => boolean;
  setLocalStorageAuthEmpty: () => void;
}