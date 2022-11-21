import { ComponentStory, ComponentMeta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import cn from 'classnames'

import { Swipeout } from './Swipeout'
import './storybook.css'

export default {
    title: 'Swipeout',
    component: Swipeout,
} as ComponentMeta<typeof Swipeout>

const Template: ComponentStory<typeof Swipeout> = (args) => <Swipeout {...args} />

const onActionArmedChange = (isArmed: boolean) => {
    console.log(`main action ${isArmed ? 'is armed' : 'is unarmed'}`)

    if (window.navigator.vibrate) {
        // note: safari is not supported
        window.navigator.vibrate(100)
    }
}

export const OneActionFromTheRight = Template.bind({})
OneActionFromTheRight.args = {
    contentClassName: 'p-4 bg-[#ffffff]',
    children: (
        <>
            <div className="text-xl font-black">Swipe me to the left</div>
            <div>Don't swipe to the right, it will do nothing</div>
        </>
    ),
    actions: {
        right: [
            {
                renderContent: ({ isArmed }) => (
                    <div
                        className={cn('text-white text-center px-1', isArmed && 'animate-[tilt-shaking_0.2s_infinite]')}
                    >
                        Delete
                    </div>
                ),
                background: '#333',
                width: 98,
                onTrigger: () => action('delete triggered'),
            },
        ],
    },
    onActionArmedChange,
}

export const TwoActionsFromTheRight = Template.bind({})
TwoActionsFromTheRight.args = {
    contentClassName: 'p-4 bg-[#fff]',
    children: (
        <>
            <div className="text-xl font-bold">Bumblebee</div>
        </>
    ),
    actions: {
        right: [
            {
                renderContent: () => <div className="px-4 text-white">Send to parking</div>,
                width: 128,
                background: '#4b4eff',
                onTrigger: () => console.log('parking triggered'),
            },
            {
                renderContent: () => <div className="px-4 text-white">Ride</div>,
                width: 128,
                background: '#ff3737',
                onTrigger: () => console.log('ride triggered'),
            },
        ],
    },
    onActionArmedChange,
}

export const TwoActionsFromTheLeft = Template.bind({})
TwoActionsFromTheLeft.args = {
    contentClassName: 'p-4 bg-[#fff]',
    children: (
        <>
            <div className="text-xl font-bold">Bumblebee</div>
        </>
    ),
    actions: {
        left: [
            {
                renderContent: () => <div className="px-4 text-white">Send to parking</div>,
                width: 128,
                background: '#4b4eff',
                onTrigger: () => console.log('parking triggered'),
            },
            {
                renderContent: () => <div className="px-4 text-white">Ride</div>,
                width: 128,
                background: '#ff3737',
                onTrigger: () => console.log('ride triggered'),
            },
        ],
    },
    onActionArmedChange,
}

export const TwoActionsFromTheRightOneFromTheLeft = Template.bind({})
TwoActionsFromTheRightOneFromTheLeft.args = {
    contentClassName: 'p-4 bg-[#fff]',
    children: (
        <>
            <div className="text-xl font-bold">Megatron</div>
        </>
    ),
    actions: {
        left: [
            {
                renderContent: () => <div className="px-4 text-white">Disassemble</div>,
                width: 128,
                background: '#ff3737',
                onTrigger: () => console.log('disassemble triggered'),
            },
        ],
        right: [
            {
                renderContent: () => <div className="px-1 text-white text-center">Freeze</div>,
                background: '#4b4eff',
                width: 86,
                onTrigger: () => console.log('freeze triggered'),
            },
            {
                renderContent: () => <div className="px-1 text-white text-center">Unfreeze</div>,
                background: '#ffa837',
                width: 86,
                onTrigger: () => console.log('unfreeze triggered'),
            },
        ],
    },
    onActionArmedChange,
}

export const ThreeActionsFromBothSides = Template.bind({})
ThreeActionsFromBothSides.args = {
    contentClassName: cn('p-4 text-white bg-[#222]'),
    children: (
        <>
            <div className="text-2xl font-thin tracking-widest">
                <div className="mt-[-4px]">power rangers</div>
            </div>
        </>
    ),
    actions: {
        left: [
            {
                renderContent: ({ isArmed }) => (
                    <div className={cn('px-4 text-white text-center', isArmed && 'bold')}>Red</div>
                ),
                width: 86,
                background: '#ff3737',
                onTrigger: () => console.log('red triggered'),
            },
            {
                renderContent: () => <div className="px-4 text-white text-center">Black</div>,
                width: 86,
                background: '#222',
                onTrigger: () => console.log('black triggered'),
            },
            {
                renderContent: () => <div className="px-1 text-white text-center text-center">Blue</div>,
                background: '#4b4eff',
                width: 86,
                onTrigger: () => console.log('blue triggered'),
            },
        ],
        right: [
            {
                renderContent: () => <div className="px-1 text-[#222] text-center">Yellow</div>,
                background: '#ffe437',
                width: 86,
                onTrigger: () => console.log('yellow triggered'),
            },
            {
                renderContent: () => <div className="px-1 text-white text-center">Pink</div>,
                background: '#ff37c6',
                width: 86,
                onTrigger: () => console.log('pink triggered'),
            },
            {
                renderContent: () => <div className="px-1 text-[#222] text-center">Green</div>,
                background: '#37ff37',
                width: 86,
                onTrigger: () => console.log('green triggered'),
            },
        ],
    },
    onActionArmedChange,
}
