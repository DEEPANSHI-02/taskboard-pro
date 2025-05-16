// File: src/components/ui/TextArea.jsx

import React, { forwardRef } from 'react';

const TextArea = forwardRef(({
  id,
  name,
  label,
  placeholder = '',
  value,
  onChange,
  onBlur,
  rows = 4,
  disabled = false,
  readOnly = false,
  error = null,
  helperText = null,
  fullWidth = false,
  className = '',
  required = false,
  maxLength,
  showCharCount = false,
  ...rest
}, ref) => {
  // Base classes
  const baseClasses = 'block w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500';
  
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
  
  // Combine classes
  const combinedClasses = `
    ${baseClasses}
    ${widthClasses}
    ${errorClasses}
    ${disabledClasses}
    ${readOnlyClasses}
    px-3 py-2 text-sm
    ${className}
  `;
  
  // Character count
  const charCount = value ? value.length : 0;
  const showCount = showCharCount || maxLength;
  
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
      
      <textarea
        ref={ref}
        id={id}
        name={name}
        rows={rows}
        className={combinedClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        {...rest}
      />
      
      {/* Error or helper text */}
      {(error || helperText || showCount) && (
        <div className="mt-1 flex justify-between items-start">
          {(error || helperText) && (
            <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
              {error || helperText}
            </p>
          )}
          
          {showCount && (
            <p className={`text-xs text-gray-500 ${maxLength && charCount >= maxLength ? 'text-red-500' : ''}`}>
              {charCount}{maxLength ? `/${maxLength}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

// Display name for React DevTools
TextArea.displayName = 'TextArea';

export default TextArea;