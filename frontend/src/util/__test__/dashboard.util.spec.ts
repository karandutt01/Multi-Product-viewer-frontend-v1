import { fetchProductsUtil, addProductUtils, validateFile } from '../dashboardUtils';
import { addProduct, productList } from '../../service/authService';
import { DASHBOARD_CONSTANTS } from '../../constants/dashboardConstants';
import { parsedError } from '../errorHandler';
import toaster from '../toaster';
import type { IProduct } from '../../types/IProduct';
import { AxiosResponse } from 'axios';
import { PRODUCTS_CONSTANTS } from '../../constants/productsConstants';

// Mock all external dependencies
jest.mock('../../service/authService');
jest.mock('../errorHandler');
jest.mock('../toaster');

const mockedProductList = productList as jest.MockedFunction<typeof productList>;
const mockedAddProduct = addProduct as jest.MockedFunction<typeof addProduct>;
const mockedParsedError = parsedError as jest.MockedFunction<typeof parsedError>;
const mockedToaster = toaster as jest.MockedFunction<typeof toaster>;

const createMockAxiosResponse = <T = any>(data: any, status: number = 200): AxiosResponse => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: {
    headers: {} as any,
  },
});

describe('dashboardUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProductsUtil', () => {
    it('should return products when API call succeeds', async () => {
      // Arrange
      const mockProducts = [
        { id: 1, title: 'Product 1', price: '100', description: 'Test product 1' },
        { id: 2, title: 'Product 2', price: '200', description: 'Test product 2' }
      ];
      const mockResponse = createMockAxiosResponse(
        { 
          message: DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED,
          doc: mockProducts 
        },
        200
      );
      mockedProductList.mockResolvedValue(mockResponse);

      // Act
      const result = await fetchProductsUtil();

      // Assert
      expect(result).toEqual(mockProducts);
      expect(mockedProductList).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when response has no doc', async () => {
      // Arrange
       const mockResponse = createMockAxiosResponse(
        {
          data:{}
        }
      );
      mockedProductList.mockResolvedValue(mockResponse);

      // Act
      const result = await fetchProductsUtil();

      // Assert
      expect(result).toEqual([]);
      expect(mockedProductList).toHaveBeenCalledTimes(1);
    });

    it('should throw error with parsed message when API fails', async () => {
      // Arrange
      const mockError = new Error('Network error');
      const mockParsedError = { message: 'Parsed network error' };
      mockedProductList.mockRejectedValue(mockError);
      mockedParsedError.mockReturnValue(mockParsedError);

      // Act & Assert
      await expect(fetchProductsUtil()).rejects.toThrow('Parsed network error');
      expect(mockedParsedError).toHaveBeenCalledWith(mockError);
    });

  });

  describe('addProductUtils', () => {
    const mockFormData: IProduct = {
      title: 'Test Product',
      price: '99.99',
      description: 'Test description',
      file: []
    };

    it('should add product and show success message', async () => {
      // Arrange
      const mockResponse = createMockAxiosResponse({
        status: 200,
        data: {
          message: DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED,
        }
      });
      mockedAddProduct.mockResolvedValue(mockResponse);

      // Act
      await addProductUtils(mockFormData);

      // Assert
      expect(mockedAddProduct).toHaveBeenCalledTimes(1);
      expect(mockedToaster).toHaveBeenCalledWith(200, DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED);
    });

    it('should add product with file when file provided', async () => {
      // Arrange
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formDataWithFile: IProduct = {
        ...mockFormData,
        file: [mockFile]
      };
      const mockResponse = createMockAxiosResponse({
        status: 200,
        data: {
          message: DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED
        }
      });
      mockedAddProduct.mockResolvedValue(mockResponse);

      // Act
      await addProductUtils(formDataWithFile);

      // Assert
      const formDataCall = mockedAddProduct.mock.calls[0][0] as FormData;
      expect(formDataCall.get(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.TITLE)).toBe('Test Product');
      expect(formDataCall.get(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.PRICE)).toBe('99.99');
      expect(formDataCall.get(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.PRODUCT_DESC)).toBe('Test description');
      expect(formDataCall.get(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.IMAGE)).toBe(mockFile);
      expect(mockedToaster).toHaveBeenCalledWith(200, DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED);
    });

    it('should add product without file when no file provided', async () => {
      // Arrange
      const mockResponse = createMockAxiosResponse({
        status: 200,
        data: {
          message: DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED
        }
      });
      mockedAddProduct.mockResolvedValue(mockResponse);

      // Act
      await addProductUtils(mockFormData);

      // Assert
      const formDataCall = mockedAddProduct.mock.calls[0][0] as FormData;
      expect(formDataCall.get(DASHBOARD_CONSTANTS.FORM_DATA_KEYS.IMAGE)).toBeNull();
      expect(mockedToaster).toHaveBeenCalledWith(200, DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED);
    });

    it('should use default message when API response has no message', async () => {
      // Arrange
      const mockResponse = createMockAxiosResponse(
        {
          status: 200,
          data: {}
        }
      )
      mockedAddProduct.mockResolvedValue(mockResponse);

      // Act
      await addProductUtils(mockFormData);

      // Assert
      expect(mockedToaster).toHaveBeenCalledWith(200, DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED);
    });
  });

  describe('validateFile', () => {
    it('should return null for valid file', () => {
      // Arrange
      const validFile = new File(['test'], 'test.jpg', { 
        type: 'image/jpeg' 
      });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB

      // Act
      const result = validateFile(validFile);

      // Assert
      expect(result).toBeNull();
    });

    it('should return error for invalid file type', () => {
      // Arrange
      const invalidFile = new File(['test'], 'test.txt', { 
        type: 'text/plain' 
      });
      Object.defineProperty(invalidFile, 'size', { value: 1024 });

      // Act
      const result = validateFile(invalidFile);

      // Assert
      expect(result).toBe(DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE);
    });

    it('should return error for oversized file', () => {
      // Arrange
      const oversizedFile = new File(['test'], 'test.jpg', { 
        type: 'image/jpeg' 
      });
      Object.defineProperty(oversizedFile, 'size', { 
        value: DASHBOARD_CONSTANTS.CONFIG.FILE_UPLOAD.MAX_SIZE + 1 
      });

      // Act
      const result = validateFile(oversizedFile);

      // Assert
      expect(result).toBe(DASHBOARD_CONSTANTS.MESSAGES.ERROR.FILE_SIZE_LIMIT);
    });

    it('should return null for file at size limit', () => {
      // Arrange
      const limitFile = new File(['test'], 'test.jpg', { 
        type: 'image/jpeg' 
      });
      Object.defineProperty(limitFile, 'size', { 
        value: DASHBOARD_CONSTANTS.CONFIG.FILE_UPLOAD.MAX_SIZE 
      });

      // Act
      const result = validateFile(limitFile);

      // Assert
      expect(result).toBeNull();
    });
  });
});