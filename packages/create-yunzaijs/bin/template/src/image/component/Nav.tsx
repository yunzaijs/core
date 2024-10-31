import React, { type ReactNode } from 'react'
export default function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="py-4 px-6 text-sm font-medium">
      <ul className="flex space-x-3">{children}</ul>
    </nav>
  )
}
