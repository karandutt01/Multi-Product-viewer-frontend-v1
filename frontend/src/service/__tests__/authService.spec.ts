import { loginUser, registerUser } from '../authService';
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
});