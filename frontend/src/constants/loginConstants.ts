export const LOGIN_CONSTANTS = {
  // Form Labels
  LABELS: {
    TITLE: "Sign in with email",
    EMAIL: "Email",
    PASSWORD: "Password",
    SUBMIT_BUTTON: "Sign In"
  },

  // Placeholders
  PLACEHOLDERS: {
    EMAIL: "Enter the email",
    PASSWORD: "Enter the password"
  },

  // Validation Messages
  VALIDATION: {
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Please enter a valid email address",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_MIN_LENGTH: "Password must be at least 8 characters long"
  },

  // Success Messages
  SUCCESS: {
    LOGIN_DEFAULT: "Login successful"
  },

  // Form Field IDs
  FIELD_IDS: {
    EMAIL: "loginFormEmail",
    PASSWORD: "loginFormPassword"
  },

  // Validation Rules
  VALIDATION_RULES: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8
  },

  // Routes
  ROUTES: {
    DASHBOARD: "/dashboard"
  }
} as const;

// Form Field Configuration
export const LOGIN_FORM_FIELDS = {
  email: {
    id: LOGIN_CONSTANTS.FIELD_IDS.EMAIL,
    label: LOGIN_CONSTANTS.LABELS.EMAIL,
    placeholder: LOGIN_CONSTANTS.PLACEHOLDERS.EMAIL,
    validation: {
      required: LOGIN_CONSTANTS.VALIDATION.EMAIL_REQUIRED,
      pattern: {
        value: LOGIN_CONSTANTS.VALIDATION_RULES.EMAIL_PATTERN,
        message: LOGIN_CONSTANTS.VALIDATION.EMAIL_INVALID
      }
    }
  },
  password: {
    id: LOGIN_CONSTANTS.FIELD_IDS.PASSWORD,
    label: LOGIN_CONSTANTS.LABELS.PASSWORD,
    placeholder: LOGIN_CONSTANTS.PLACEHOLDERS.PASSWORD,
    validation: {
      required: LOGIN_CONSTANTS.VALIDATION.PASSWORD_REQUIRED,
      minLength: {
        value: LOGIN_CONSTANTS.VALIDATION_RULES.PASSWORD_MIN_LENGTH,
        message: LOGIN_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH
      }
    }
  }
} as const;