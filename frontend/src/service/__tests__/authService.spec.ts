import { loginUser, registerUser } from '../authService';
import axiosConfig from '../axios';
import { IRegisterForm } from '../../types/IRegisterForm';
import { ILogin } from '../../types/ILogin';

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

describe('authService - loginUser', () => {
  const mockUser: ILogin = {
    email: 'john@example.com',
    password: '12345678'
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call axiosConfig.post with correct URL and data', async () => {
    const mockResponse = { data: { message: 'Login Successful' }, status: 201 };
    (axiosConfig.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await loginUser(mockUser);

    expect(axiosConfig.post).toHaveBeenCalledWith('/login', mockUser);
    expect(result).toBe(mockResponse);
  });

  it('should propagate errors from axiosConfig.post', async () => {
    const error = new Error('Network Error');
    (axiosConfig.post as jest.Mock).mockRejectedValueOnce(error);

    await expect(loginUser(mockUser)).rejects.toThrow('Network Error');
    expect(axiosConfig.post).toHaveBeenCalledWith('/login', mockUser);
  });

  it('should handle empty user data gracefully', async () => {
    const emptyUser = { email: '', password: '' };
    const mockResponse = { data: { message: 'Login Successfullly' }, status: 201 };
    (axiosConfig.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await loginUser(emptyUser as ILogin);

    expect(axiosConfig.post).toHaveBeenCalledWith('/login', emptyUser);
    expect(result).toBe(mockResponse);
  });
});