// File: src/components/ui/Input.jsx

import React, { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  id,
  name,
  label,
  placeholder = '',
  value,
  onChange,
  onBlur,
  disabled = false,
  readOnly = false,
  error = null,
  helperText = null,
  fullWidth = false,
  size = 'md',
  className = '',
  required = false,
  icon = null,
  iconPosition = 'left',
  ...rest
}, ref) => {
  // Base classes
  const baseClasses = 'block border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Error classes
  const errorClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300';
  
  // Disabled classes
  const disabledClasses = disabled 
    ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
    : '';
  
  // Read-only classes
  const readOnlyClasses = readOnly ? 'bg-gray-50' : '';
  
  // Icon padding classes
  const iconPaddingClasses = icon 
    ? iconPosition === 'left' ? 'pl-10' : 'pr-10' 
    : '';
  
  // Combine classes
  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${widthClasses}
    ${errorClasses}
    ${disabledClasses}
    ${readOnlyClasses}
    ${iconPaddingClasses}
    ${className}
  `;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          className={combinedClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          {...rest}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

// Display name for React DevTools
Input.displayName = 'Input';

export default Input;