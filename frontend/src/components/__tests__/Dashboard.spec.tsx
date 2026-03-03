import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../dashboard/Dashboard';
import { addProduct, productList } from '../../service/authService';
import toaster from '../../util/toaster';
import { parsedError } from '../../util/errorHandler';
import { AxiosResponse } from 'axios';
import { DASHBOARD_CONSTANTS } from '../../constants/dashboardConstants';

// Mock dependencies
jest.mock('../../service/authService');
jest.mock('../../util/toaster');
jest.mock('../../util/errorHandler');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockProductList = productList as jest.MockedFunction<typeof productList>;
const mockAddProduct = addProduct as jest.MockedFunction<typeof addProduct>;
const mockToaster = toaster as jest.MockedFunction<typeof toaster>;
const mockParsedError = parsedError as jest.MockedFunction<typeof parsedError>;

const mockProducts = [
  {
    id: '1',
    title: 'Test Product 1',
    price: '99.99',
    productDesc: 'Test description 1',
    imageUrl: 'https://example.com/image1.jpg'
  },
  {
    id: '2',
    title: 'Test Product 2',
    price: '149.99',
    productDesc: 'Test description 2',
    imageUrl: 'https://example.com/image2.jpg'
  }
];

// Helper function to create mock AxiosResponse
const createMockAxiosResponse = <T,>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {
    headers: {} as any,
  } as any,
});

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParsedError.mockReturnValue({ message: 'Test error message' });
  });

  describe('Rendering', () => {
    test('should render empty state when no products exist', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));

     await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.EMPTY_STATE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.EMPTY_STATE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT)).toBeInTheDocument();
      });
      });
    });

    test('should render products list when products exist', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

      await act(async () => {
       await act(async () => {
        renderDashboard();
      });
      });

      expect(screen.getByText((content, element) => {
        return element?.textContent === `${DASHBOARD_CONSTANTS.LABELS.YOUR_PRODUCTS} (2)`;
      })).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Your Products (2)')).toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('$99.99')).toBeInTheDocument();
        expect(screen.getByText('$149.99')).toBeInTheDocument();
      });
    });
  });

  describe('Product Fetching', () => {
    test('should fetch and display products successfully', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

     await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(mockProductList).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      });
    });

    test('should handle API error when fetching products', async () => {
      const error = new Error('Network error');
      mockProductList.mockRejectedValue(error);
      mockParsedError.mockReturnValue({ message: 'Test error message' });

     await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(mockParsedError).toHaveBeenCalledWith(error);
        expect(screen.getByText('Test error message')).toBeInTheDocument();
      });
    });
  });

  describe('Product Addition', () => {
    beforeEach(async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));
     await act(async () => {
        renderDashboard();
      });
      
      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT)).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      });
    });

    test('should add product successfully with valid data', async () => {
      const user = userEvent.setup();
      mockAddProduct.mockResolvedValue(createMockAxiosResponse(
        { message: 'Product added successfully' },
        201
      ));
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

      // Fill form
      await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE), 'New Product');
      await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRICE), '99.99');
      await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.DESCRIPTION), 'New description');

      // Create and upload file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload file');
      await user.upload(fileInput, file);

      // Submit form - use getByRole to target the button specifically
      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(mockAddProduct).toHaveBeenCalledWith(expect.any(FormData));
        expect(mockToaster).toHaveBeenCalledWith(201, 'Product added successfully');
      });
    });
  });

  describe('File Upload Validation', () => {
    beforeEach(async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));
     await act(async () => {
        renderDashboard();
      });
      
      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT)).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
    });

    test('should accept valid image file types', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(fileInput.files![0]).toBe(file);
      expect(screen.queryByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE)).not.toBeInTheDocument();
    });

    test('should reject invalid file types', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText('Upload file');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE)).toBeInTheDocument();
      });
    });

    test('should reject files exceeding size limit', async () => {
      const user = userEvent.setup();
      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload file');

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.FILE_SIZE_LIMIT)).toBeInTheDocument();
      });
    });
  });

 describe('Navigation', () => {
    test('should navigate to product detail on click', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

     await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const productCard = screen.getByRole('button', { name: /view details for test product 1/i });
      fireEvent.click(productCard);

      expect(mockNavigate).toHaveBeenCalledWith(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/1`);
    });

    test('should navigate on keyboard interaction', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

     await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const productCard = screen.getByRole('button', { name: /view details for test product 1/i });
      
      // Test Enter key
      fireEvent.keyDown(productCard, { key: 'Enter' });
      expect(mockNavigate).toHaveBeenCalledWith(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/1`);

      // Clear mock calls before testing Space key
      mockNavigate.mockClear();

      // Test Space key
      fireEvent.keyDown(productCard, { key: ' ' });
      expect(mockNavigate).toHaveBeenCalledWith(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/1`);
    });
  });

  describe('Modal Operations', () => {
    test('should open and close modal correctly', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));
     await act(async () => {
        renderDashboard();
      });

       await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT)).toBeInTheDocument();
      });


      // Open modal
      fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.PRODUCT_TITLE)).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.CANCEL_BUTTON));
      expect(screen.queryByText(DASHBOARD_CONSTANTS.LABELS.PRODUCT_TITLE)).not.toBeInTheDocument();
    });

    test('should reset form when modal closes', async () => {
      const user = userEvent.setup();
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));
     await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT)).toBeInTheDocument();
      });

      // Open modal and fill form
       fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE), 'Test Product');

      // Close modal
      fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.CANCEL_BUTTON));

      // Reopen modal and check if form is reset
      fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      expect(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE)).toHaveValue('');
    });
  });

  describe('Form Validation', () => {
    beforeEach(async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));
     await act(async () => {
        renderDashboard();
      });
      
       await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT)).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
    });

    test('should show validation errors for required fields', async () => {
      // Try to submit empty form - use the correct button text from constants
      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.TITLE.required)).toBeInTheDocument();
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.PRICE.required)).toBeInTheDocument();
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.DESCRIPTION.required)).toBeInTheDocument();
      });
    });
});