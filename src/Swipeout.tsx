import { useSpring, animated, SpringConfig, useSprings } from '@react-spring/web'
import cn from 'classnames'
import { useDrag } from '@use-gesture/react'
import { ReactNode, useEffect, useRef, useState } from 'react'

import { useSingletonTimeout } from './utils'
import './index.css'

export type ActionConifg = {
    renderContent: (params: { isArmed: boolean }) => ReactNode
    background: string
    // fixed width is required for an action content in order to calculate sliding element lock positions
    width: number
    onTrigger: () => void
}

type Props = {
    className?: string
    contentClassName?: string
    children?: ReactNode
    /**
     * Actions configuration. The first left action and the last right action are considered the main ones.
     */
    actions?: {
        left?: ActionConifg[]
        right?: ActionConifg[]
    }
    actionTriggerThreshold?: number
    /** Number of milliseconds to complete main action arming animation */
    actionArmingAnimationDuration?: number
    areActionsSwipable?: boolean
    springConfig?: SpringConfig
    onActionArmedChange?: (isArmed: boolean) => void
}

type LockPosition = 'left' | 'right' | 'center'
type ArmedAction = 'left' | 'right' | 'none'
type ActionArmStage = 'none' | 'arming' | 'armed' | 'unarming'

const DEFAULT_ACTION_TRIGGER_THRESHOLD = 0.6 // percentage of container width
const DEFAULT_ACTION_ARM_DURATION = 250

export const Swipeout = ({
    className,
    contentClassName,
    children,
    actions = {
        left: [],
        right: [],
    },
    areActionsSwipable = true,
    actionTriggerThreshold = DEFAULT_ACTION_TRIGGER_THRESHOLD,
    actionArmingAnimationDuration = DEFAULT_ACTION_ARM_DURATION,
    springConfig = { tension: 270, friction: 26, clamp: true },
    onActionArmedChange,
}: Props) => {
    const leftActionsCount = actions?.left?.length ?? 0
    const rightActionsCount = actions?.right?.length ?? 0
    const containerRef = useRef<HTMLDivElement>(null)
    const stateRef = useRef({
        isPointerDownElementIsAction: false,
        lockPosition: 'center' as LockPosition,
        lockOffset: 0,
        armed: {
            action: 'none' as ArmedAction,
            stage: 'none' as ActionArmStage,
        },
    })
    const [armedActionState, setArmedActionState] = useState<ArmedAction>('none')
    const [setTimeout] = useSingletonTimeout()

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

        const handleActionSpringStart = (
            index: number,
            actionSide: ArmedAction,
            width: number,
            actionsCount: number,
        ) => {
            const result = { x: Math.abs(x), immediate }

            if (actionsCount === 1) {
                return result
            }

            const isMainAction = index === 0
            const isArmable = isMainAction && stateRef.current.armed.action === actionSide
            const armStage = stateRef.current.armed.stage

            result.x = isArmable && ['arming', 'armed'].includes(stateRef.current.armed.stage) ? Math.abs(x) : width

            if (isArmable) {
                if (['arming', 'armed'].includes(stateRef.current.armed.stage)) {
                    result.x = Math.abs(x)
                }

                result.immediate = !['arming', 'unarming'].includes(armStage)
            }

            return result
        }

        leftSpringsApi.start((index) =>
            handleActionSpringStart(index, 'left', x > 0 ? x / leftActionsCount : 0, leftActionsCount),
        )
        rightSpringsApi.start((index) =>
            handleActionSpringStart(index, 'right', x < 0 ? -x / rightActionsCount : 0, rightActionsCount),
        )
    }

    const bind = useDrag(
        ({ movement: [mx], down, active, velocity: [vx], event }) => {
            const width = containerRef.current?.clientWidth

            if (!width) {
                return
            }

            const { isPointerDownElementIsAction, lockPosition, lockOffset, armed } = stateRef.current
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
                // locked position shouldn't be the center one otherwise the action would trigger on the first slide
                const shouldArmMainAction =
                    lockPosition !== 'center' && Math.abs(mx + lockOffset) > width * actionTriggerThreshold
                const isArmedOrArming = ['armed', 'arming'].includes(stateRef.current.armed.stage)

                if (shouldArmMainAction) {
                    if (!isArmedOrArming) {
                        // we don't want to trigger this branch again if `stage` is `arming` or `armed` already
                        onActionArmedChange?.(true)
                        setArmedActionState(activeActionsSide)
                        stateRef.current.armed.action = activeActionsSide
                        stateRef.current.armed.stage = 'arming'

                        setTimeout(() => {
                            stateRef.current.armed.stage = 'armed'
                        }, actionArmingAnimationDuration)
                    }
                } else {
                    if (isArmedOrArming) {
                        // again, `unarming` branch is triggered only if `stage` is `arming` or `armed`
                        onActionArmedChange?.(false)
                        setArmedActionState('none')
                        stateRef.current.armed.stage = 'unarming'

                        setTimeout(() => {
                            stateRef.current.armed.action = 'none'
                            stateRef.current.armed.stage = 'none'
                        }, actionArmingAnimationDuration)
                    }
                }

                springApiStart({
                    x: mx + lockOffset,
                    immediate: down,
                })

                return
            }

            // pointer is up, we should check if action should be triggered
            if (armed.stage === 'armed') {
                const mainAction = armed.action === 'left' ? actions!.left!.at(0) : actions!.right!.at(-1)

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
                const isMainAction = index === 0
                const isArmed = isMainAction && armedActionState === 'left'

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
                            {action.renderContent({ isArmed })}
                        </div>
                    </animated.div>
                )
            })}
            {[...(actions?.right ?? [])].reverse().map((action, index) => {
                const { x } = rightSprings[index]
                const isMainAction = index === 0
                const isArmed = isMainAction && armedActionState === 'right'

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
                            {action.renderContent({ isArmed })}
                        </div>
                    </animated.div>
                )
            })}
            <animated.div
                className={cn('relative', contentClassName)}
                style={{ x, zIndex: rightActionsCount + leftActionsCount + 1 }}
            >
                {children}
            </animated.div>
        </div>
    )
}
