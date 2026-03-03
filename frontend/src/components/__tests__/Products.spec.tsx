import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import Products from '../products/Products';
import { getProductById } from '../../service/authService';
import { parsedError } from '../../util/errorHandler';
import { PRODUCTS_CONSTANTS } from '../../constants/productsConstants';


// Mock dependencies
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../service/authService', () => ({
  getProductById: jest.fn(),
}));

jest.mock('../../util/errorHandler', () => ({
  parsedError: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockGetProductById = getProductById as jest.MockedFunction<typeof getProductById>;
const mockParsedError = parsedError as jest.MockedFunction<typeof parsedError>;

const mockProduct = {
  id: '123',
  title: 'Test Product',
  price: '99.99',
  productDesc: 'This is a test product description',
  imageUrl: 'https://example.com/product.jpg'
};

describe('Products Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useParams as jest.Mock).mockReturnValue({ id: '123' });
    mockParsedError.mockReturnValue({ message: 'Test error message' });
  });

  test('should_render_product_details_successfully', async () => {
    mockGetProductById.mockResolvedValue({
      data: mockProduct
    } as any);

    render(<Products />);

    // Initially shows loading
    expect(screen.getByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).toBeInTheDocument();

    // Wait for product to load
    await waitFor(() => {
      expect(screen.queryByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).not.toBeInTheDocument();
    });

    // Check for Product Details heading
    expect(screen.getByText(PRODUCTS_CONSTANTS.LABELS.PRODUCT_DETAILS)).toBeInTheDocument();

    // Check all product details are rendered
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    expect(screen.getByText(`${PRODUCTS_CONSTANTS.LABELS.PRODUCT_ID}: 123`)).toBeInTheDocument();
    
    // Check image is rendered
    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', 'https://example.com/product.jpg');
  });

  test('should_show_product_not_found_message', async () => {
    mockGetProductById.mockResolvedValue({
      data: null
    } as any);

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(PRODUCTS_CONSTANTS.MESSAGES.PRODUCT_NOT_FOUND)).toBeInTheDocument();
    });

    expect(screen.getByText(PRODUCTS_CONSTANTS.LABELS.BACK_TO_DASHBOARD)).toBeInTheDocument();
  });

  test('should_show_loading_state_initially', () => {
    mockGetProductById.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Products />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(PRODUCTS_CONSTANTS.ACCESSIBILITY.LOADING_STATUS)).toBeInTheDocument();
    expect(screen.getByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).toBeInTheDocument();
  });

  test('should_show_error_state_with_retry_button', async () => {
    const error = new Error('Network error');
    mockGetProductById.mockRejectedValue(error);
    mockParsedError.mockReturnValue({ message: 'Failed to load product' });

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load product')).toBeInTheDocument();
    expect(screen.getByText(PRODUCTS_CONSTANTS.MESSAGES.TRY_AGAIN)).toBeInTheDocument();
  });

  test('should_fetch_product_details_on_mount', async () => {
    mockGetProductById.mockResolvedValue({
      data: mockProduct
    } as any);

    render(<Products />);

    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('123');
      expect(mockGetProductById).toHaveBeenCalledTimes(1);
    });
  });

  test('should_handle_api_error_gracefully', async () => {
    const error = new Error('API Error');
    mockGetProductById.mockRejectedValue(error);
    mockParsedError.mockReturnValue({ message: 'Something went wrong' });

    render(<Products />);

    await waitFor(() => {
      expect(mockParsedError).toHaveBeenCalledWith(error);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  test('should_not_fetch_if_no_id_provided', () => {
    (useParams as jest.Mock).mockReturnValue({ id: undefined });

    render(<Products />);

    expect(mockGetProductById).not.toHaveBeenCalled();
  });

  test('should_navigate_to_dashboard_on_back_click', async () => {
    mockGetProductById.mockResolvedValue({
      data: mockProduct
    } as any);

    render(<Products />);

    await waitFor(() => {
      expect(screen.queryByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).not.toBeInTheDocument();
    });

    const backButton = screen.getByText(PRODUCTS_CONSTANTS.LABELS.BACK_TO_DASHBOARD);
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(PRODUCTS_CONSTANTS.ROUTES.DASHBOARD);
  });

  test('should_retry_fetching_on_retry_button_click', async () => {
    const error = new Error('Network error');
    mockGetProductById.mockRejectedValue(error);
    mockParsedError.mockReturnValue({ message: 'Failed to load' });

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(PRODUCTS_CONSTANTS.MESSAGES.TRY_AGAIN)).toBeInTheDocument();
    });

    // Clear previous calls
    mockGetProductById.mockClear();
    
    // Mock successful response for retry
    mockGetProductById.mockResolvedValue({
      data: mockProduct
    } as any);

    const retryButton = screen.getByText(PRODUCTS_CONSTANTS.MESSAGES.TRY_AGAIN);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('123');
      expect(screen.queryByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).not.toBeInTheDocument();
    });

    expect(screen.getByText(PRODUCTS_CONSTANTS.LABELS.PRODUCT_DETAILS)).toBeInTheDocument();
  });

  test('should_render_product_image_when_available', async () => {
    mockGetProductById.mockResolvedValue({
      data: mockProduct
    } as any);

    render(<Products />);

    await waitFor(() => {
      expect(screen.queryByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).not.toBeInTheDocument();
    });

    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockProduct.imageUrl);
    expect(image).toHaveStyle({ height: '400px', objectFit: 'cover' });
  });

  test('should_not_render_image_when_url_missing', async () => {
    const productWithoutImage = { ...mockProduct, imageUrl: null };
    mockGetProductById.mockResolvedValue({
      data: productWithoutImage
    } as any);

    render(<Products />);

    await waitFor(() => {
      expect(screen.queryByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).not.toBeInTheDocument();
    });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('should_handle_product_not_found_navigation', async () => {
    mockGetProductById.mockResolvedValue({
      data: null
    } as any);

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(PRODUCTS_CONSTANTS.MESSAGES.PRODUCT_NOT_FOUND)).toBeInTheDocument();
    });

    const backButton = screen.getByText(PRODUCTS_CONSTANTS.LABELS.BACK_TO_DASHBOARD);
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(PRODUCTS_CONSTANTS.ROUTES.DASHBOARD);
  });

  test('should_display_loading_spinner_with_proper_accessibility', () => {
    mockGetProductById.mockImplementation(() => new Promise(() => {}));

    render(<Products />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('spinner-border');
    expect(screen.getByText(PRODUCTS_CONSTANTS.ACCESSIBILITY.LOADING_STATUS)).toHaveClass('visually-hidden');
  });

  test('should_handle_error_without_message', async () => {
    const error = new Error('Network error');
    mockGetProductById.mockRejectedValue(error);
    mockParsedError.mockReturnValue({ message: undefined });

    render(<Products />);

    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalled();
    });

    // Should not show error UI if no error message
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('should_display_product_labels_correctly', async () => {
    mockGetProductById.mockResolvedValue({
      data: mockProduct
    } as any);

    render(<Products />);

    await waitFor(() => {
      expect(screen.queryByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).not.toBeInTheDocument();
    });

    // Check all labels are displayed
    expect(screen.getByText(PRODUCTS_CONSTANTS.LABELS.PRODUCT_TITLE)).toBeInTheDocument();
    expect(screen.getByText(PRODUCTS_CONSTANTS.LABELS.PRODUCT_PRICE)).toBeInTheDocument();
    expect(screen.getByText(PRODUCTS_CONSTANTS.LABELS.DESCRIPTION)).toBeInTheDocument();
  });

  test('should_handle_loading_state_properly', async () => {
    mockGetProductById.mockResolvedValue({
      data: mockProduct
    } as any);

    render(<Products />);

    // Check loading state is shown initially
    expect(screen.getByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(PRODUCTS_CONSTANTS.MESSAGES.LOADING)).not.toBeInTheDocument();
    });

    // Verify product is displayed after loading
    expect(screen.getByText(PRODUCTS_CONSTANTS.LABELS.PRODUCT_DETAILS)).toBeInTheDocument();
  });
});