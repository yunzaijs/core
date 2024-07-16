import React from 'react'

/**
 * div扩展组件类型
 */
type DivBackgroundImageProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  url: string
}

/**
 *
 * @param param0
 * @returns
 */
export default function App({
  children,
  style = {},
  url,
  ...props
}: DivBackgroundImageProps) {
  return (
    <div
      style={{
        backgroundImage: `url(${url})`,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  )
}
