import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../login/Login';

jest.mock('../../service/authService', () => ({
  loginUser: jest.fn(),
}));
jest.mock('../../util/toaster', () => jest.fn());

jest.mock('../../context/authContext', () => {
  const setAuthMock = jest.fn();
  return {
    __esModule: true,
    useAuth: () => ({ setAuth: setAuthMock }),
    setAuthMock, // exported only from the mock for assertions
  };
});

import { loginUser } from '../../service/authService';
import toaster from '../../util/toaster';

const { setAuthMock } = jest.requireMock('../../context/authContext') as {
  setAuthMock: jest.Mock;
};

describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = async (email: string, password: string) => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), email);
    await user.type(screen.getByLabelText(/password/i), password);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
  };

  test('Login_shows_required_errors_on_empty_submit', async () => {
    render(<Login />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  test('Login_shows_invalid_email_message', async () => {
    render(<Login />);
    await fillForm('invalid-email', '12345678');

    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
  });

  test('Login_shows_min_length_password_message', async () => {
    render(<Login />);
    await fillForm('user@example.com', 'short');

    expect(
      await screen.findByText('Password must be at least 8 characters long')
    ).toBeInTheDocument();
  });

  test('Login_success_calls_toaster_with_message_and_sets_auth', async () => {
    (loginUser as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { message: 'Welcome back!', token: 't-123' },
    });

    render(<Login />);
    await fillForm('user@example.com', 'verysecurepassword');

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'verysecurepassword',
      });
    });

    expect(toaster).toHaveBeenCalledWith(200, 'Welcome back!');
    expect(setAuthMock).toHaveBeenCalledWith({ message: 'Welcome back!', token: 't-123' });
    // Root error should not be present
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test('Login_success_uses_default_message_when_missing', async () => {
    (loginUser as jest.Mock).mockResolvedValueOnce({
      status: 201,
      data: {}, // no message in payload
    });

    render(<Login />);
    await fillForm('user@example.com', 'verysecurepassword');

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalled();
    });
    expect(toaster).toHaveBeenCalledWith(201, 'Login successful');
    expect(setAuthMock).toHaveBeenCalledWith({});
  });

  test('Login_failure_displays_root_error', async () => {
    (loginUser as jest.Mock).mockRejectedValueOnce(new Error('Network down'));

    render(<Login />);
    await fillForm('user@example.com', 'verysecurepassword');

    expect(await screen.findByText('Network down')).toBeInTheDocument();
    expect(toaster).not.toHaveBeenCalled();
    expect(setAuthMock).not.toHaveBeenCalled();
  });
});