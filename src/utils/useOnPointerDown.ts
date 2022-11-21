import { DependencyList, useEffect } from 'react'

export function useOnPointerDown(callback: (e: PointerEvent) => void, deps: DependencyList = []) {
    useEffect(() => {
        window.addEventListener('pointerdown', callback)

        return () => {
            window.removeEventListener('pointerdown', callback)
        }
    }, deps)
}
