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

  it('handles empty message string', () => {
    toaster(200, '');
    expect(toast.success).toHaveBeenCalledWith('', expect.any(Object));
    jest.clearAllMocks();
    toaster(400, '');
    expect(toast.error).toHaveBeenCalledWith('', expect.any(Object));
  });

  it('calls only one toast method per invocation', () => {
    toaster(200, 'ok');
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(0);

    jest.clearAllMocks();
    toaster(500, 'err');
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledTimes(0);
  });
});