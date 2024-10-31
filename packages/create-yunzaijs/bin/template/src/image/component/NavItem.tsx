import React, { type ReactNode } from 'react'
/**
 *
 * @param param0
 * @returns
 */
export default function NavItem({
  href,
  children
}: {
  href: string
  children: ReactNode
}) {
  return (
    <li>
      <a
        href={href}
        className={`block px-3 py-2 rounded-md bg-sky-500 text-white`}
      >
        {children}
      </a>
    </li>
  )
}
