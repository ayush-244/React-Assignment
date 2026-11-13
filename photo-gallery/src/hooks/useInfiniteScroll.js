import { useEffect } from 'react'

export function useInfiniteScroll({
  targetRef,
  enabled,
  onIntersect,
  rootMargin = '320px 0px',
  threshold = 0,
}) {
  useEffect(() => {
    const node = targetRef.current
    if (!node || !enabled) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          onIntersect()
        }
      },
      { root: null, rootMargin, threshold },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [targetRef, enabled, onIntersect, rootMargin, threshold])
}
