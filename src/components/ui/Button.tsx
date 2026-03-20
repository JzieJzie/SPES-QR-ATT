import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/utils/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'danger'
  size?: 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border-2 border-black bg-white text-black transition active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed font-body font-semibold',
          variant === 'primary' && 'shadow-brutal',
          variant === 'outline' && 'shadow-none',
          variant === 'danger' && 'bg-black text-white shadow-brutal',
          size === 'md' && 'h-11 px-4 text-sm',
          size === 'lg' && 'h-14 px-8 text-lg',
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
