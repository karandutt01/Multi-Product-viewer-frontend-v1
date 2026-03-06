export interface ParsedError {
  fieldErrors?: Record<string, string>;
  message?: string;
}

import { ERROR_CONSTANTS } from "constants/errorConstant";

export const parsedError = (error: any): ParsedError => {
  const parsed: ParsedError = {}
  if(Array.isArray(error?.response?.data?.errors)){
     parsed.fieldErrors = {};
    error.response.data.errors.forEach((err: any) => {
      if (err && err.field && err.message) {
        parsed.fieldErrors![err.field] = err.message;
      }
    });
  }

  if (error?.response?.data?.message) {
    parsed.message = error.response.data.message;
  } else if (error?.message) {
    parsed.message = error.message;
  } else {
    parsed.message = ERROR_CONSTANTS.SOMETHING_WENT_WRONG;
  }

  return parsed;
}