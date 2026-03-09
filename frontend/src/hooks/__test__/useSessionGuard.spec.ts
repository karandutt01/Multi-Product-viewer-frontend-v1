import { renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import useSessionGuard from '../useSessionGuard';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

describe('useSessionGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Hook Initialization', () => {
    test('should initialize with current session from localStorage', () => {
      const mockSessionId = 'session-123';
      mockLocalStorage.getItem.mockReturnValue(mockSessionId);

      renderHook(() => useSessionGuard());

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('activeSession');
      expect(mockAddEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    });

    test('should initialize with null when no session exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      renderHook(() => useSessionGuard());

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('activeSession');
      expect(mockAddEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    });
  });

  describe('Storage Event Handling', () => {
    test('should logout when activeSession changes to different value', () => {
      const initialSession = 'session-123';
      const newSession = 'session-456';
      
      mockLocalStorage.getItem.mockReturnValue(initialSession);

      const { unmount } = renderHook(() => useSessionGuard());

      // Get the storage event handler
      const storageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'storage'
      )?.[1];

      expect(storageHandler).toBeDefined();

      // Simulate storage event with different session
      const storageEvent = new StorageEvent('storage', {
        key: 'activeSession',
        newValue: newSession,
        oldValue: initialSession,
      });

      storageHandler(storageEvent);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });

      unmount();
    });

    test('should not logout when activeSession remains the same', () => {
      const sessionId = 'session-123';
      
      mockLocalStorage.getItem.mockReturnValue(sessionId);

      const { unmount } = renderHook(() => useSessionGuard());

      // Get the storage event handler
      const storageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'storage'
      )?.[1];

      // Simulate storage event with same session
      const storageEvent = new StorageEvent('storage', {
        key: 'activeSession',
        newValue: sessionId,
        oldValue: sessionId,
      });

      storageHandler(storageEvent);

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      unmount();
    });

    test('should ignore storage events for other keys', () => {
      const sessionId = 'session-123';
      
      mockLocalStorage.getItem.mockReturnValue(sessionId);

      const { unmount } = renderHook(() => useSessionGuard());

      // Get the storage event handler
      const storageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'storage'
      )?.[1];

      // Simulate storage event for different key
      const storageEvent = new StorageEvent('storage', {
        key: 'otherKey',
        newValue: 'someValue',
        oldValue: 'oldValue',
      });

      storageHandler(storageEvent);

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      unmount();
    });

    test('should not logout when no previous session exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { unmount } = renderHook(() => useSessionGuard());

      // Get the storage event handler
      const storageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'storage'
      )?.[1];

      // Simulate storage event when no previous session
      const storageEvent = new StorageEvent('storage', {
        key: 'activeSession',
        newValue: 'new-session',
        oldValue: null,
      });

      storageHandler(storageEvent);

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      unmount();
    });

    test('should handle null newValue in storage event', () => {
      const sessionId = 'session-123';
      
      mockLocalStorage.getItem.mockReturnValue(sessionId);

      const { unmount } = renderHook(() => useSessionGuard());

      // Get the storage event handler
      const storageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'storage'
      )?.[1];

      // Simulate storage event with null newValue (session cleared)
      const storageEvent = new StorageEvent('storage', {
        key: 'activeSession',
        newValue: null,
        oldValue: sessionId,
      });

      storageHandler(storageEvent);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });

      unmount();
    });
  });

  describe('Cleanup', () => {
    test('should cleanup event listener on unmount', () => {
      const { unmount } = renderHook(() => useSessionGuard());

      // Get the storage event handler that was added
      const storageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'storage'
      )?.[1];

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('storage', storageHandler);
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple rapid storage events', () => {
      const initialSession = 'session-123';
      const newSession1 = 'session-456';
      const newSession2 = 'session-789';
      
      mockLocalStorage.getItem.mockReturnValue(initialSession);

      const { unmount } = renderHook(() => useSessionGuard());

      // Get the storage event handler
      const storageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'storage'
      )?.[1];

      // Simulate multiple rapid storage events
      const event1 = new StorageEvent('storage', {
        key: 'activeSession',
        newValue: newSession1,
        oldValue: initialSession,
      });

      const event2 = new StorageEvent('storage', {
        key: 'activeSession',
        newValue: newSession2,
        oldValue: newSession1,
      });

      storageHandler(event1);
      storageHandler(event2);

      // Should handle both events without errors
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('should handle storage event with undefined newValue', () => {
      const sessionId = 'session-123';
      
      mockLocalStorage.getItem.mockReturnValue(sessionId);

      const { unmount } = renderHook(() => useSessionGuard());

      // Get the storage event handler
      const storageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'storage'
      )?.[1];

      // Simulate storage event with undefined newValue
      const storageEvent = new StorageEvent('storage', {
        key: 'activeSession',
        newValue: undefined as any,
        oldValue: sessionId,
      });

      storageHandler(storageEvent);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });

      unmount();
    });
  });
});