import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({
    className,
    type,
    disabled,
    ...props
}, ref) => {
    return (
        <input
        type={type}
        className={twMerge(
            `flex w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-300 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-colors duration-150`
       , className )}
       disabled={disabled}
       ref={ref}
       {...props}
        />
    )
})

Input.displayName = "Input"