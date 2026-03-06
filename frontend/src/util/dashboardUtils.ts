import { addProduct, productList } from "../service/authService";
import { DASHBOARD_CONSTANTS } from "../constants/dashboardConstants";
import { parsedError } from "../util/errorHandler";
import toaster from "../util/toaster";
import type { IProduct } from "../types/IProduct";

export const fetchProductsUtil = async () => {
  try {
    const response = await productList();
    return response.data?.doc || [];
  } catch (error) {
    const parsed = parsedError(error);
    if (parsed.message) {
      throw new Error(parsed.message);
    }
    throw error;
  }
};

export const addProductUtils = async (formData: IProduct) => {
  
  const uploadData = new FormData();
  uploadData.append(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.TITLE, formData.title);
  uploadData.append(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.PRICE, formData.price);
  uploadData.append(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.PRODUCT_DESC, formData.description);
  
  if (formData.file && formData.file.length > 0) {
    uploadData.append(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.IMAGE, formData.file[0]);
  }
  
  const response = await addProduct(uploadData);
  if (response && response.data) {
    toaster(response.status, response?.data?.message || DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED);
  }
};

export const validateFile = (file: File): string | null => {
  // Validate file type
  if (!DASHBOARD_CONSTANTS.CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    return DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE;
  }

  // Validate file size (5MB limit)
  if (file.size > DASHBOARD_CONSTANTS.CONFIG.FILE_UPLOAD.MAX_SIZE) {
    return DASHBOARD_CONSTANTS.MESSAGES.ERROR.FILE_SIZE_LIMIT;
  }

  return null;
};