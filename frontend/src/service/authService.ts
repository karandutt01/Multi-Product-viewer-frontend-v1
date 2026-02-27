import axiosConfig from "./axios";
import type {IRegisterForm} from "../types/IRegisterForm";
import type { ILogin } from "../types/ILogin";

export const registerUser = async(userData:IRegisterForm) => {
  return await axiosConfig.post('/register', userData);
}

export const loginUser = async(credentials:ILogin) => {
  return await axiosConfig.post('/login', credentials);
}