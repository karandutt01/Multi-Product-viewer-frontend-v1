import { parsedError, ParsedError } from '../errorHandler';
import { ERROR_CONSTANTS } from 'constants/errorConstant';

// Mock the error constants
jest.mock('constants/errorConstant', () => ({
  ERROR_CONSTANTS: {
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.'
  }
}));

describe('Error Handler', () => {
  describe('parsedError', () => {
    test('should_parse_field_errors_from_response_data', () => {
      const error = {
        response: {
          data: {
            errors: [
              { field: 'email', message: 'Email is required' },
              { field: 'password', message: 'Password must be at least 8 characters' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toEqual({
        email: 'Email is required',
        password: 'Password must be at least 8 characters'
      });
    });

    test('should_extract_message_from_response_data', () => {
      const error = {
        response: {
          data: {
            message: 'Authentication failed'
          }
        }
      };

      const result = parsedError(error);

      expect(result.message).toBe('Authentication failed');
      expect(result.fieldErrors).toBeUndefined();
    });

    test('should_extract_message_from_error_object', () => {
      const error = {
        message: 'Network connection failed'
      };

      const result = parsedError(error);

      expect(result.message).toBe('Network connection failed');
      expect(result.fieldErrors).toBeUndefined();
    });

    test('should_return_fallback_message_when_no_message_available', () => {
      const error = {};

      const result = parsedError(error);

      expect(result.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
      expect(result.fieldErrors).toBeUndefined();
    });

    test('should_parse_both_field_errors_and_message', () => {
      const error = {
        response: {
          data: {
            message: 'Validation failed',
            errors: [
              { field: 'username', message: 'Username is already taken' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.message).toBe('Validation failed');
      expect(result.fieldErrors).toEqual({
        username: 'Username is already taken'
      });
    });

    test('should_handle_empty_errors_array', () => {
      const error = {
        response: {
          data: {
            errors: [],
            message: 'No specific field errors'
          }
        }
      };

      const result = parsedError(error);

      expect(result.message).toBe('No specific field errors');
      expect(result.fieldErrors).toEqual({});
    });

    test('should_handle_malformed_field_error_objects', () => {
      const error = {
        response: {
          data: {
            errors: [
              { field: 'email' }, // Missing message
              { message: 'Invalid format' }, // Missing field
              { field: 'phone', message: 'Invalid phone number' } // Valid
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toEqual({
        phone: 'Invalid phone number'
      });
    });

    test('should_handle_null_or_undefined_error', () => {
      const nullResult = parsedError(null);
      const undefinedResult = parsedError(undefined);

      expect(nullResult.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
      expect(nullResult.fieldErrors).toBeUndefined();

      expect(undefinedResult.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
      expect(undefinedResult.fieldErrors).toBeUndefined();
    });

    test('should_handle_nested_error_structure', () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'Nested error message'
            },
            errors: [
              { field: 'nested', message: 'Nested field error' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toEqual({
        nested: 'Nested field error'
      });
      // Should not extract from nested error.message, only from data.message
      expect(result.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
    });

    test('should_handle_multiple_errors_for_same_field', () => {
      const error = {
        response: {
          data: {
            errors: [
              { field: 'password', message: 'Password is required' },
              { field: 'email', message: 'Email is invalid' },
              { field: 'password', message: 'Password must be strong' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toEqual({
        email: 'Email is invalid',
        password: 'Password must be strong' // Last message wins
      });
    });

    test('should_prioritize_response_data_message_over_error_message', () => {
      const error = {
        message: 'Generic error message',
        response: {
          data: {
            message: 'Specific API error message'
          }
        }
      };

      const result = parsedError(error);

      expect(result.message).toBe('Specific API error message');
    });

    test('should_handle_error_with_response_but_no_data', () => {
      const error = {
        response: {},
        message: 'Fallback message'
      };

      const result = parsedError(error);

      expect(result.message).toBe('Fallback message');
      expect(result.fieldErrors).toBeUndefined();
    });

    test('should_initialize_fieldErrors_when_errors_array_exists', () => {
      const error = {
        response: {
          data: {
            errors: [
              { field: 'test', message: 'Test error' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toBeDefined();
      expect(typeof result.fieldErrors).toBe('object');
    });
  });
});