import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../Register';
import { registerUser } from '../../service/authService';
import toaster from '../../util/toaster';

// Mock external dependencies
jest.mock('../../service/authService');
jest.mock('../../util/toaster');

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields and submit button', () => {
    render(<Register />);
    expect(screen.getByLabelText(/Firstname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lastname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('shows validation errors when fields are empty and form is submitted', async () => {
    render(<Register />);
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Firstname is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Lastname is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('shows email format error for invalid email', async () => {
    render(<Register />);
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'invalidemail' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    });
  });

  it('shows password minLength error for short password', async () => {
    render(<Register />);
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 6 characters long/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data and calls registerUser, shows success toaster', async () => {
    (registerUser as jest.Mock).mockResolvedValue({
      status: 201,
      data: { message: 'Registration successful' }
    });

    render(<Register />);
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'John' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      expect(toaster).toHaveBeenCalledWith(201, 'Registration successful');
    });
  });

  it('shows API error message when registerUser fails with details', async () => {
    (registerUser as jest.Mock).mockRejectedValue({
      response: {
        data: {
          details: [{ field: 'email', message: 'Email already exists' }]
        }
      },
      message: 'Email already exists'
    });

    render(<Register />);
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'Jane' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Smith' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });
  });

  it('does not show root error if API error does not have details', async () => {
    (registerUser as jest.Mock).mockRejectedValue({
      message: 'Network Error'
    });

    render(<Register />);
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'Jane' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Smith' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Network Error/i)).not.toBeInTheDocument();
    });
  });
});