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
          'inline-flex items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white transition active:translate-y-px dark:active:bg-white dark:active:text-black disabled:opacity-50 disabled:cursor-not-allowed font-body font-semibold',
          variant === 'primary' && 'shadow-brutal dark:shadow-brutal-dark',
          variant === 'outline' && 'shadow-none',
          variant === 'danger' && 'bg-black dark:bg-black text-white dark:text-white shadow-brutal dark:shadow-brutal-dark',
          size === 'md' && 'h-10 px-3 text-xs md:h-11 md:px-4 md:text-sm',
          size === 'lg' && 'h-11 px-4 text-sm md:h-14 md:px-8 md:text-lg',
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
