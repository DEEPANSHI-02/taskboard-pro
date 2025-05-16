// File: src/components/ui/Select.jsx

import React, { forwardRef } from 'react';

const Select = forwardRef(({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  error = null,
  helperText = null,
  fullWidth = false,
  size = 'md',
  className = '',
  required = false,
  ...rest
}, ref) => {
  // Base classes
  const baseClasses = 'block border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white';
  
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
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300';
  
  // Disabled classes
  const disabledClasses = disabled 
    ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
    : '';
  
  // Combine classes
  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${widthClasses}
    ${errorClasses}
    ${disabledClasses}
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
        <select
          ref={ref}
          id={id}
          name={name}
          className={combinedClasses}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value || option} 
              value={option.value || option}
            >
              {option.label || option}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg 
            className="h-4 w-4 fill-current" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
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
Select.displayName = 'Select';

export default Select;