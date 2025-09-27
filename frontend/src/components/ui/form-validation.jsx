import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Enhanced input with validation
export const ValidatedInput = ({ 
  error, 
  success, 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        {children || (
          <input
            className={cn(
              "w-full px-3 py-2 border rounded-md transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
              error && "border-red-500 bg-red-50/10 text-red-100",
              success && "border-green-500 bg-green-50/10 text-green-100",
              !error && !success && "border-gray-600 bg-gray-800 text-white",
              className
            )}
            {...props}
          />
        )}
        
        {/* Validation icons */}
        {(error || success) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error && <AlertCircle className="h-5 w-5 text-red-500" />}
            {success && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
        )}
      </div>
      
      {/* Error/Success message */}
      {error && (
        <p className="text-sm text-red-400 flex items-center mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-400 flex items-center mt-1">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          {success}
        </p>
      )}
    </div>
  );
};

// Form validation hook
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const setValue = (fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Validate field if it has been touched
    if (touched[fieldName]) {
      const error = validate(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const setFieldTouched = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate on blur
    const error = validate(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Common validation rules
export const validationRules = {
  required: (value) => !value ? 'Это поле обязательно для заполнения' : '',
  
  email: (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Введите корректный email адрес' : '';
  },
  
  minLength: (min) => (value) => {
    if (!value) return '';
    return value.length < min ? `Минимум ${min} символов` : '';
  },
  
  maxLength: (max) => (value) => {
    if (!value) return '';
    return value.length > max ? `Максимум ${max} символов` : '';
  },
  
  phone: (value) => {
    if (!value) return '';
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return !phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? 
      'Введите корректный номер телефона' : '';
  },
  
  password: (value) => {
    if (!value) return '';
    if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
    if (!/(?=.*[a-z])/.test(value)) return 'Пароль должен содержать строчные буквы';
    if (!/(?=.*[A-Z])/.test(value)) return 'Пароль должен содержать заглавные буквы';
    if (!/(?=.*\d)/.test(value)) return 'Пароль должен содержать цифры';
    return '';
  },
  
  confirmPassword: (originalPassword) => (value) => {
    if (!value) return '';
    return value !== originalPassword ? 'Пароли не совпадают' : '';
  },
  
  number: (value) => {
    if (!value) return '';
    return isNaN(value) ? 'Введите корректное число' : '';
  },
  
  positiveNumber: (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    return isNaN(num) || num <= 0 ? 'Введите положительное число' : '';
  }
};