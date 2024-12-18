import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  ({ label, className, checked, onChange, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={twMerge(`
            form-checkbox
            h-4
            w-4
            text-blue-600
            transition
            duration-150
            ease-in-out
            `,
            className
          )}
          checked={checked}
          onChange={onChange}
          ref={ref}
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  }
);

CheckBox.displayName = 'CheckBox';

export default CheckBox;