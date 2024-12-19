import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <textarea
        className={twMerge(`
            flex
            w-full
            rounded-md
            bg-neutral-700
            border
            border-transparent
            px-3
            py-3
            text-sm
            placeholder:text-neutral-400
            disabled:cursor-not-allowed
            disabled:opacity-50
            focus:outline-none
            `,
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;