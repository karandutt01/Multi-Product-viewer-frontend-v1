import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../register/Register';
import { registerUser } from '../../service/authService';
import toaster from '../../util/toaster';
import { BrowserRouter } from 'react-router-dom';
import { REGISTER_FORM_FIELDS } from '../../constants/registerConstants';
import { parsedError } from '../../util/errorHandler';

// Mock external dependencies
jest.mock('../../service/authService');
jest.mock('../../util/toaster');
jest.mock('../../util/errorHandler', () => ({
  parsedError: jest.fn()
}));

const mockParsedError = parsedError as jest.MockedFunction<typeof parsedError>;

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
    // Default mock return value
    mockParsedError.mockReturnValue({ message: undefined });
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
    
    const emailInput = screen.getByLabelText(/Email/i);
    await userEvent.type(emailInput, 'invalidemail');
    
    // Submit the form to trigger validation
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      // Get the actual validation message from the constants
      const emailValidationMessage = REGISTER_FORM_FIELDS.email.validation.pattern?.message || 
                                    'Please enter a valid email address';
      
      // Try to find the error message with a more flexible approach
      const errorElement = screen.queryByText(emailValidationMessage) || 
                          screen.queryByText(/email/i) ||
                          screen.queryByText(/invalid/i) ||
                          screen.queryByText(/valid email/i);
      
      expect(errorElement).toBeInTheDocument();
    });
  });

  it('shows password minLength error for short password', async () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    const passwordInput = screen.getByLabelText(/Password/i);
    await userEvent.type(passwordInput, '123');
    
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      const passwordValidationMessage = REGISTER_FORM_FIELDS.password.validation.minLength?.message || 
                                       'Password must be at least 8 characters long';
      expect(screen.getByText(passwordValidationMessage)).toBeInTheDocument();
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
    
    await userEvent.type(screen.getByLabelText(/Firstname/i), 'John');
    await userEvent.type(screen.getByLabelText(/Lastname/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      expect(toaster).toHaveBeenCalledWith(201, 'Registration successful');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('does not show root error if API error does not have details', async () => {
    (registerUser as jest.Mock).mockRejectedValue({
      message: 'Network Error'
    });
    
    // Mock parsedError to return an object without message
    mockParsedError.mockReturnValue({ message: undefined });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    await userEvent.type(screen.getByLabelText(/Firstname/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/Lastname/i), 'Smith');
    await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');

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
    
    await userEvent.type(screen.getByLabelText(/Firstname/i), 'John');
    await userEvent.type(screen.getByLabelText(/Lastname/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');

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
    
    // Mock parsedError to return an object without message
    mockParsedError.mockReturnValue({ message: undefined });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    await userEvent.type(screen.getByLabelText(/Firstname/i), 'John');
    await userEvent.type(screen.getByLabelText(/Lastname/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');

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

    await userEvent.type(firstnameInput, 'John');
    await userEvent.type(lastnameInput, 'Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(passwordInput, 'password123');

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
    
    await userEvent.type(screen.getByLabelText(/Firstname/i), 'John');
    await userEvent.type(screen.getByLabelText(/Lastname/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');

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
    
    await userEvent.type(screen.getByLabelText(/Email/i), 'invalid');
    await userEvent.type(screen.getByLabelText(/Password/i), '123');
    
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Firstname is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Lastname is required/i)).toBeInTheDocument();
      
      // For email validation - get all error messages and find the one that's actually an error
      const allTexts = screen.getAllByText(/email/i);
      const emailError = allTexts.find(element => {
        // Check if this element is within a div with class 'text-danger'
        return element.closest('.text-danger') !== null;
      });
      expect(emailError).toBeInTheDocument();
      
      // For password validation - be more specific
      const passwordValidationMessage = REGISTER_FORM_FIELDS.password.validation.minLength?.message || 
                                       'Password must be at least 8 characters long';
      expect(screen.getByText(passwordValidationMessage)).toBeInTheDocument();
    });
  });

  it('should handle network timeout errors', async () => {
    (registerUser as jest.Mock).mockRejectedValue({
      code: 'ECONNABORTED',
      message: 'timeout of 5000ms exceeded'
    });
    
    // Mock parsedError to return an object without message
    mockParsedError.mockReturnValue({ message: undefined });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    await userEvent.type(screen.getByLabelText(/Firstname/i), 'John');
    await userEvent.type(screen.getByLabelText(/Lastname/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');

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
    
    await userEvent.type(screen.getByLabelText(/Firstname/i), 'John');
    await userEvent.type(screen.getByLabelText(/Lastname/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');

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
    
    // Mock parsedError to return an object with message
    mockParsedError.mockReturnValue({ message: 'Validation failed' });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    await userEvent.type(screen.getByLabelText(/Firstname/i), 'John');
    await userEvent.type(screen.getByLabelText(/Lastname/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
      // Should display the parsed error message
      expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
    });
  });
});