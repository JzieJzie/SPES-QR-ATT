import { forwardRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const isPasswordInput = type === 'password'
    const resolvedType = isPasswordInput ? (isPasswordVisible ? 'text' : 'password') : type

    const inputClassName = cn(
      'w-full border-2 border-black dark:border-white bg-white dark:bg-black px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-body text-black dark:text-white placeholder-black/70 dark:placeholder-white/70',
      isPasswordInput && 'pr-16 md:pr-20',
      className,
    )

    if (!isPasswordInput) {
      return <input ref={ref} type={resolvedType} className={inputClassName} {...props} />
    }

    return (
      <div className="relative">
        <input ref={ref} type={resolvedType} className={inputClassName} {...props} />
        <button
          type="button"
          onClick={() => setIsPasswordVisible((previous) => !previous)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-black dark:text-white"
          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
        >
          {isPasswordVisible ? 'Hide' : 'Show'}
        </button>
      </div>
    )
  },
)

Input.displayName = 'Input'
