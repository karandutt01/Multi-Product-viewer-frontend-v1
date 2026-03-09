import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../authContext';
import { useAuth } from '../../hooks/useAuth';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock Date.now for token expiration tests
const mockDateNow = jest.spyOn(Date, 'now');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(1640995200000);
  });

  afterEach(() => {
    mockDateNow.mockRestore();
  });

  const TestConsumer = ({ onAuthChange }: { onAuthChange?: (auth: any) => void }) => {
    const { auth, setAuth, isAuthenticated, setLocalStorageAuthEmpty } = useAuth();
    
    React.useEffect(() => {
      if (onAuthChange) {
        onAuthChange({ auth, setAuth, isAuthenticated, setLocalStorageAuthEmpty });
      }
    }, [auth, setAuth, isAuthenticated, setLocalStorageAuthEmpty, onAuthChange]);

    return (
      <div>
        <div data-testid="auth-json">{JSON.stringify(auth)}</div>
        <button onClick={() => setAuth({ token: 'test-token', userId: 1 })}>set-auth</button>
        <button onClick={() => setAuth({})}>clear-auth</button>
        <button onClick={() => setLocalStorageAuthEmpty()}>clear-storage</button>
        <div data-testid="is-authenticated">{isAuthenticated().toString()}</div>
      </div>
    );
  };

  describe('Authentication Initialization', () => {
    test('should initialize auth from valid localStorage data', async () => {
      const validAuth = { token: 'valid-token', userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validAuth));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      // Wait for the initialization effect to complete
      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent(JSON.stringify(validAuth));
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth');
    });

    test('should handle invalid JSON in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json{');

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent('{}');
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
    });

    test('should not set auth when token is missing', async () => {
      const authWithoutToken = { userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(authWithoutToken));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent('{}');
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth');
    });

    test('should initialize when no auth data exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent('{}');
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth');
    });
  })

  describe('localStorage Synchronization', () => {
    test('should store auth in localStorage when token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent('{}');
      });

      await user.click(screen.getByRole('button', { name: /set-auth/i }));

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'auth',
          JSON.stringify({ token: 'test-token', userId: 1 })
        );
      });
    });

    test('should remove auth from localStorage when no token', async () => {
      const validAuth = { token: 'valid-token', userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validAuth));
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent(JSON.stringify(validAuth));
      });

      await user.click(screen.getByRole('button', { name: /clear-auth/i }));

      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
      });
    });
  });

  describe('Token Authentication', () => {
    test('should return true for valid non-expired token', async () => {
      // Create a valid JWT token that expires in the future
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureExp, userId: 1 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const validToken = `header.${encodedPayload}.signature`;
      
      const validAuth = { token: validToken, userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validAuth));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });
    });

    test('should return false and clear auth for expired token', async () => {
      // Create an expired JWT token
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastExp, userId: 1 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const expiredToken = `header.${encodedPayload}.signature`;
      
      const expiredAuth = { token: expiredToken, userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredAuth));

      let authContext: any;
      const handleAuthChange = (context: any) => {
        authContext = context;
      };

      render(
        <AuthProvider>
          <TestConsumer onAuthChange={handleAuthChange} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });

      // Verify that setLocalStorageAuthEmpty was called
      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent('{}');
      });
    });

    test('should return false and clear auth for invalid token', async () => {
      const invalidAuth = { token: 'invalid-token-format', userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidAuth));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });

      // Verify that auth was cleared due to invalid token
      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent('{}');
      });
    });

    test('should return false when no token present', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });

    test('should handle token with special characters in base64 padding', async () => {
      // Create a token that requires base64 padding adjustment
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureExp, userId: 1, role: 'admin' };
      let encodedPayload = btoa(JSON.stringify(payload));
      
      // Replace standard base64 characters with URL-safe variants
      encodedPayload = encodedPayload.replace(/\+/g, '-').replace(/\//g, '_');
      // Remove padding to test the padding logic
      encodedPayload = encodedPayload.replace(/=/g, '');
      
      const tokenWithSpecialChars = `header.${encodedPayload}.signature`;
      const validAuth = { token: tokenWithSpecialChars, userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validAuth));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });
    });
  });

  describe('setLocalStorageAuthEmpty', () => {
    test('should clear auth state and localStorage', async () => {
      const validAuth = { token: 'valid-token', userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validAuth));
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent(JSON.stringify(validAuth));
      });

      await user.click(screen.getByRole('button', { name: /clear-storage/i }));

      await waitFor(() => {
        expect(screen.getByTestId('auth-json')).toHaveTextContent('{}');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle malformed JWT token structure', async () => {
      const malformedAuth = { token: 'header.only', userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(malformedAuth));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });

    test('should handle token with invalid JSON payload', async () => {
      const invalidPayload = 'invalid-json{';
      const encodedInvalidPayload = btoa(invalidPayload);
      const tokenWithInvalidPayload = `header.${encodedInvalidPayload}.signature`;
      
      const invalidAuth = { token: tokenWithInvalidPayload, userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidAuth));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });

    test('should handle token without expiration field', async () => {
      const payload = { userId: 1, role: 'user' }; // No exp field
      const encodedPayload = btoa(JSON.stringify(payload));
      const tokenWithoutExp = `header.${encodedPayload}.signature`;
      
      const authWithoutExp = { token: tokenWithoutExp, userId: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(authWithoutExp));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });
    });
  });
});