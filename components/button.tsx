import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, Props>(({
    className, children, disabled, type = "button", ...props
}, ref) => {
    return (
        <button
            type={type}
            className={twMerge(
                `w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black
                hover:bg-neutral-200 active:scale-95
                disabled:cursor-not-allowed disabled:opacity-40
                transition-all duration-150
                focus:outline-none focus:ring-0`,
                className
            )}
            disabled={disabled}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    )
})

Button.displayName = "Button";
