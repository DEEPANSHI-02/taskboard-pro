// File: src/components/ui/Checkbox.jsx

import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  size = 'md',
  ...rest
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  // Label size classes
  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  // Checkbox classes
  const checkboxClasses = `
    rounded border-gray-300 text-primary-600 shadow-sm 
    focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-200 focus:ring-opacity-50
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${error ? 'border-red-300' : ''}
    ${sizeClasses[size] || sizeClasses.md}
    ${className}
  `;
  
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={checkboxClasses}
          {...rest}
        />
      </div>
      
      <div className="ml-2 text-gray-700">
        {label && (
          <label 
            htmlFor={id} 
            className={`${labelSizeClasses[size] || labelSizeClasses.md} font-medium ${disabled ? 'text-gray-500' : ''}`}
          >
            {label}
          </label>
        )}
        
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    </div>
  );
});

// Display name for React DevTools
Checkbox.displayName = 'Checkbox';

export default Checkbox;