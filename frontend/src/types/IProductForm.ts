import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormClearErrors, UseFormSetError } from 'react-hook-form';
import { IProduct } from './IProduct';

export interface IProductFormProps {
  register: UseFormRegister<IProduct>;
  errors: FieldErrors<IProduct>;
  setValue: UseFormSetValue<IProduct>;
  clearErrors: UseFormClearErrors<IProduct>;
  setError: UseFormSetError<IProduct>;
  setSelectedFile: (file: File | null) => void;
}