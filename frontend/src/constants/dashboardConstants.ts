export const DASHBOARD_CONSTANTS = {
  LABELS: {
    TITLE: 'Dashboard',
    ADD_PRODUCT: 'Add Product',
    ADD_YOUR_FIRST_PRODUCT: 'Add Your First Product',
    YOUR_PRODUCTS: 'Your Products',
    PRODUCT_TITLE: 'Product Title',
    PRICE: 'Price',
    PRODUCT_DESCRIPTION: 'Product Description',
    UPLOAD_FILE: 'Upload file',
    ADD_BUTTON: 'Create Product',
    CANCEL_BUTTON: 'Cancel'
  },

  FORM_DATA_KEYS: {
    TITLE: 'title',
    PRICE: 'price',
    PRODUCT_DESC: 'productDesc',
    IMAGE: 'image'
  },

  
  PLACEHOLDERS: {
    PRODUCT_TITLE: 'Enter product title',
    PRICE: 'Enter price',
    DESCRIPTION: 'Enter product description',
    FILE: 'Browse file'
  },
  
  MESSAGES: {
    SUCCESS: {
      PRODUCT_ADDED: 'Product Added Successfully'
    },
    ERROR: {
      FETCH_PRODUCTS: 'Failed to fetch products',
      UNEXPECTED_ERROR: 'An unexpected error occurred',
      INVALID_FILE_TYPE: 'Please select a valid image file (JPEG, PNG, GIF, WebP)',
      FILE_SIZE_LIMIT: 'File size must be less than 5MB'
    },
    EMPTY_STATE: {
      TITLE: 'Start building your product catalog',
      DESCRIPTION: "You haven't added any products yet. Create your first product to get started."
    }
  },
  
  VALIDATION: {
    TITLE: {
      required: 'Title is required'
    },
    PRICE: {
      required: 'Price is required'
    },
    DESCRIPTION: {
      required: 'Description is required'
    },
    FILE: {
      required: 'File is required'
    }
  },
  
  CONFIG: {
    FILE_UPLOAD: {
      ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
      MAX_SIZE_DISPLAY: '5MB'
    }
  },
  
  ROUTES: {
    PRODUCTS: '/products'
  },
  
  FORM_FIELDS: {
    title: {
      id: 'productTitle',
      name: 'title'
    },
    price: {
      id: 'productPrice', 
      name: 'price'
    },
    description: {
      id: 'productDescription',
      name: 'description'
    },
    file: {
      id: 'productFile',
      name: 'file'
    }
  }
};