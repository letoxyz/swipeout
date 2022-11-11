import { useSpring, animated } from '@react-spring/web'
import cn from 'classnames'
import { useDrag } from '@use-gesture/react'
import { ReactNode, useEffect, useRef, useState } from 'react'

import './index.css'

export type ActionConifg = {
    content: ReactNode
    background: string
    // fixed width is required for an action content in order to calculate sliding element lock positions
    width: number
    onTrigger: () => void
}

type Props = {
    contentClassName?: string
    children?: ReactNode
    actions?: {
        right?: ActionConifg[]
        left?: ActionConifg[]
    }
}

type LockPosition = 'left' | 'right' | 'center'
type ArmedAction = 'left' | 'right' | 'none'

const ACTION_TRIGGER_THRESHOLD = 0.6 // percentage of container width

export const Swipeout = ({
    contentClassName,
    children,
    actions = {
        left: [],
        right: [],
    },
}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const stateRef = useRef({
        isPointerDownElementIsAction: false,
        lockPosition: 'center' as LockPosition,
        lockOffset: 0,
        armedAction: 'none' as ArmedAction,
    })
    const [armedActionState, setArmedActionState] = useState<ArmedAction>('none')

    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            const checkIsAction = (node: HTMLElement | null): boolean => {
                if (!node) {
                    return false
                }

                if (node?.dataset?.type === 'action') {
                    return true
                } else {
                    return checkIsAction(node.parentElement)
                }
            }
            const isAction = checkIsAction(e?.target as HTMLDivElement)

            stateRef.current.isPointerDownElementIsAction = isAction
        }
        window.addEventListener('pointerdown', onPointerDown)

        return () => {
            window.removeEventListener('pointerdown', onPointerDown)
        }
    }, [])

    const [{ x }, api] = useSpring(() => ({ x: 0, config: { tension: 270, friction: 26 } }))

    const bind = useDrag(
        ({ movement: [mx], down, active, velocity: [vx], event }) => {
            const width = containerRef.current?.clientWidth

            if (!width) {
                return
            }

            const { isPointerDownElementIsAction, lockPosition, lockOffset, armedAction } = stateRef.current
            const direction = mx < 0 ? 'left' : 'right'
            const activeActionsSide = mx < 0 ? 'right' : 'left'

            if (
                lockPosition === 'center' &&
                ((!actions?.right?.length && activeActionsSide === 'right') ||
                    (!actions?.left?.length && activeActionsSide === 'left'))
            ) {
                // no actions -> no reaction
                return
            }

            if (isPointerDownElementIsAction) {
                if (event.type === 'pointerup') {
                    // swipe was started over an action element -> we shouldn't trigger the action
                    event.preventDefault()
                }

                // swipe over an action shouldn't trigger the slide
                return
            }

            // pointer is down, the element should just slide
            if (active) {
                api.start(() => ({
                    x: mx + lockOffset,
                    immediate: down,
                }))

                if (Math.abs(mx + lockOffset) > width * ACTION_TRIGGER_THRESHOLD) {
                    setArmedActionState(activeActionsSide)
                    stateRef.current.armedAction = activeActionsSide
                } else {
                    setArmedActionState('none')
                    stateRef.current.armedAction = 'none'
                }

                return
            }

            // pointer is up, we should check if action should be triggered
            if (armedAction !== 'none') {
                const mainAction = actions?.[armedAction]?.[0]

                if (mainAction) {
                    mainAction.onTrigger()
                }

                api.start({
                    x: 0,
                })
                stateRef.current.lockPosition = 'center'
                stateRef.current.lockOffset = 0

                return
            }

            // pointer is up, we should recaclucate lock position
            if (lockPosition === 'center') {
                const actionsWidth = actions?.[activeActionsSide]?.reduce((sum, action) => sum + action.width, 0) ?? 0
                const lockPositionOffset = direction === 'left' ? -actionsWidth : actionsWidth

                api.start({
                    x: lockPositionOffset,
                })

                stateRef.current.lockPosition = direction
                stateRef.current.lockOffset = lockPositionOffset
            } else if (lockPosition === activeActionsSide) {
                api.start({
                    x: 0,
                })
                stateRef.current.lockPosition = 'center'
                stateRef.current.lockOffset = 0
            } else {
                api.start({
                    x: stateRef.current.lockOffset,
                })
            }
        },
        {
            axis: 'x',
            preventScroll: true,
            preventScrollAxis: 'xy',
        },
    )

    const dragProps = bind()

    const onPointerUp = (e: React.PointerEvent, action: ActionConifg) => {
        dragProps.onPointerUp?.(e)

        if (e.defaultPrevented) {
            return
        }

        stateRef.current.lockPosition = 'center'
        stateRef.current.lockOffset = 0
        api.start({ x: 0 })
        action.onTrigger()
    }

    return (
        <div className="relative select-none touch-none" {...dragProps} ref={containerRef}>
            {actions?.left?.map((action, index, leftActions) => {
                const isMainAction = index === 0
                const isArmed = isMainAction && armedActionState === 'left'
                const width = x.to((x) => (x > 0 ? x / leftActions.length : 0))

                return (
                    <animated.div
                        className={cn('absolute left-0 flex h-full justify-start items-center overflow-hidden', {
                            'justify-end': isArmed,
                        })}
                        style={{
                            background: action.background,
                            left: width.to((w) => w * index),
                            width: isArmed ? x : width,
                            zIndex: Math.abs(leftActions.length - index),
                        }}
                        key={index}
                        {...dragProps}
                        onPointerUp={(e) => onPointerUp(e, action)}
                        data-type="action"
                    >
                        <div className="shrink-0" style={{ width: action.width }}>
                            {action.content}
                        </div>
                    </animated.div>
                )
            })}
            {[...(actions?.right ?? [])].reverse().map((action, index, rightActions) => {
                const isMainAction = index === 0
                const isArmed = isMainAction && armedActionState === 'right'
                const width = x.to((x) => (x < 0 ? Math.abs(x / rightActions.length) : 0))

                return (
                    <animated.div
                        className="absolute right-0 flex h-full justify-start items-center overflow-hidden"
                        style={{
                            background: action.background,
                            right: width.to((w) => w * index),
                            width: isArmed ? x.to((x) => Math.abs(x)) : width,
                            zIndex: Math.abs(rightActions.length - index),
                        }}
                        key={index}
                        {...dragProps}
                        onPointerUp={(e) => onPointerUp(e, action)}
                        data-type="action"
                    >
                        <div className="shrink-0" style={{ width: action.width }}>
                            {action.content}
                        </div>
                    </animated.div>
                )
            })}
            <animated.div
                className="relative"
                style={{ x, zIndex: (actions?.right?.length ?? 0) + (actions?.left?.length ?? 0) + 1 }}
            >
                <div className={contentClassName}>{children}</div>
            </animated.div>
        </div>
    )
}
