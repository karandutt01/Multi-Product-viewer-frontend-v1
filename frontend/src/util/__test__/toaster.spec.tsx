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

  it('passes the correct message to toast', () => {
    toaster(201, 'Custom success');
    expect(toast.success).toHaveBeenCalledWith('Custom success', expect.any(Object));
    toaster(400, 'Custom error');
    expect(toast.error).toHaveBeenCalledWith('Custom error', expect.any(Object));
  });

  it('uses correct options for both success and error', () => {
    toaster(200, 'Success');
    expect(toast.success).toHaveBeenCalledWith('Success', expect.objectContaining(defaultOptions));
    toaster(400, 'Error');
    expect(toast.error).toHaveBeenCalledWith('Error', expect.objectContaining(defaultOptions));
  });
});