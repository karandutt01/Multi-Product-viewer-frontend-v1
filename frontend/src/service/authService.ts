import axiosConfig from "./axios";
import {IRegisterForm} from "../types/IRegisterForm";
import { ILogin } from "../types/ILogin";

export const registerUser = async(userData:IRegisterForm) => {
  return await axiosConfig.post('/register', userData);
}

export const loginUser = async(credentials:ILogin) => {
  return await axiosConfig.post('/login', credentials);
}