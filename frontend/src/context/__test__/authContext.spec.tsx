import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../authContext';
import { useAuth } from '../../hooks/useAuth';

describe('authContext', () => {
  test('useAuth_throws_when_used_outside_AuthProvider', () => {
    // Suppress React error output for this intentional throw to keep test output clean
    const originalError = console.error;
    console.error = jest.fn();

    const OrphanConsumer = () => {
      // This should throw since there is no provider in the tree
      useAuth();
      return null;
    };

    expect(() => render(<OrphanConsumer />)).toThrow('useAuth must be used within AuthProvider');

    console.error = originalError;
  });

  test('AuthProvider_exposes_initial_empty_auth_and_updates_with_setAuth', async () => {
    const user = userEvent.setup();

    const Consumer = () => {
      const { auth, setAuth } = useAuth();
      return (
        <div>
          <div data-testid="auth-json">{JSON.stringify(auth)}</div>
          <button onClick={() => setAuth({ userId: 1, name: 'Jane' })}>set-auth</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // Initial value from useState({})
    expect(screen.getByTestId('auth-json')).toHaveTextContent('{}');

    await user.click(screen.getByRole('button', { name: /set-auth/i }));
    await waitFor(() => {
      expect(screen.getByTestId('auth-json')).toHaveTextContent('"userId":1');
      expect(screen.getByTestId('auth-json')).toHaveTextContent('"name":"Jane"');
    });
  });

  test('AuthProvider_supports_functional_updates_in_setAuth', async () => {
    const user = userEvent.setup();

    const Consumer = () => {
      const { auth, setAuth } = useAuth();
      return (
        <div>
          <div data-testid="auth-json">{JSON.stringify(auth)}</div>
          <button onClick={() => setAuth({ id: 10 })}>init-auth</button>
          <button
            onClick={() =>
              setAuth(prev => ({
                ...prev,
                role: 'admin',
              }))
            }
          >
            merge-auth
          </button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // Initialize
    await user.click(screen.getByRole('button', { name: /init-auth/i }));
    await waitFor(() => {
      expect(screen.getByTestId('auth-json')).toHaveTextContent('"id":10');
    });

    // Functional update merges with previous state
    await user.click(screen.getByRole('button', { name: /merge-auth/i }));
    await waitFor(() => {
      const json = screen.getByTestId('auth-json').textContent || '';
      expect(json).toContain('"id":10');
      expect(json).toContain('"role":"admin"');
    });
  });
});