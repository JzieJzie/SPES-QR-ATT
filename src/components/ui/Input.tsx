import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full border-2 border-black bg-white px-3 text-sm font-body outline-none focus:ring-2 focus:ring-black',
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
