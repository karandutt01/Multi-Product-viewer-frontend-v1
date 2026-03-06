export const REGISTER_CONSTANTS = {
  // Form Labels
  LABELS: {
    TITLE: "Create an account",
    FIRSTNAME: "Firstname",
    LASTNAME: "Lastname", 
    EMAIL: "Email",
    PASSWORD: "Password",
    SUBMIT_BUTTON: "Register"
  },

  // Placeholders
  PLACEHOLDERS: {
    FIRSTNAME: "Enter the firstname",
    LASTNAME: "Enter the lastname",
    EMAIL: "Enter the email",
    PASSWORD: "Enter the password"
  },

  // Validation Messages
  VALIDATION: {
    FIRSTNAME_REQUIRED: "Firstname is required",
    LASTNAME_REQUIRED: "Lastname is required",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Invalid email address",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_MIN_LENGTH: "Password must be at least 6 characters long"
  },

  // Success Messages
  SUCCESS: {
    REGISTRATION_DEFAULT: "Registration successful"
  },

  // Form Field IDs
  FIELD_IDS: {
    FIRSTNAME: "registerFormFirstname",
    LASTNAME: "registerFormLastname", 
    EMAIL: "registerFormemail",
    PASSWORD: "registerFormPassword"
  },

  // Validation Rules
  VALIDATION_RULES: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6
  }
} as const;

// Form Field Configuration
export const REGISTER_FORM_FIELDS = {
  firstname: {
    id: REGISTER_CONSTANTS.FIELD_IDS.FIRSTNAME,
    label: REGISTER_CONSTANTS.LABELS.FIRSTNAME,
    placeholder: REGISTER_CONSTANTS.PLACEHOLDERS.FIRSTNAME,
    validation: {
      required: REGISTER_CONSTANTS.VALIDATION.FIRSTNAME_REQUIRED
    }
  },
  lastname: {
    id: REGISTER_CONSTANTS.FIELD_IDS.LASTNAME,
    label: REGISTER_CONSTANTS.LABELS.LASTNAME,
    placeholder: REGISTER_CONSTANTS.PLACEHOLDERS.LASTNAME,
    validation: {
      required: REGISTER_CONSTANTS.VALIDATION.LASTNAME_REQUIRED
    }
  },
  email: {
    id: REGISTER_CONSTANTS.FIELD_IDS.EMAIL,
    label: REGISTER_CONSTANTS.LABELS.EMAIL,
    placeholder: REGISTER_CONSTANTS.PLACEHOLDERS.EMAIL,
    validation: {
      required: REGISTER_CONSTANTS.VALIDATION.EMAIL_REQUIRED,
      pattern: {
        value: REGISTER_CONSTANTS.VALIDATION_RULES.EMAIL_PATTERN,
        message: REGISTER_CONSTANTS.VALIDATION.EMAIL_INVALID
      }
    }
  },
  password: {
    id: REGISTER_CONSTANTS.FIELD_IDS.PASSWORD,
    label: REGISTER_CONSTANTS.LABELS.PASSWORD,
    placeholder: REGISTER_CONSTANTS.PLACEHOLDERS.PASSWORD,
    validation: {
      required: REGISTER_CONSTANTS.VALIDATION.PASSWORD_REQUIRED,
      minLength: {
        value: REGISTER_CONSTANTS.VALIDATION_RULES.PASSWORD_MIN_LENGTH,
        message: REGISTER_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH
      }
    }
  }
} as const;