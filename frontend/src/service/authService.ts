import axiosConfig from "./axios";
import type {IRegisterForm} from "../types/IRegisterForm";
import type { ILogin } from "../types/ILogin";

export const registerUser = async(userData:IRegisterForm) => {
  return await axiosConfig.post('/register', userData);
}

export const loginUser = async(credentials:ILogin) => {
  return await axiosConfig.post('/login', credentials);
}

export const addProduct = async(productData:FormData) => {
  return await axiosConfig.post('/products/add-product', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const productList = async() => {
  return await axiosConfig.get(`/products/product-list`)
}

export const getProductById = async (id:string) => {
  return await axiosConfig.get(`/products/${id}`)
}