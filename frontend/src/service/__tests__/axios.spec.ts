import axios from 'axios';

// Mock axios before importing the config
jest.mock('axios', () => {
  const mockRequest = { use: jest.fn() };
  const mockResponse = { use: jest.fn() };
  
  return {
    create: jest.fn(() => ({
      interceptors: {
        request: mockRequest,
        response: mockResponse
      }
    }))
  };
});

interface InterceptorHandlers<T> {
  onFulfilled: (value: T) => T | Promise<T>;
  onRejected: (error: any) => any;
}

describe('Axios Configuration', () => {
  let mockAxiosInstance: any;
  let mockRequestInterceptor: InterceptorHandlers<any>;
  let mockResponseInterceptor: InterceptorHandlers<any>;
  let axiosConfig: any;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
    
    // Mock window.location using Object.defineProperty
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true
    });
    
    // Setup mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      }
    };
    
    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    
    // Capture interceptor functions when they're registered
    mockAxiosInstance.interceptors.request.use.mockImplementation((onFulfilled: any, onRejected: any) => {
      mockRequestInterceptor = { onFulfilled, onRejected };
      return 1; // Return a mock interceptor ID
    });
    
    mockAxiosInstance.interceptors.response.use.mockImplementation((onFulfilled: any, onRejected: any) => {
      mockResponseInterceptor = { onFulfilled, onRejected };
      return 2; // Return a mock interceptor ID
    });

    // Import the axios config after setting up mocks - this triggers the creation
    jest.isolateModules(() => {
      axiosConfig = require('../axios').default;
    });
  });

  describe('Axios Instance Creation', () => {
    test('should_create_axios_instance_with_correct_config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "http://localhost:5000/api",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    test('should_setup_request_and_response_interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Request Interceptor', () => {
    test('should_add_auth_header_when_valid_token_exists', async () => {
      const authData = { token: 'test-token-123', user: 'testuser' };
      localStorage.setItem('auth', JSON.stringify(authData));
      
      const config = { headers: {} };
      const result = await mockRequestInterceptor.onFulfilled(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    test('should_not_add_auth_header_when_no_auth_data', async () => {
      const config = { headers: {} };
      const result = await mockRequestInterceptor.onFulfilled(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    test('should_handle_malformed_auth_data_gracefully', async () => {
      localStorage.setItem('auth', 'invalid-json-{');
      
      const config = { headers: {} };
      const result = await mockRequestInterceptor.onFulfilled(config);
      
      expect(result.headers.Authorization).toBeUndefined();
      expect(localStorage.getItem('auth')).toBeNull();
    });

    test('should_handle_auth_data_without_token', async () => {
      const authData = { user: 'testuser' }; // No token property
      localStorage.setItem('auth', JSON.stringify(authData));
      
      const config = { headers: {} };
      const result = await mockRequestInterceptor.onFulfilled(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    test('should_reject_promise_on_request_error', async () => {
      const error = new Error('Request failed');
      
      await expect(mockRequestInterceptor.onRejected(error)).rejects.toEqual(error);
    });
  });

  describe('Response Interceptor', () => {
    test('should_return_response_on_success', async () => {
      const response = { 
        status: 200, 
        data: { message: 'Success' } 
      };
      
      const result = await mockResponseInterceptor.onFulfilled(response);
      
      expect(result).toEqual(response);
    });

    test('should_handle_401_unauthorized_response', async () => {
      localStorage.setItem('auth', JSON.stringify({ token: 'test-token' }));
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      
      await expect(mockResponseInterceptor.onRejected(error)).rejects.toEqual(error);
      
      expect(localStorage.getItem('auth')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    test('should_propagate_non_401_errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Server Error' }
        }
      };
      
      await expect(mockResponseInterceptor.onRejected(error)).rejects.toEqual(error);
      
      expect(window.location.href).toBe('');
    });

    test('should_handle_network_errors_without_response', async () => {
      const error = {
        message: 'Network Error',
        code: 'ECONNABORTED'
      };
      
      await expect(mockResponseInterceptor.onRejected(error)).rejects.toEqual(error);
      
      expect(window.location.href).toBe('');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete auth flow', async () => {
      // Setup auth data
      const authData = { token: 'integration-token', user: 'testuser' };
      localStorage.setItem('auth', JSON.stringify(authData));
      
      // Test request interceptor
      const requestConfig = { headers: {} };
      const processedConfig = await mockRequestInterceptor.onFulfilled(requestConfig);
      expect(processedConfig.headers.Authorization).toBe('Bearer integration-token');
      
      // Test 401 response
      const unauthorizedError = {
        response: { status: 401 }
      };
      
      await expect(mockResponseInterceptor.onRejected(unauthorizedError)).rejects.toEqual(unauthorizedError);
      
      expect(localStorage.getItem('auth')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    test('should_handle_multiple_sequential_requests', async () => {
      const authData = { token: 'multi-token' };
      localStorage.setItem('auth', JSON.stringify(authData));
      
      // First request
      const config1 = { headers: {} };
      const result1 = await mockRequestInterceptor.onFulfilled(config1);
      expect(result1.headers.Authorization).toBe('Bearer multi-token');
      
      // Second request
      const config2 = { headers: { 'X-Custom': 'value' } };
      const result2 = await mockRequestInterceptor.onFulfilled(config2);
      expect(result2.headers.Authorization).toBe('Bearer multi-token');
      expect(result2.headers['X-Custom']).toBe('value');
    });
  });
});