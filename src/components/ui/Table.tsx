import type { PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

export const Table = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className="w-full max-w-full overflow-x-auto border-2 border-black dark:border-white -mx-2 md:mx-0">
    <table className={cn('min-w-full border-collapse text-left text-xs md:text-sm', className)}>{children}</table>
  </div>
)

export const Th = ({ children }: PropsWithChildren) => (
  <th className="border-b-2 border-black dark:border-white bg-black dark:bg-black px-2 py-1 md:px-3 md:py-2 font-mono text-xs uppercase tracking-wide text-white dark:text-white whitespace-nowrap">
    {children}
  </th>
)

export const Td = ({ children }: PropsWithChildren) => (
  <td className="border-b border-black dark:border-white px-2 py-1 md:px-3 md:py-2 align-top text-xs md:text-sm whitespace-normal text-black dark:text-white">{children}</td>
)
