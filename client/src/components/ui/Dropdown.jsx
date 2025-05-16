// File: src/components/ui/Dropdown.jsx

import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({
  trigger,
  items = [],
  align = 'right',
  width = 'w-48',
  className = '',
  onItemClick,
  renderItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle item click
  const handleItemClick = (item, index) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
    setIsOpen(false);
  };
  
  // Alignment classes
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  };
  
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div onClick={toggleDropdown}>
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className={`origin-top-right absolute z-50 mt-2 ${width} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${alignClasses[align] || alignClasses.right}`}
        >
          <div 
            className="py-1" 
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="options-menu"
          >
            {items.map((item, index) => (
              <div key={index} onClick={() => handleItemClick(item, index)}>
                {renderItem ? (
                  renderItem(item, index)
                ) : (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    {item.label || item}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;