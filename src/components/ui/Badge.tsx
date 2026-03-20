import type { PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

type BadgeProps = PropsWithChildren<{ tone?: 'default' | 'danger' | 'good' }>

export const Badge = ({ children, tone = 'default' }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center border border-black px-2 py-1 text-xs font-mono uppercase',
      tone === 'default' && 'bg-white text-black',
      tone === 'danger' && 'bg-black text-white',
      tone === 'good' && 'bg-zinc-200 text-black',
    )}
  >
    {children}
  </span>
)
