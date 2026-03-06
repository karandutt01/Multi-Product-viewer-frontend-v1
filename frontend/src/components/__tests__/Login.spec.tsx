import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../login/Login';
import { loginUser } from '../../service/authService';
import toaster from '../../util/toaster';
import { BrowserRouter } from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';


jest.mock('../../service/authService', () => ({
  loginUser: jest.fn(),
}));

jest.mock('../../util/toaster', () => jest.fn());

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
const mockToaster = toaster as jest.MockedFunction<typeof toaster>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  
describe('Login component', () => {
 const mockSetAuth = jest.fn();
  const mockIsAuthenticated = jest.fn();
  const mockSetLocalStorageAuthEmpty = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup useAuth mock to return setAuth function
    mockUseAuth.mockReturnValue({
      auth: {},
      setAuth: mockSetAuth,
      isAuthenticated: mockIsAuthenticated,
      setLocalStorageAuthEmpty: mockSetLocalStorageAuthEmpty,
    });
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };
  
  const fillForm = async (email: string, password: string) => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), email);
    await user.type(screen.getByLabelText(/password/i), password);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
  };

  test('Login_shows_required_errors_on_empty_submit', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  test('Login_shows_invalid_email_message', async () => {
    renderLogin();
    await fillForm('invalid-email', '12345678');

    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
  });

  test('Login_shows_min_length_password_message', async () => {
    renderLogin();
    await fillForm('user@example.com', 'short');

    expect(
      await screen.findByText('Password must be at least 8 characters long')
    ).toBeInTheDocument();
  });

  test('Login_success_calls_toaster_with_message_and_sets_auth', async () => {
    mockLoginUser.mockResolvedValueOnce({
      status: 200,
      data: { message: 'Welcome back!', token: 't-123' },
    } as any);

    renderLogin();
    await fillForm('user@example.com', 'verysecurepassword');

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'verysecurepassword',
      });
    });

    expect(mockToaster).toHaveBeenCalledWith(200, 'Welcome back!');
    expect(mockSetAuth).toHaveBeenCalledWith({ message: 'Welcome back!', token: 't-123' });
    // Root error should not be present
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test('Login_success_uses_default_message_when_missing', async () => {
    mockLoginUser.mockResolvedValueOnce({
      status: 201,
      data: {}, // no message in payload
    } as any);

    renderLogin();
    await fillForm('user@example.com', 'verysecurepassword');

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalled();
    });
    expect(mockToaster).toHaveBeenCalledWith(201, 'Login successful');
    expect(mockSetAuth).toHaveBeenCalledWith({});
  });

  test('Login_failure_displays_root_error', async () => {
    mockLoginUser.mockRejectedValueOnce(new Error('Network down'));

    renderLogin();
    await fillForm('user@example.com', 'verysecurepassword');

    expect(await screen.findByText('Network down')).toBeInTheDocument();
    expect(mockToaster).not.toHaveBeenCalled();
    expect(mockSetAuth).not.toHaveBeenCalled();
  });
});