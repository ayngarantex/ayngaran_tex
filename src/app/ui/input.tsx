import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      className,
      wrapperClassName,
      id,
      disabled,
      readOnly,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={clsx('w-full', wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className="relative rounded-md">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            readOnly={readOnly}
            className={clsx(
              'peer block w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500 transition-colors h-10',
              icon ? 'pl-10 pr-4' : 'px-4',
              'py-2',
              readOnly ? 'bg-blue-100/70 text-gray-700 cursor-default' : 'bg-white text-gray-900',
              disabled && 'bg-gray-100 text-gray-400 cursor-not-allowed',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
              className
            )}
            {...rest}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

