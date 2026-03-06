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
    test('should_initialize_empty_parsed_object', () => {
      const error = {};

      const result = parsedError(error);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
    });

    test('should_initialize_fieldErrors_when_errors_array_exists', () => {
      const error = {
        response: {
          data: {
            errors: [
              { field: 'email', message: 'Email is required' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toBeDefined();
      expect(typeof result.fieldErrors).toBe('object');
      expect(result.fieldErrors).toEqual({
        email: 'Email is required'
      });
    });

    test('should_process_errors_array_and_populate_fieldErrors', () => {
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

    test('should_skip_invalid_error_objects_in_array', () => {
      const error = {
        response: {
          data: {
            errors: [
              { field: 'email' }, // Missing message
              { message: 'Invalid format' }, // Missing field
              { field: 'phone', message: 'Invalid phone number' }, // Valid
              { field: '', message: 'Empty field' }, // Empty field
              { field: 'name', message: '' } // Empty message
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toEqual({
        phone: 'Invalid phone number'
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

      expect(result.fieldErrors).toEqual({});
      expect(result.message).toBe('No specific field errors');
    });

    test('should_not_initialize_fieldErrors_when_errors_is_not_array', () => {
      const error = {
        response: {
          data: {
            errors: 'not an array',
            message: 'Some error'
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toBeUndefined();
      expect(result.message).toBe('Some error');
    });

    test('should_prioritize_response_data_message', () => {
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

    test('should_fallback_to_error_message_when_no_response_data_message', () => {
      const error = {
        message: 'Network connection failed',
        response: {
          data: {}
        }
      };

      const result = parsedError(error);

      expect(result.message).toBe('Network connection failed');
    });

    test('should_use_fallback_message_when_no_message_available', () => {
      const error = {
        response: {
          data: {}
        }
      };

      const result = parsedError(error);

      expect(result.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
    });

    test('should_use_fallback_message_for_empty_object', () => {
      const error = {};

      const result = parsedError(error);

      expect(result.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
    });

    test('should_handle_null_error', () => {
      const result = parsedError(null);

      expect(result.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
      expect(result.fieldErrors).toBeUndefined();
    });

    test('should_handle_undefined_error', () => {
      const result = parsedError(undefined);

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

    test('should_handle_error_with_response_but_no_data', () => {
      const error = {
        response: {},
        message: 'Fallback message'
      };

      const result = parsedError(error);

      expect(result.message).toBe('Fallback message');
      expect(result.fieldErrors).toBeUndefined();
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

    test('should_handle_errors_array_with_null_elements', () => {
      const error = {
        response: {
          data: {
            errors: [
              null,
              { field: 'email', message: 'Email is required' },
              undefined,
              { field: 'password', message: 'Password is required' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toEqual({
        email: 'Email is required',
        password: 'Password is required'
      });
    });

    test('should_handle_errors_array_with_non_object_elements', () => {
      const error = {
        response: {
          data: {
            errors: [
              'string error',
              123,
              { field: 'email', message: 'Email is required' },
              true,
              { field: 'password', message: 'Password is required' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toEqual({
        email: 'Email is required',
        password: 'Password is required'
      });
    });

    test('should_handle_deeply_nested_missing_properties', () => {
      const error = {
        response: {
          data: {
            errors: [
              { field: 'email', message: 'Email is required' }
            ]
          }
        }
      };

      const result = parsedError(error);

      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors!.email).toBe('Email is required');
    });

    test('should_handle_error_with_only_message_property', () => {
      const error = {
        message: 'Simple error message'
      };

      const result = parsedError(error);

      expect(result.message).toBe('Simple error message');
      expect(result.fieldErrors).toBeUndefined();
    });

    test('should_handle_error_with_empty_string_messages', () => {
      const error = {
        response: {
          data: {
            message: '',
            errors: [
              { field: 'email', message: '' },
              { field: 'password', message: 'Password is required' }
            ]
          }
        },
        message: ''
      };

      const result = parsedError(error);

      expect(result.message).toBe(ERROR_CONSTANTS.SOMETHING_WENT_WRONG);
      expect(result.fieldErrors).toEqual({
        password: 'Password is required'
      });
    });
  });
});