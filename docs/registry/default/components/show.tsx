import type { ReactNode } from 'react'

interface ShowProps<T> {
  when: T
  fallback?: ReactNode
  children: (item: NonNullable<T>) => ReactNode
}

const Show = <T,>({
  when: condition,
  fallback = null,
  children,
}: ShowProps<T>) => {
  if (!condition) return <>{fallback}</>

  return typeof children === 'function'? children(condition as NonNullable<T>): children
}

Show.displayName = "Show";

export { Show }