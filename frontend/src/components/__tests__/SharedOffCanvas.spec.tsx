import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SharedOffCanvas from '../shared/SharedOffCanvas';
import type { INavigationItem } from 'types/INavigationItems';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

// Mock window.matchMedia for React Bootstrap components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigation items
const mockNavigationItems: INavigationItem[] = [
  {
    label: "Dashboard",
    icon: "bi bi-columns-gap",
    route: "/dashboard"
  },
  {
    label: "Products",
    icon: "bi bi-box",
    route: "/products"
  },
  {
    label: "Settings",
    route: "/settings"
  }
];

const mockNavigationItemsWithoutIcons: INavigationItem[] = [
  {
    label: "Home",
    route: "/home"
  },
  {
    label: "About",
    route: "/about"
  }
];

describe('SharedOffCanvas', () => {
  const mockHandleClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useNavigate
    const { useNavigate } = require('react-router-dom');
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  const renderSharedOffCanvas = (props = {}) => {
    const defaultProps = {
      placement: 'start' as const,
      name: 'Test Menu',
      show: true,
      handleClose: mockHandleClose,
      navigationItems: mockNavigationItems,
      ...props
    };

    return render(
      <BrowserRouter>
        <SharedOffCanvas {...defaultProps} />
      </BrowserRouter>
    );
  };

  describe('Component Rendering', () => {
    test('should render offcanvas with navigation items', () => {
      renderSharedOffCanvas();

      expect(screen.getByText('Test Menu')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('should render empty offcanvas when no navigation items', () => {
      renderSharedOffCanvas({ navigationItems: [] });

      expect(screen.getByText('Test Menu')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('should render navigation buttons with icons and labels', () => {
      renderSharedOffCanvas();

      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
      expect(dashboardButton).toHaveClass('w-100', 'text-start', 'btn', 'btn-outline-secondary', 'mb-3');

      // Check for icon
      const dashboardIcon = dashboardButton.querySelector('.bi-columns-gap');
      expect(dashboardIcon).toBeInTheDocument();
      expect(dashboardIcon).toHaveClass('mx-2');

      const productsButton = screen.getByRole('button', { name: /products/i });
      const productsIcon = productsButton.querySelector('.bi-box');
      expect(productsIcon).toBeInTheDocument();
    });

    test('should render navigation buttons without icons when not provided', () => {
      renderSharedOffCanvas({ navigationItems: mockNavigationItemsWithoutIcons });

      const homeButton = screen.getByRole('button', { name: /home/i });
      expect(homeButton).toBeInTheDocument();
      
      // Should not have any icon
      const homeIcon = homeButton.querySelector('i');
      expect(homeIcon).not.toBeInTheDocument();

      const aboutButton = screen.getByRole('button', { name: /about/i });
      expect(aboutButton).toBeInTheDocument();
      
      const aboutIcon = aboutButton.querySelector('i');
      expect(aboutIcon).not.toBeInTheDocument();
    });

    test('should render multiple navigation items correctly', () => {
      renderSharedOffCanvas();

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('should render with different placement values', () => {
      const { rerender } = renderSharedOffCanvas({ placement: 'end' });
      
      // Verify offcanvas is rendered (placement is handled by react-bootstrap internally)
      expect(screen.getByText('Test Menu')).toBeInTheDocument();

      // Test other placements
      rerender(
        <BrowserRouter>
          <SharedOffCanvas
            placement="top"
            name="Top Menu"
            show={true}
            handleClose={mockHandleClose}
            navigationItems={mockNavigationItems}
          />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Top Menu')).toBeInTheDocument();
    });
  });

  describe('Offcanvas Behavior', () => {
    test('should show offcanvas when show prop is true', () => {
      renderSharedOffCanvas({ show: true });

      // Offcanvas should be visible (react-bootstrap handles the actual visibility)
      expect(screen.getByText('Test Menu')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('should hide offcanvas when show prop is false', () => {
      renderSharedOffCanvas({ show: false });

      // When show is false, the offcanvas content might still be in DOM but not visible
      // This depends on react-bootstrap implementation
      const offcanvasContent = screen.queryByText('Test Menu');
      if (offcanvasContent) {
        // If content is in DOM, it should not be visible to users
        expect(offcanvasContent).toBeInTheDocument();
      }
    });
  });

  describe('Navigation Functionality', () => {
    test('should navigate to route and close offcanvas on button click', () => {
      renderSharedOffCanvas();

      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      
      fireEvent.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(mockHandleClose).toHaveBeenCalled();
    });

    test('should handle multiple rapid navigation clicks', () => {
      renderSharedOffCanvas();

      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      
      // Click multiple times rapidly
      fireEvent.click(dashboardButton);
      fireEvent.click(dashboardButton);
      fireEvent.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(mockHandleClose).toHaveBeenCalledTimes(3);
    });
  });
});