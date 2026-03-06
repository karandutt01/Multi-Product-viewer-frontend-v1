import toaster from '../toaster';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('toaster utility', () => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test cases to cover the specific lines in coverage report
  describe('isSuccess evaluation and notify function assignment', () => {
    it('should set isSuccess to true and use toast.success for status 200', () => {
      toaster(200, 'Success message');
      
      // Verify that toast.success is called (covering notify assignment)
      expect(toast.success).toHaveBeenCalledWith('Success message', expect.objectContaining(defaultOptions));
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should set isSuccess to true and use toast.success for status 201', () => {
      toaster(201, 'Created successfully');
      
      // Verify that toast.success is called (covering notify assignment)
      expect(toast.success).toHaveBeenCalledWith('Created successfully', expect.objectContaining(defaultOptions));
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should set isSuccess to false and use toast.error for status 400', () => {
      toaster(400, 'Bad request');
      
      // Verify that toast.error is called (covering notify assignment)
      expect(toast.error).toHaveBeenCalledWith('Bad request', expect.objectContaining(defaultOptions));
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('should set isSuccess to false and use toast.error for status 500', () => {
      toaster(500, 'Server error');
      
      // Verify that toast.error is called (covering notify assignment)
      expect(toast.error).toHaveBeenCalledWith('Server error', expect.objectContaining(defaultOptions));
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('should call notify function with correct message and options for success', () => {
      const testMessage = 'Operation completed';
      toaster(200, testMessage);
      
      // Verify notify function call with exact parameters
      expect(toast.success).toHaveBeenCalledWith(testMessage, defaultOptions);
      expect(toast.success).toHaveBeenCalledTimes(1);
    });

    it('should call notify function with correct message and options for error', () => {
      const testMessage = 'Operation failed';
      toaster(404, testMessage);
      
      // Verify notify function call with exact parameters
      expect(toast.error).toHaveBeenCalledWith(testMessage, defaultOptions);
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });

  // Success scenarios
  it('calls toast.success for status 200', () => {
    toaster(200, 'Success message');
    expect(toast.success).toHaveBeenCalledWith('Success message', expect.objectContaining(defaultOptions));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('calls toast.success for status 201', () => {
    toaster(201, 'Created!');
    expect(toast.success).toHaveBeenCalledWith('Created!', expect.objectContaining(defaultOptions));
    expect(toast.error).not.toHaveBeenCalled();
  });

  // Error scenarios
  it('calls toast.error for status 400', () => {
    toaster(400, 'Bad request');
    expect(toast.error).toHaveBeenCalledWith('Bad request', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('calls toast.error for status 500', () => {
    toaster(500, 'Server error');
    expect(toast.error).toHaveBeenCalledWith('Server error', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('calls toast.error for status 401 (Unauthorized)', () => {
    toaster(401, 'Unauthorized access');
    expect(toast.error).toHaveBeenCalledWith('Unauthorized access', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('calls toast.error for status 403 (Forbidden)', () => {
    toaster(403, 'Access forbidden');
    expect(toast.error).toHaveBeenCalledWith('Access forbidden', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('calls toast.error for status 404 (Not Found)', () => {
    toaster(404, 'Resource not found');
    expect(toast.error).toHaveBeenCalledWith('Resource not found', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('calls toast.error for status 422 (Unprocessable Entity)', () => {
    toaster(422, 'Validation failed');
    expect(toast.error).toHaveBeenCalledWith('Validation failed', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('calls toast.error for status 502 (Bad Gateway)', () => {
    toaster(502, 'Bad gateway');
    expect(toast.error).toHaveBeenCalledWith('Bad gateway', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('calls toast.error for status 503 (Service Unavailable)', () => {
    toaster(503, 'Service unavailable');
    expect(toast.error).toHaveBeenCalledWith('Service unavailable', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  // Edge cases and boundary values
  it('treats unknown status (e.g., 0) as error', () => {
    toaster(0, 'Unknown status');
    expect(toast.error).toHaveBeenCalledWith('Unknown status', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('treats non-200/201 2xx (e.g., 204) as error', () => {
    toaster(204, 'No Content');
    expect(toast.error).toHaveBeenCalledWith('No Content', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('treats 202 (Accepted) as error', () => {
    toaster(202, 'Accepted');
    expect(toast.error).toHaveBeenCalledWith('Accepted', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('treats negative status codes as error', () => {
    toaster(-1, 'Negative status');
    expect(toast.error).toHaveBeenCalledWith('Negative status', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('treats very large status codes as error', () => {
    toaster(999, 'Large status code');
    expect(toast.error).toHaveBeenCalledWith('Large status code', expect.objectContaining(defaultOptions));
    expect(toast.success).not.toHaveBeenCalled();
  });

  // Message edge cases
  it('handles empty message string', () => {
    toaster(200, '');
    expect(toast.success).toHaveBeenCalledWith('', expect.any(Object));
    jest.clearAllMocks();
    toaster(400, '');
    expect(toast.error).toHaveBeenCalledWith('', expect.any(Object));
  });

  it('handles undefined message', () => {
    toaster(200, undefined as any);
    expect(toast.success).toHaveBeenCalledWith(undefined, expect.any(Object));
    jest.clearAllMocks();
    toaster(400, undefined as any);
    expect(toast.error).toHaveBeenCalledWith(undefined, expect.any(Object));
  });

  it('handles null message', () => {
    toaster(200, null as any);
    expect(toast.success).toHaveBeenCalledWith(null, expect.any(Object));
    jest.clearAllMocks();
    toaster(400, null as any);
    expect(toast.error).toHaveBeenCalledWith(null, expect.any(Object));
  });

  it('handles very long message strings', () => {
    const longMessage = 'A'.repeat(1000);
    toaster(200, longMessage);
    expect(toast.success).toHaveBeenCalledWith(longMessage, expect.any(Object));
  });

  it('handles special characters in message', () => {
    const specialMessage = '!@#$%^&*()_+{}|:"<>?[]\\;\',./ 中文 🚀';
    toaster(200, specialMessage);
    expect(toast.success).toHaveBeenCalledWith(specialMessage, expect.any(Object));
  });

  // Options verification
  it('uses correct options for both success and error', () => {
    toaster(200, 'Success');
    expect(toast.success).toHaveBeenCalledWith('Success', expect.objectContaining(defaultOptions));
    toaster(400, 'Error');
    expect(toast.error).toHaveBeenCalledWith('Error', expect.objectContaining(defaultOptions));
  });

  it('passes the exact message to toast (success and error)', () => {
    toaster(201, 'Custom success');
    expect(toast.success).toHaveBeenCalledWith('Custom success', expect.any(Object));
    toaster(400, 'Custom error');
    expect(toast.error).toHaveBeenCalledWith('Custom error', expect.any(Object));
  });

  // Function call verification
  it('calls only one toast method per invocation', () => {
    toaster(200, 'ok');
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(0);

    jest.clearAllMocks();
    toaster(500, 'err');
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledTimes(0);
  });

  // Type coercion tests
  it('handles boolean message values', () => {
    toaster('200' as any, 'String status');
    expect(toast.error).toHaveBeenCalledWith('String status', expect.any(Object));
    expect(toast.success).not.toHaveBeenCalled();
    
    jest.clearAllMocks();
    toaster('400' as any, 'String error status');
    expect(toast.error).toHaveBeenCalledWith('String error status', expect.any(Object));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('handles number message values', () => {
    toaster(200, 123 as any);
    expect(toast.success).toHaveBeenCalledWith(123, expect.any(Object));
    jest.clearAllMocks();
    toaster(400, 456 as any);
    expect(toast.error).toHaveBeenCalledWith(456, expect.any(Object));
  });

  // Multiple calls verification
  it('handles multiple consecutive calls', () => {
    toaster(200, 'First success');
    toaster(201, 'Second success');
    toaster(400, 'First error');
    toaster(500, 'Second error');

    expect(toast.success).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(toast.success).toHaveBeenNthCalledWith(1, 'First success', expect.any(Object));
    expect(toast.success).toHaveBeenNthCalledWith(2, 'Second success', expect.any(Object));
    expect(toast.error).toHaveBeenNthCalledWith(1, 'First error', expect.any(Object));
    expect(toast.error).toHaveBeenNthCalledWith(2, 'Second error', expect.any(Object));
  });
});