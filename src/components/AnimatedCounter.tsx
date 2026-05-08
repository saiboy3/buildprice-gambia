'use client'
import { useEffect, useRef, useState } from 'react'

export default function AnimatedCounter({
  end, prefix = '', suffix = '', duration = 2000
}: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount]   = useState(0)
  const ref                  = useRef<HTMLSpanElement>(null)
  const started              = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed  = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased    = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}
