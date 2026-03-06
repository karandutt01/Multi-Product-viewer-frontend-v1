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

  describe('Component Rendering', () => {
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

    test('should render products list when products exist', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Your Products (2)')).toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('$99.99')).toBeInTheDocument();
        expect(screen.getByText('$149.99')).toBeInTheDocument();
      });
    });

    test('should render dashboard title correctly', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.TITLE)).toBeInTheDocument();
      });
    });

    test('should render container with proper structure', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        const container = document.querySelector('.container-fluid');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('py-4');
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
      mockParsedError.mockReturnValue({ message: 'Failed to fetch products' });

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(mockParsedError).toHaveBeenCalledWith(error);
        expect(screen.getByText('Failed to fetch products')).toBeInTheDocument();
      });
    });

    test('should clear API error when products fetch successfully', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(mockProductList).toHaveBeenCalledTimes(1);
        // Verify no error messages are displayed
        expect(screen.queryByText('Failed to fetch products')).not.toBeInTheDocument();
      });
    });

    test('should handle empty product response', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: [] }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.EMPTY_STATE.TITLE)).toBeInTheDocument();
      });
    });

    test('should handle malformed API response', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({}));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.EMPTY_STATE.TITLE)).toBeInTheDocument();
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
      
      await act(async () => {
        fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      });
    });

    test('should accept valid image file types', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;

      await act(async () => {
        await user.upload(fileInput, file);
      });

      expect(fileInput.files![0]).toBe(file);
      expect(screen.queryByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE)).not.toBeInTheDocument();
    });

    test('should accept PNG files', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;

      await act(async () => {
        await user.upload(fileInput, file);
      });

      expect(fileInput.files![0]).toBe(file);
      expect(screen.queryByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE)).not.toBeInTheDocument();
    });

    test('should accept GIF files', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;

      await act(async () => {
        await user.upload(fileInput, file);
      });

      expect(fileInput.files![0]).toBe(file);
      expect(screen.queryByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE)).not.toBeInTheDocument();
    });

    test('should reject invalid file types', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText('Upload file');

      await act(async () => {
        await user.upload(fileInput, file);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE)).toBeInTheDocument();
      });
    });

    test('should reject PDF files', async () => {
      const user = userEvent.setup();
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText('Upload file');

      await act(async () => {
        await user.upload(fileInput, file);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE)).toBeInTheDocument();
      });
    });

    test('should reject files exceeding size limit', async () => {
      const user = userEvent.setup();
      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload file');

      await act(async () => {
        await user.upload(fileInput, largeFile);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.FILE_SIZE_LIMIT)).toBeInTheDocument();
      });
    });

    test('should accept files at size limit', async () => {
      const user = userEvent.setup();
      // Create a file exactly at 5MB limit
      const limitFile = new File(['x'.repeat(5 * 1024 * 1024)], 'limit.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;

      await act(async () => {
        await user.upload(fileInput, limitFile);
      });

      expect(fileInput.files![0]).toBe(limitFile);
      expect(screen.queryByText(DASHBOARD_CONSTANTS.MESSAGES.ERROR.FILE_SIZE_LIMIT)).not.toBeInTheDocument();
    });

    test('should handle multiple file selection by taking first file', async () => {
      const user = userEvent.setup();
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload file') as HTMLInputElement;

      await act(async () => {
        await user.upload(fileInput, [file1, file2]);
      });

      expect(fileInput.files![0]).toBe(file1);
      expect(fileInput.files!.length).toBe(1);
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

      await act(async () => {
        const productCard = screen.getByRole('button', { name: /view details for test product 1/i });
        fireEvent.click(productCard);
      });

      expect(mockNavigate).toHaveBeenCalledWith(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/1`);
    });

    test('should navigate on keyboard interaction with Enter key', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const productCard = screen.getByRole('button', { name: /view details for test product 1/i });
      
      await act(async () => {
        fireEvent.keyDown(productCard, { key: 'Enter' });
      });
      
      expect(mockNavigate).toHaveBeenCalledWith(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/1`);
    });

    test('should navigate on keyboard interaction with Space key', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const productCard = screen.getByRole('button', { name: /view details for test product 1/i });
      
      await act(async () => {
        fireEvent.keyDown(productCard, { key: ' ' });
      });
      
      expect(mockNavigate).toHaveBeenCalledWith(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/1`);
    });

    test('should not navigate on other keyboard keys', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const productCard = screen.getByRole('button', { name: /view details for test product 1/i });
      
      await act(async () => {
        fireEvent.keyDown(productCard, { key: 'Tab' });
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('should navigate to multiple different products', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      });

      // Click first product
      await act(async () => {
        const productCard1 = screen.getByRole('button', { name: /view details for test product 1/i });
        fireEvent.click(productCard1);
      });

      expect(mockNavigate).toHaveBeenCalledWith(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/1`);

      // Click second product
      await act(async () => {
        const productCard2 = screen.getByRole('button', { name: /view details for test product 2/i });
        fireEvent.click(productCard2);
      });

      expect(mockNavigate).toHaveBeenCalledWith(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/2`);
      expect(mockNavigate).toHaveBeenCalledTimes(2);
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
      await act(async () => {
        fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      });
      expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.PRODUCT_TITLE)).toBeInTheDocument();

      // Close modal
      await act(async () => {
        fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.CANCEL_BUTTON));
      });
      expect(screen.queryByText(DASHBOARD_CONSTANTS.LABELS.PRODUCT_TITLE)).not.toBeInTheDocument();
    });

    test('should open modal from products list add button', async () => {
      mockProductList.mockResolvedValue(createMockAxiosResponse({ doc: mockProducts }));
      
      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Your Products (2)')).toBeInTheDocument();
      });

      // Find and click add product button in products list
      const addButton = screen.getByRole('button', { name: /add product/i });
      await act(async () => {
        fireEvent.click(addButton);
      });

      expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.PRODUCT_TITLE)).toBeInTheDocument();
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
      await act(async () => {
        fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      });
      
      await act(async () => {
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE), 'Test Product');
      });

      // Close modal
      await act(async () => {
        fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.CANCEL_BUTTON));
      });

      // Reopen modal and check if form is reset
      await act(async () => {
        fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      });
      expect(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE)).toHaveValue('');
    });

    test('should display modal header correctly', async () => {
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

      expect(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_PRODUCT)).toBeInTheDocument();
    });

    test('should display modal footer buttons correctly', async () => {
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

      expect(screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.CANCEL_BUTTON })).toBeInTheDocument();
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
      
      await act(async () => {
        fireEvent.click(screen.getByText(DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT));
      });
    });

    test('should show validation errors for required fields', async () => {
      // Try to submit empty form
      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.TITLE.required)).toBeInTheDocument();
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.PRICE.required)).toBeInTheDocument();
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.DESCRIPTION.required)).toBeInTheDocument();
      });
    });

    test('should validate title field specifically', async () => {
      const user = userEvent.setup();

      // Fill only price and description, leave title empty
      await act(async () => {
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRICE), '99.99');
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.DESCRIPTION), 'Test description');
      });

      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.TITLE.required)).toBeInTheDocument();
      });
    });

    test('should validate price field specifically', async () => {
      const user = userEvent.setup();

      // Fill only title and description, leave price empty
      await act(async () => {
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE), 'Test Product');
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.DESCRIPTION), 'Test description');
      });

      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.PRICE.required)).toBeInTheDocument();
      });
    });

    test('should validate description field specifically', async () => {
      const user = userEvent.setup();

      // Fill only title and price, leave description empty
      await act(async () => {
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE), 'Test Product');
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRICE), '99.99');
      });

      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.DESCRIPTION.required)).toBeInTheDocument();
      });
    });

    test('should clear validation errors when fields are filled', async () => {
      const user = userEvent.setup();

      // First submit empty form to trigger validation
      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.TITLE.required)).toBeInTheDocument();
      });

      // Fill the title field
      await act(async () => {
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE), 'Test Product');
      });

      // The title validation error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(DASHBOARD_CONSTANTS.VALIDATION.TITLE.required)).not.toBeInTheDocument();
      });
    });

    test('should not submit form when validation fails', async () => {
      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText(DASHBOARD_CONSTANTS.VALIDATION.TITLE.required)).toBeInTheDocument();
      });

      // Verify that addProduct was not called
      expect(mockAddProduct).not.toHaveBeenCalled();
    });

    test('should handle form submission loading state', async () => {
      const user = userEvent.setup();
      
      // Mock a slow API response
      mockAddProduct.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      // Fill form
      await act(async () => {
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE), 'Test Product');
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.PRICE), '99.99');
        await user.type(screen.getByPlaceholderText(DASHBOARD_CONSTANTS.PLACEHOLDERS.DESCRIPTION), 'Test description');
      });

      const addButton = screen.getByRole('button', { name: DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON });
      
      await act(async () => {
        fireEvent.click(addButton);
      });

      // Button should show loading state
      expect(addButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    test('should display API errors correctly', async () => {
      const error = new Error('Network connection failed');
      mockProductList.mockRejectedValue(error);
      mockParsedError.mockReturnValue({ message: 'Unable to connect to server' });

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Unable to connect to server')).toBeInTheDocument();
      });
    });

    test('should handle undefined error messages gracefully', async () => {
      const error = new Error('Unknown error');
      mockProductList.mockRejectedValue(error);
      mockParsedError.mockReturnValue({ message: undefined });

      await act(async () => {
        renderDashboard();
      });

      // Should not crash and should not display undefined
      await waitFor(() => {
        expect(screen.queryByText('undefined')).not.toBeInTheDocument();
      });
    });

    test('should handle null error responses', async () => {
      mockProductList.mockRejectedValue(null);
      mockParsedError.mockReturnValue({ message: 'Unknown error occurred' });

      await act(async () => {
        renderDashboard();
      });

      await waitFor(() => {
        expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
      });
    });
  });

})