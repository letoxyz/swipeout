import { useSpring, animated, SpringConfig, useSprings } from '@react-spring/web'
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
    className?: string
    contentClassName?: string
    children?: ReactNode
    actions?: {
        right?: ActionConifg[]
        left?: ActionConifg[]
    }
    areActionsSwipable?: boolean
    springConfig?: SpringConfig
}

type LockPosition = 'left' | 'right' | 'center'
type ArmedAction = 'left' | 'right' | 'none'

const ACTION_TRIGGER_THRESHOLD = 0.6 // percentage of container width
const SPRING_TENSION = 270
const SPRING_FRICTION = 26

export const Swipeout = ({
    className,
    contentClassName,
    children,
    actions = {
        left: [],
        right: [],
    },
    areActionsSwipable = true,
    springConfig = { tension: SPRING_TENSION, friction: SPRING_FRICTION },
}: Props) => {
    const leftActionsCount = actions?.left?.length ?? 0
    const rightActionsCount = actions?.right?.length ?? 0
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

    const [{ x }, api] = useSpring(() => ({ x: 0, config: springConfig }))
    const [leftSprings, leftSpringsApi] = useSprings(leftActionsCount, (index) => ({
        x: 0,
        config: springConfig,
    }))
    const [rightSprings, rightSpringsApi] = useSprings(rightActionsCount, (index) => ({
        x: 0,
        config: springConfig,
    }))

    const springApiStart = ({ x, immediate }: { x: number; immediate?: boolean }) => {
        api.start({ x, immediate })

        leftSpringsApi.start((index) => {
            const isMainAction = index === 0
            const isArmed = isMainAction && armedActionState === 'left'

            const result = {
                x,
                immediate,
            }
            const width = x > 0 ? x / leftActionsCount : 0

            result.x = isArmed ? x : width
            result.immediate = isArmed ? false : immediate

            return result
        })
        rightSpringsApi.start((index) => {
            const isMainAction = index === 0
            const isArmed = isMainAction && armedActionState === 'right'

            const result = {
                x,
                immediate,
            }
            const width = x < 0 ? Math.abs(x / rightActionsCount) : 0

            result.x = isArmed ? Math.abs(x) : width
            result.immediate = isArmed ? false : immediate

            return result
        })
    }

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

                if (!areActionsSwipable) {
                    // swipe over an action shouldn't trigger the slide
                    return
                }
            }

            // pointer is down, the element should just slide
            if (active) {
                springApiStart({
                    x: mx + lockOffset,
                    immediate: down,
                })

                // locked position shouldn't be the center one otherwise the action would trigger on the first slide
                if (lockPosition !== 'center' && Math.abs(mx + lockOffset) > width * ACTION_TRIGGER_THRESHOLD) {
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
                const mainAction = armedAction === 'left' ? actions!.left!.at(0) : actions!.right!.at(-1)

                if (mainAction) {
                    mainAction.onTrigger()
                }

                springApiStart({
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

                springApiStart({
                    x: lockPositionOffset,
                })

                stateRef.current.lockPosition = direction
                stateRef.current.lockOffset = lockPositionOffset
            } else if (lockPosition === activeActionsSide) {
                springApiStart({
                    x: 0,
                })
                stateRef.current.lockPosition = 'center'
                stateRef.current.lockOffset = 0
            } else {
                springApiStart({
                    x: stateRef.current.lockOffset,
                })
            }
        },
        {
            axis: 'x',
            preventScroll: true,
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
        springApiStart({ x: 0 })
        action.onTrigger()
    }

    return (
        <div className={cn('relative select-none touch-none', className)} {...dragProps} ref={containerRef}>
            {actions?.left?.map((action, index) => {
                const { x } = leftSprings[index]

                return (
                    <animated.div
                        className="absolute left-0 flex h-full items-center justify-end overflow-hidden"
                        style={{
                            background: action.background,
                            left: x.to((w) => w * index),
                            width: x,
                            zIndex: Math.abs(leftActionsCount - index),
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
            {[...(actions?.right ?? [])].reverse().map((action, index) => {
                const { x } = rightSprings[index]

                return (
                    <animated.div
                        className="absolute right-0 flex h-full justify-start items-center overflow-hidden"
                        style={{
                            background: action.background,
                            right: x.to((w) => w * index),
                            width: x,
                            zIndex: Math.abs(rightActionsCount - index),
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
