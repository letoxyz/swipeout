import { useCallback, useEffect, useRef } from 'react'

export function useSingletonTimeout() {
    const timeoutRef = useRef<number>()

    const clearTimeout = useCallback(() => window.clearTimeout(timeoutRef.current), [])
    const setTimeout = useCallback((callback: TimerHandler, delay?: number) => {
        clearTimeout()
        timeoutRef.current = window.setTimeout(callback, delay)
    }, [])

    useEffect(() => clearTimeout, [])

    return [setTimeout, clearTimeout]
}
