import { loginUser, registerUser, addProduct, productList, getProductById } from '../authService';
import axiosConfig from '../axios';
import { IRegisterForm } from '../../types/IRegisterForm';
import { ILogin } from '../../types/ILogin';

jest.mock('../axios');
const mockAxios = axiosConfig as jest.Mocked<typeof axiosConfig>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const mockUserData: IRegisterForm = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    it('should register user successfully with valid data', async () => {
      const mockResponse = {
        status: 201,
        data: {
          message: 'User registered successfully',
          user: {
            id: '1',
            email: 'john.doe@example.com',
            firstname: 'John',
            lastname: 'Doe'
          }
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await registerUser(mockUserData);

      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith('/register', mockUserData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API returns validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            details: [
              { field: 'email', message: 'Email already exists' }
            ]
          }
        }
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(registerUser(mockUserData)).rejects.toEqual(mockError);
      expect(mockAxios.post).toHaveBeenCalledWith('/register', mockUserData);
    });

    it('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      mockAxios.post.mockRejectedValue(networkError);

      await expect(registerUser(mockUserData)).rejects.toThrow('Network Error');
      expect(mockAxios.post).toHaveBeenCalledWith('/register', mockUserData);
    });

    it('should handle empty user data', async () => {
      const emptyUserData: IRegisterForm = {
        firstname: '',
        lastname: '',
        email: '',
        password: ''
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'All fields are required'
          }
        }
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(registerUser(emptyUserData)).rejects.toEqual(mockError);
      expect(mockAxios.post).toHaveBeenCalledWith('/register', emptyUserData);
    });

    it('should handle server error response', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error'
          }
        }
      };

      mockAxios.post.mockRejectedValue(serverError);

      await expect(registerUser(mockUserData)).rejects.toEqual(serverError);
      expect(mockAxios.post).toHaveBeenCalledWith('/register', mockUserData);
    });
  });

  describe('loginUser', () => {
    const mockCredentials: ILogin = {
      email: 'john.doe@example.com',
      password: 'password123'
    };

    it('should login user successfully with valid credentials', async () => {
      const mockResponse = {
        status: 200,
        data: {
          message: 'Login successful',
          token: 'jwt-token-here',
          user: {
            id: '1',
            email: 'john.doe@example.com',
            firstname: 'John',
            lastname: 'Doe'
          }
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await loginUser(mockCredentials);

      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith('/login', mockCredentials);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error with invalid credentials', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Invalid email or password'
          }
        }
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(loginUser(mockCredentials)).rejects.toEqual(mockError);
      expect(mockAxios.post).toHaveBeenCalledWith('/login', mockCredentials);
    });

    it('should throw error on server error', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error'
          }
        }
      };

      mockAxios.post.mockRejectedValue(serverError);

      await expect(loginUser(mockCredentials)).rejects.toEqual(serverError);
      expect(mockAxios.post).toHaveBeenCalledWith('/login', mockCredentials);
    });

    it('should handle network timeout error', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockAxios.post.mockRejectedValue(timeoutError);

      await expect(loginUser(mockCredentials)).rejects.toEqual(timeoutError);
      expect(mockAxios.post).toHaveBeenCalledWith('/login', mockCredentials);
    });

    it('should handle empty credentials', async () => {
      const emptyCredentials: ILogin = {
        email: '',
        password: ''
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Email and password are required'
          }
        }
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(loginUser(emptyCredentials)).rejects.toEqual(mockError);
      expect(mockAxios.post).toHaveBeenCalledWith('/login', emptyCredentials);
    });

    it('should handle malformed email format', async () => {
      const invalidCredentials: ILogin = {
        email: 'invalid-email',
        password: 'password123'
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid email format'
          }
        }
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(loginUser(invalidCredentials)).rejects.toEqual(mockError);
      expect(mockAxios.post).toHaveBeenCalledWith('/login', invalidCredentials);
    });
  });

  describe('addProduct', () => {
    it('should_add_product_successfully_with_formdata', async () => {
      const mockFormData = new FormData();
      mockFormData.append('title', 'Test Product');
      mockFormData.append('price', '99.99');
      mockFormData.append('productDesc', 'Test description');
      mockFormData.append('image', new Blob(['test']), 'test.jpg');

      const mockResponse = {
        status: 201,
        data: {
          message: 'Product added successfully',
          product: {
            id: '123',
            title: 'Test Product',
            price: '99.99',
            productDesc: 'Test description',
            imageUrl: 'https://example.com/test.jpg'
          }
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await addProduct(mockFormData);

      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/products/add-product',
        mockFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should_throw_validation_error_for_invalid_product_data', async () => {
      const mockFormData = new FormData();
      // Missing required fields

      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: {
              title: 'Title is required',
              price: 'Price must be a valid number'
            }
          }
        }
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(addProduct(mockFormData)).rejects.toEqual(mockError);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/products/add-product',
        mockFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should_handle_network_error_during_product_addition', async () => {
      const mockFormData = new FormData();
      const networkError = new Error('Network Error');

      mockAxios.post.mockRejectedValue(networkError);

      await expect(addProduct(mockFormData)).rejects.toThrow('Network Error');
    });

    it('should_handle_server_error_when_adding_product', async () => {
      const mockFormData = new FormData();
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error'
          }
        }
      };

      mockAxios.post.mockRejectedValue(serverError);

      await expect(addProduct(mockFormData)).rejects.toEqual(serverError);
    });
  });

  describe('productList', () => {
    it('should_retrieve_product_list_successfully', async () => {
      const mockResponse = {
        status: 200,
        data: {
          doc: [
            {
              id: '1',
              title: 'Product 1',
              price: '49.99',
              productDesc: 'Description 1',
              imageUrl: 'https://example.com/product1.jpg'
            },
            {
              id: '2',
              title: 'Product 2',
              price: '79.99',
              productDesc: 'Description 2',
              imageUrl: 'https://example.com/product2.jpg'
            }
          ],
          total: 2
        }
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await productList();

      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith('/products/product-list');
      expect(result).toEqual(mockResponse);
    });

    it('should_handle_empty_product_list', async () => {
      const mockResponse = {
        status: 200,
        data: {
          doc: [],
          total: 0
        }
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await productList();

      expect(mockAxios.get).toHaveBeenCalledWith('/products/product-list');
      expect(result.data.doc).toHaveLength(0);
      expect(result.data.total).toBe(0);
    });

    it('should_throw_unauthorized_error_for_product_list', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized access'
          }
        }
      };

      mockAxios.get.mockRejectedValue(mockError);

      await expect(productList()).rejects.toEqual(mockError);
      expect(mockAxios.get).toHaveBeenCalledWith('/products/product-list');
    });

    it('should_handle_timeout_error_for_product_list', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockAxios.get.mockRejectedValue(timeoutError);

      await expect(productList()).rejects.toEqual(timeoutError);
    });
  });

  describe('getProductById', () => {
    it('should_get_product_by_id_successfully', async () => {
      const productId = '123';
      const mockResponse = {
        status: 200,
        data: {
          id: '123',
          title: 'Test Product',
          price: '99.99',
          productDesc: 'Test product description',
          imageUrl: 'https://example.com/product123.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await getProductById(productId);

      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith(`/products/${productId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should_throw_not_found_error_for_invalid_product_id', async () => {
      const productId = 'nonexistent';
      const mockError = {
        response: {
          status: 404,
          data: {
            message: 'Product not found'
          }
        }
      };

      mockAxios.get.mockRejectedValue(mockError);

      await expect(getProductById(productId)).rejects.toEqual(mockError);
      expect(mockAxios.get).toHaveBeenCalledWith(`/products/${productId}`);
    });

    it('should_throw_bad_request_for_invalid_id_format', async () => {
      const invalidId = 'invalid-format';
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid product ID format'
          }
        }
      };

      mockAxios.get.mockRejectedValue(mockError);

      await expect(getProductById(invalidId)).rejects.toEqual(mockError);
      expect(mockAxios.get).toHaveBeenCalledWith(`/products/${invalidId}`);
    });

    it('should_handle_server_error_when_getting_product', async () => {
      const productId = '123';
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error'
          }
        }
      };

      mockAxios.get.mockRejectedValue(serverError);

      await expect(getProductById(productId)).rejects.toEqual(serverError);
      expect(mockAxios.get).toHaveBeenCalledWith(`/products/${productId}`);
    });
  });
});