// File: src/components/ui/Card.jsx

import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'normal',
  shadow = 'md',
  border = false,
  hover = false,
  onClick = null,
  ...rest
}) => {
  // Base classes
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    normal: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  // Border classes
  const borderClasses = border ? 'border border-gray-200' : '';
  
  // Hover effect classes
  const hoverClasses = hover 
    ? 'transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1' 
    : '';
  
  // Clickable classes
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  // Combine classes
  const combinedClasses = `
    ${baseClasses}
    ${paddingClasses[padding] || paddingClasses.normal}
    ${shadowClasses[shadow] || shadowClasses.md}
    ${borderClasses}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `;
  
  return (
    <div className={combinedClasses} onClick={onClick} {...rest}>
      {children}
    </div>
  );
};

export default Card;