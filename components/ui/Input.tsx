"use client"

// components/ui/Input.tsx

import { forwardRef, useState } from "react"
import { cn } from "@/lib/utils"

// ─── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:    string
  error?:    string
  hint?:     string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  /** Makes rightIcon a clickable button (e.g. clear, show password) */
  onRightIconClick?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-white/50"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center text-white/30 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              "w-full rounded-xl border bg-white/5 backdrop-blur-sm",
              "px-3.5 py-2.5 text-sm text-white/85 placeholder:text-white/25",
              "transition-all duration-200",
              "focus:outline-none focus:ring-1",
              // States
              error
                ? "border-red-400/40 focus:border-red-400/60 focus:ring-red-400/20"
                : "border-white/10 focus:border-emerald-400/40 focus:ring-emerald-400/10",
              disabled && "cursor-not-allowed opacity-50",
              leftIcon  && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                "absolute right-3 flex items-center text-white/30",
                onRightIconClick
                  ? "cursor-pointer hover:text-white/60 transition-colors"
                  : "pointer-events-none"
              )}
              onClick={onRightIconClick}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
            </svg>
            {error}
          </p>
        )}

        {!error && hint && (
          <p className="text-xs text-white/30">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

// ─── PasswordInput ────────────────────────────────────────────────────────────

type PasswordInputProps = Omit<InputProps, "type" | "rightIcon" | "onRightIconClick">

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      rightIcon={
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          {show ? (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </>
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </>
          )}
        </svg>
      }
      onRightIconClick={() => setShow((s) => !s)}
    />
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?:  string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-white/50">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-white/5 backdrop-blur-sm",
            "px-3.5 py-2.5 text-sm text-white/85 placeholder:text-white/25",
            "transition-all duration-200 resize-none",
            "focus:outline-none focus:ring-1",
            error
              ? "border-red-400/40 focus:border-red-400/60 focus:ring-red-400/20"
              : "border-white/10 focus:border-emerald-400/40 focus:ring-emerald-400/10",
            className
          )}
          {...props}
        />

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
            </svg>
            {error}
          </p>
        )}
        {!error && hint && <p className="text-xs text-white/30">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string
  error?:   string
  options:  { label: string; value: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-white/50">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full appearance-none rounded-xl border bg-white/5 backdrop-blur-sm",
              "px-3.5 py-2.5 pr-9 text-sm text-white/85",
              "[color-scheme:dark]",
              "transition-all duration-200",
              "focus:outline-none focus:ring-1",
              error
                ? "border-red-400/40 focus:border-red-400/60 focus:ring-red-400/20"
                : "border-white/10 focus:border-emerald-400/40 focus:ring-emerald-400/10",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Chevron */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"
