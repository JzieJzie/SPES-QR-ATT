import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full border-2 border-black bg-white px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-body placeholder-zinc-400',
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
