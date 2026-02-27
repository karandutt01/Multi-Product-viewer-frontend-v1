import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Register and ToastContainer for isolation if needed
jest.mock('./components/register/Register', () => () => <div data-testid="register-component">RegisterComponent</div>);
jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container">ToastContainer</div>
}));

describe('App', () => {
  it('renders the Register component', () => {
    render(<App />);
    expect(screen.getByTestId('register-component')).toBeInTheDocument();
  });

  it('renders the ToastContainer', () => {
    render(<App />);
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });
});