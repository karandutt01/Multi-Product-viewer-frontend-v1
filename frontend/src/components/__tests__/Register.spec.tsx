import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../register/Register';
import { registerUser } from '../../service/authService';
import toaster from '../../util/toaster';
import { BrowserRouter } from 'react-router-dom';

// Mock external dependencies
jest.mock('../../service/authService');
jest.mock('../../util/toaster');


const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields and submit button', () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    expect(screen.getByLabelText(/Firstname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lastname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('shows validation errors when fields are empty and form is submitted', async () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Firstname is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Lastname is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('shows email format error for invalid email', async () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'invalidemail' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows password minLength error for short password', async () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data and calls registerUser, shows success toaster', async () => {
    (registerUser as jest.Mock).mockResolvedValue({
      status: 201,
      data: { message: 'Registration successful' }
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
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

  it('does not show root error if API error does not have details', async () => {
    (registerUser as jest.Mock).mockRejectedValue({
      message: 'Network Error'
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'Jane' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Smith' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Network Error/i)).not.toBeInTheDocument();
    });
  });

  // Additional test cases for better coverage
  it('should prevent multiple form submissions when loading', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (registerUser as jest.Mock).mockReturnValue(promise);

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'John' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Register/i });
    
    // First click
    fireEvent.click(submitButton);

    // Verify button is disabled or shows loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    
    // Second click while loading - should not trigger another submission
    fireEvent.click(submitButton);

    // Resolve the promise
    resolvePromise!({
      status: 201,
      data: { message: 'Registration successful' }
    });

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle API error without response data', async () => {
    (registerUser as jest.Mock).mockRejectedValue({
      message: 'Network Error',
      code: 'NETWORK_ERROR'
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'John' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
      // Should not display the error message since there's no response.data.details
      expect(screen.queryByText(/Network Error/i)).not.toBeInTheDocument();
    });
  });

  it('should reset form after successful registration', async () => {
    (registerUser as jest.Mock).mockResolvedValue({
      status: 201,
      data: { message: 'Registration successful' }
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    const firstnameInput = screen.getByLabelText(/Firstname/i);
    const lastnameInput = screen.getByLabelText(/Lastname/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.input(firstnameInput, { target: { value: 'John' } });
    fireEvent.input(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.input(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(toaster).toHaveBeenCalledWith(201, 'Registration successful');
    });

    // Check if form is reset
    expect(firstnameInput).toHaveValue('');
    expect(lastnameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
  });

  it('should navigate to login after successful registration', async () => {
    (registerUser as jest.Mock).mockResolvedValue({
      status: 201,
      data: { message: 'Registration successful' }
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'John' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should show multiple validation errors at once', async () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'invalid' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Firstname is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Lastname is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  it('should handle network timeout errors', async () => {
    (registerUser as jest.Mock).mockRejectedValue({
      code: 'ECONNABORTED',
      message: 'timeout of 5000ms exceeded'
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'John' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
      // Should not display timeout error since there's no response.data.details
      expect(screen.queryByText(/timeout/i)).not.toBeInTheDocument();
    });
  });

  it('should handle component unmount during API call', async () => {
    let rejectPromise: (error: any) => void;
    const promise = new Promise((_, reject) => {
      rejectPromise = reject;
    });
    
    (registerUser as jest.Mock).mockReturnValue(promise);

    const { unmount } = render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'John' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Unmount component before API call completes
    unmount();

    // Reject the promise after unmount
    rejectPromise!({
      response: {
        data: {
          details: [{ field: 'email', message: 'Email already exists' }]
        }
      }
    });

    // Should not throw any errors or warnings about setting state on unmounted component
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
    });
  });

  it('should handle API error with different error structure', async () => {
    (registerUser as jest.Mock).mockRejectedValue({
      response: {
        status: 422,
        data: {
          errors: {
            email: ['Email is already taken'],
            password: ['Password is too weak']
          }
        }
      }
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    fireEvent.input(screen.getByLabelText(/Firstname/i), { target: { value: 'John' } });
    fireEvent.input(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.input(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
      // Should not display these errors since the component expects response.data.details format
      expect(screen.queryByText(/Email is already taken/i)).not.toBeInTheDocument();
    });
  });
});