import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <textarea
        className={twMerge(`
            flex
            w-full
            rounded-lg
            bg-white/5
            border
            border-white/10
            px-3
            py-2.5
            text-sm
            text-white
            placeholder:text-neutral-500
            disabled:cursor-not-allowed
            disabled:opacity-50
            focus:outline-none
            focus:border-white/25
            focus:bg-white/8
            transition-colors
            duration-150
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