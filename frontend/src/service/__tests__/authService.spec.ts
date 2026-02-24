import { registerUser } from '../authService';
import axiosConfig from '../axios';
import { IRegisterForm } from '../../types/IRegisterForm';

jest.mock('../axios');

describe('authService - registerUser', () => {
  const mockUser: IRegisterForm = {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    password: 'password123'
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call axiosConfig.post with correct URL and data', async () => {
    const mockResponse = { data: { message: 'Registered' }, status: 201 };
    (axiosConfig.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await registerUser(mockUser);

    expect(axiosConfig.post).toHaveBeenCalledWith('/register', mockUser);
    expect(result).toBe(mockResponse);
  });

  it('should propagate errors from axiosConfig.post', async () => {
    const error = new Error('Network Error');
    (axiosConfig.post as jest.Mock).mockRejectedValueOnce(error);

    await expect(registerUser(mockUser)).rejects.toThrow('Network Error');
    expect(axiosConfig.post).toHaveBeenCalledWith('/register', mockUser);
  });

  it('should handle empty user data gracefully', async () => {
    const emptyUser = { firstname: '', lastname: '', email: '', password: '' };
    const mockResponse = { data: { message: 'Registered' }, status: 201 };
    (axiosConfig.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await registerUser(emptyUser as IRegisterForm);

    expect(axiosConfig.post).toHaveBeenCalledWith('/register', emptyUser);
    expect(result).toBe(mockResponse);
  });
});