import type { PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

type BadgeProps = PropsWithChildren<{ tone?: 'default' | 'danger' | 'good' }>

export const Badge = ({ children, tone = 'default' }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center border border-black dark:border-white px-2 py-1 text-xs font-mono uppercase',
      tone === 'default' && 'bg-white dark:bg-black text-black dark:text-white',
      tone === 'danger' && 'bg-black dark:bg-black text-white dark:text-white',
      tone === 'good' && 'bg-white dark:bg-black text-black dark:text-white',
    )}
  >
    {children}
  </span>
)
