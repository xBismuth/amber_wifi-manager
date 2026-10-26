import { useEffect } from 'react'

export function useOpsSocket(onEvent: () => void) {
  useEffect(() => {
    const id = window.setInterval(onEvent, 8_000)
    return () => window.clearInterval(id)
  }, [onEvent])
}
