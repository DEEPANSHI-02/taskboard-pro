// File: src/components/ui/Avatar.jsx

import React from 'react';

const Avatar = ({
  src = null,
  alt = '',
  size = 'md',
  name = '',
  bgColor = 'bg-primary-500',
  textColor = 'text-white',
  className = '',
  ...rest
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };
  
  // Get initials from name
  const getInitials = () => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  // Base classes
  const baseClasses = 'rounded-full flex items-center justify-center flex-shrink-0';
  
  // Combine classes
  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${!src ? `${bgColor} ${textColor} font-medium` : ''}
    ${className}
  `;
  
  return (
    <div className={combinedClasses} {...rest}>
      {src ? (
        <img 
          src={src} 
          alt={alt || name} 
          className="rounded-full h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );
};

export default Avatar;