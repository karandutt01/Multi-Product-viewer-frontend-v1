import axiosConfig from "./axios";
import {IRegisterForm} from "../types/IRegisterForm";

export const registerUser = async(userData:IRegisterForm) => {
  return await axiosConfig.post('/register', userData);
}