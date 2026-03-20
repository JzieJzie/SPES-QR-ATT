import type { PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

export const Table = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className="overflow-auto border-2 border-black">
    <table className={cn('min-w-full border-collapse text-left text-sm', className)}>{children}</table>
  </div>
)

export const Th = ({ children }: PropsWithChildren) => (
  <th className="border-b-2 border-black bg-black px-3 py-2 font-mono text-xs uppercase tracking-wide text-white">
    {children}
  </th>
)

export const Td = ({ children }: PropsWithChildren) => (
  <td className="border-b border-black px-3 py-2 align-top">{children}</td>
)
