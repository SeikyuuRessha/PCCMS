import { type ComponentProps, forwardRef } from "react";
import { cx } from "~/utils/cx";

export interface InputProps extends ComponentProps<"input"> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, id, ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-[13px] font-medium text-slate-700">
                        {label} {props.required && <span className="text-error-500">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cx(
                        "h-10 w-full rounded-xl border bg-white px-3 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2",
                        error
                            ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                            : "border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-primary-500/20",
                        className
                    )}
                    {...props}
                />
                {error ? (
                    <p className="text-[12px] font-medium text-error-600">{error}</p>
                ) : helperText ? (
                    <p className="text-[12px] text-slate-500">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = "Input";
