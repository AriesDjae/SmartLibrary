export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export const validateField = (value: any, rule: ValidationRule): string | null => {
  if (rule.required && (!value || value.toString().trim() === '')) {
    return rule.message || 'This field is required';
  }

  if (value && rule.minLength && value.toString().length < rule.minLength) {
    return rule.message || `Minimum length is ${rule.minLength} characters`;
  }

  if (value && rule.maxLength && value.toString().length > rule.maxLength) {
    return rule.message || `Maximum length is ${rule.maxLength} characters`;
  }

  if (value && rule.pattern && !rule.pattern.test(value.toString())) {
    return rule.message || 'Invalid format';
  }

  if (value && rule.custom && !rule.custom(value)) {
    return rule.message || 'Invalid value';
  }

  return null;
};

export const validateForm = (data: Record<string, any>, schema: ValidationSchema): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach(field => {
    const error = validateField(data[field], schema[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Common validation schemas
export const authValidationSchema: ValidationSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters long'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Name must be between 2 and 50 characters'
  }
};

export const bookValidationSchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
    message: 'Book title is required and must be less than 200 characters'
  },
  author: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Author name is required and must be less than 100 characters'
  },
  isbn: {
    required: true,
    pattern: /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
    message: 'Please enter a valid ISBN'
  }
}; 