import type { PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

export const Table = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className="overflow-x-auto border-2 border-black -mx-2 md:mx-0">
    <table className={cn('min-w-full border-collapse text-left text-xs md:text-sm', className)}>{children}</table>
  </div>
)

export const Th = ({ children }: PropsWithChildren) => (
  <th className="border-b-2 border-black bg-black px-2 py-1 md:px-3 md:py-2 font-mono text-xs uppercase tracking-wide text-white whitespace-nowrap">
    {children}
  </th>
)

export const Td = ({ children }: PropsWithChildren) => (
  <td className="border-b border-black px-2 py-1 md:px-3 md:py-2 align-top text-xs md:text-sm whitespace-normal">{children}</td>
)
