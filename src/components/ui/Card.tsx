import type { PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

type CardProps = PropsWithChildren<{
  className?: string
  title?: string
}>

export const Card = ({ className, title, children }: CardProps) => (
  <section className={cn('border-2 border-black bg-white p-2 md:p-4 shadow-brutal', className)}>
    {title ? <h2 className="mb-2 md:mb-3 text-base md:text-lg font-heading uppercase">{title}</h2> : null}
    {children}
  </section>
)
