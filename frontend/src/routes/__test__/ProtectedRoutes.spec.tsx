import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';

// Mock external dependencies
jest.mock('../../hooks/useAuth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, state, replace }: { to: string; state?: any; replace?: boolean }) => (
    <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)} data-replace={replace}>
      Navigate to {to}
    </div>
  ),
  useLocation: jest.fn()
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe('ProtectedRoute Component', () => {
  const mockLocation = {
    pathname: '/dashboard',
    search: '',
    hash: '',
    state: null,
    key: 'test-key'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue(mockLocation);
  });

  it('should render children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
     isAuthenticated:jest.fn().mockReturnValue(true),
      setAuth: jest.fn(),
      setLocalStorageAuthEmpty:jest.fn().mockReturnValue(false),
      auth: { id: '1', email: 'test@example.com' }
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Dashboard Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
     isAuthenticated:jest.fn().mockReturnValue(false),
      setAuth: jest.fn(),
      setLocalStorageAuthEmpty:jest.fn().mockReturnValue(false),
      auth: { id: '1', email: 'test@example.com' }
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Dashboard Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
    expect(navigateElement).toHaveAttribute('data-replace', 'true');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should pass current location in state when redirecting', () => {
    mockUseAuth.mockReturnValue({
     isAuthenticated:jest.fn().mockReturnValue(false),
      setAuth: jest.fn(),
      setLocalStorageAuthEmpty:jest.fn().mockReturnValue(false),
      auth: { id: '1', email: 'test@example.com' }
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    const navigateElement = screen.getByTestId('navigate');
    const stateData = JSON.parse(navigateElement.getAttribute('data-state') || '{}');
    
    expect(stateData).toEqual({ from: mockLocation });
    expect(navigateElement).toHaveAttribute('data-to', '/login');
    expect(navigateElement).toHaveAttribute('data-replace', 'true');
  });

  it('should render different types of children when authenticated', () => {
    mockUseAuth.mockReturnValue({
     isAuthenticated:jest.fn().mockReturnValue(true),
      setAuth: jest.fn(),
      setLocalStorageAuthEmpty:jest.fn().mockReturnValue(false),
      auth: { id: '1', email: 'test@example.com' }
    });

    const ComplexChild = () => (
      <div>
        <h1 data-testid="title">Dashboard</h1>
        <p data-testid="description">Welcome to the dashboard</p>
        <button data-testid="action-button">Action</button>
      </div>
    );

    render(
      <TestWrapper>
        <ProtectedRoute>
          <ComplexChild />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toBeInTheDocument();
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the dashboard')).toBeInTheDocument();
  });

  it('should call isAuthenticated function from useAuth hook', () => {
    const mockIsAuthenticated = jest.fn().mockReturnValue(true);
    mockUseAuth.mockReturnValue({
      isAuthenticated:mockIsAuthenticated,
      setAuth: jest.fn(),
      setLocalStorageAuthEmpty: jest.fn().mockReturnValue(false),
      auth: { id: '1', email: 'test@example.com' }
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(mockIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(mockIsAuthenticated).toHaveBeenCalledWith();
  });

  it('should handle location changes correctly', () => {
    const customLocation = {
      pathname: '/profile',
      search: '?tab=settings',
      hash: '#section1',
      state: { from: '/dashboard' },
      key: 'custom-key'
    };

    mockUseLocation.mockReturnValue(customLocation);
     mockUseAuth.mockReturnValue({
      isAuthenticated: jest.fn().mockReturnValue(false),
      setAuth: jest.fn(),
      setLocalStorageAuthEmpty: jest.fn().mockReturnValue(false),
      auth: {}
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    const navigateElement = screen.getByTestId('navigate');
    const stateData = JSON.parse(navigateElement.getAttribute('data-state') || '{}');
    
    expect(stateData).toEqual({ from: customLocation });
    expect(navigateElement).toHaveAttribute('data-to', '/login');
  });
});