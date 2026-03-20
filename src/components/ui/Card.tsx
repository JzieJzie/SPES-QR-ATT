import type { PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

type CardProps = PropsWithChildren<{
  className?: string
  title?: string
}>

export const Card = ({ className, title, children }: CardProps) => (
  <section className={cn('border-2 border-black bg-white p-4 shadow-brutal', className)}>
    {title ? <h2 className="mb-3 text-lg font-heading uppercase">{title}</h2> : null}
    {children}
  </section>
)
