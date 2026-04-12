'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefix?: string
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, hint, error, prefix, className, id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div>
        {label && (
          <div className="flex items-baseline justify-between mb-2">
            <label
              htmlFor={inputId}
              className="text-[13px] font-semibold text-label"
            >
              {label}
            </label>
            {hint && <span className="text-[12px] text-label-tertiary">{hint}</span>}
          </div>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-label-tertiary text-[15px] font-medium pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-glass',
              prefix && 'pl-9',
              error && '!border-danger/50 focus:!border-danger/70',
              className
            )}
            {...rest}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-[12px] text-danger font-medium">{error}</p>
        )}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'
