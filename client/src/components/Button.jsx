import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  loading = false,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'text-primary hover:bg-primary-light px-4 py-2 rounded-pill',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light px-6 py-3 rounded-pill font-bold'
  };

  return (
    <button
      className={twMerge(variants[variant], className)}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};
