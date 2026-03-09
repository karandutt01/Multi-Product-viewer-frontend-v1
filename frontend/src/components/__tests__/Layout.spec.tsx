import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import useSessionGuard from '../../hooks/useSessionGuard';
import { LOGIN_CONSTANTS } from '../../constants/loginConstants';

// Mock dependencies
jest.mock('../../hooks/useSessionGuard');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../shared/SharedOffCanvas', () => {
  return function MockedSharedOffCanvas({ show, handleClose, placement, name, navigationItems }: any) {
    return (
      <div data-testid="shared-offcanvas">
        <div data-testid="offcanvas-show">{show.toString()}</div>
        <div data-testid="offcanvas-placement">{placement}</div>
        <div data-testid="offcanvas-name">{name}</div>
        <button data-testid="offcanvas-close" onClick={handleClose}>
          Close Offcanvas
        </button>
        <div data-testid="navigation-items">{JSON.stringify(navigationItems)}</div>
      </div>
    );
  };
});

const mockNavigate = jest.fn();
const mockUseSessionGuard = useSessionGuard as jest.MockedFunction<typeof useSessionGuard>;

// Mock localStorage
const mockLocalStorage = {
  removeItem: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSessionGuard.mockImplementation(() => {});
    
    // Mock useNavigate
    const { useNavigate } = require('react-router-dom');
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
  };

  describe('Hamburger Menu Functionality', () => {
    test('should open offcanvas when hamburger menu is clicked', () => {
      renderLayout();
      
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      
      // Initially offcanvas should be closed
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('false');
      
      fireEvent.click(hamburgerButton);
      
      // After click, offcanvas should be open
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('true');
    });

    test('should open offcanvas on Enter key press', () => {
      renderLayout();
      
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      
      // Initially offcanvas should be closed
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('false');
      
      fireEvent.keyDown(hamburgerButton, { 
        key: 'Enter'
      });
      
      // Verify offcanvas opens - this is the actual behavior we care about
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('true');
    });

    test('should open offcanvas on Space key press', () => {
      renderLayout();
      
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      
      // Initially offcanvas should be closed
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('false');
      
      fireEvent.keyDown(hamburgerButton, { 
        key: ' '
      });
      
      // Verify offcanvas opens - this is the actual behavior we care about
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('true');
    });

    test('should not open offcanvas on other key presses', () => {
      renderLayout();
      
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      
      // Initially offcanvas should be closed
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('false');
      
      fireEvent.keyDown(hamburgerButton, { 
        key: 'Tab'
      });
      
      // Offcanvas should remain closed
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('false');
    });

    test('should close offcanvas when handleClose is called', () => {
      renderLayout();
      
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      
      // Open the offcanvas first
      fireEvent.click(hamburgerButton);
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('true');
      
      // Close the offcanvas
      const closeButton = screen.getByTestId('offcanvas-close');
      fireEvent.click(closeButton);
      
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('false');
    });

    test('should pass correct props to SharedOffCanvas', () => {
      renderLayout();
      
      // Check initial props
      expect(screen.getByTestId('offcanvas-show')).toHaveTextContent('false');
      expect(screen.getByTestId('offcanvas-placement')).toHaveTextContent('start');
      expect(screen.getByTestId('offcanvas-name')).toHaveTextContent('Menu');
      
      // Check navigation items
      const navigationItemsText = screen.getByTestId('navigation-items').textContent;
      const navigationItems = JSON.parse(navigationItemsText || '[]');
      
      expect(navigationItems).toHaveLength(1);
      expect(navigationItems[0]).toEqual({
        label: "Dashboard",
        icon: "bi bi-columns-gap",
        route: "/dashboard"
      });
    });

    test('should update aria-expanded attribute when offcanvas state changes', () => {
      renderLayout();
      
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      
      // Initially aria-expanded should be false
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
      
      // Open offcanvas
      fireEvent.click(hamburgerButton);
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
      
      // Close offcanvas
      const closeButton = screen.getByTestId('offcanvas-close');
      fireEvent.click(closeButton);
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Logout Functionality', () => {
    test('should remove auth data and navigate to login on logout', () => {
      renderLayout();
      
      const logoutButton = screen.getByRole('button', { name: /logout from application/i });
      
      fireEvent.click(logoutButton);
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('activeSession');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledWith(`${LOGIN_CONSTANTS.ROUTES.LOGIN}`);
    });

    test('should handle multiple logout calls safely', () => {
      renderLayout();
      
      const logoutButton = screen.getByRole('button', { name: /logout from application/i });
      
      // Click logout multiple times
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);
      
      // Should still work without errors
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(6); // 2 calls per click * 3 clicks
      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });

    test('should trigger logout on Enter key press', () => {
      renderLayout();
      
      const logoutButton = screen.getByRole('button', { name: /logout from application/i });
      
      fireEvent.keyDown(logoutButton, { 
        key: 'Enter'
      });
      
      // Verify logout behavior occurred
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('activeSession');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledWith(`${LOGIN_CONSTANTS.ROUTES.LOGIN}`);
    });

    test('should trigger logout on Space key press', () => {
      renderLayout();
      
      const logoutButton = screen.getByRole('button', { name: /logout from application/i });
      
      fireEvent.keyDown(logoutButton, { 
        key: ' '
      });
      
      // Verify logout behavior occurred
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('activeSession');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledWith(`${LOGIN_CONSTANTS.ROUTES.LOGIN}`);
    });

    test('should not trigger logout on other key presses', () => {
      renderLayout();
      
      const logoutButton = screen.getByRole('button', { name: /logout from application/i });
      
      fireEvent.keyDown(logoutButton, { 
        key: 'Tab'
      });
      
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Layout component rendering', () => {
    test('should render hamburger menu with proper accessibility', () => {
      renderLayout();
      
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toHaveAttribute('role', 'button');
      expect(hamburgerButton).toHaveAttribute('tabIndex', '0');
      expect(hamburgerButton).toHaveAttribute('aria-label', 'Toggle navigation menu');
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
      expect(hamburgerButton).toHaveClass('hamburger', 'd-flex', 'justify-content-center', 'navbar-brand');
      
      // Check for hamburger icon
      const hamburgerIcon = hamburgerButton.querySelector('.bi-list');
      expect(hamburgerIcon).toBeInTheDocument();
      expect(hamburgerIcon).toHaveClass('text-white');
    });

    test('should render logout button with proper accessibility', () => {
      renderLayout();
      
      const logoutButton = screen.getByRole('button', { name: /logout from application/i });
      
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toHaveAttribute('type', 'button');
      expect(logoutButton).toHaveAttribute('aria-label', 'Logout from application');
      expect(logoutButton).toHaveClass('btn', 'btn-outline-light', 'btn-sm');
      
      // Check for logout icon
      const logoutIcon = logoutButton.querySelector('.bi-box-arrow-right');
      expect(logoutIcon).toBeInTheDocument();
      
      // Check for logout text (visible on medium screens and up)
      const logoutText = screen.getByText('Logout');
      expect(logoutText).toBeInTheDocument();
      expect(logoutText).toHaveClass('d-none', 'd-md-inline');
    });

    test('should render main content area', () => {
      renderLayout();
      
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveClass('main-content');
      
      // Check that children are rendered
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});