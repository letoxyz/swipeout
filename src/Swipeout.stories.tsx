import { ComponentStory, ComponentMeta } from '@storybook/react'

import { Swipeout } from './Swipeout'

export default {
    title: 'Swipeout',
    component: Swipeout,
} as ComponentMeta<typeof Swipeout>

const Template: ComponentStory<typeof Swipeout> = (args) => <Swipeout {...args} />

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
                content: <div className="text-white px-4">Delete</div>,
                background: '#333',
                width: 128,
                onTrigger: () => console.log('delete triggered'),
            },
        ],
    },
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
                content: <div className="px-4 text-white">Send to parking</div>,
                width: 128,
                background: '#4b4eff',
                onTrigger: () => console.log('parking triggered'),
            },
            {
                content: <div className="px-4 text-white">Ride</div>,
                width: 128,
                background: '#ff3737',
                onTrigger: () => console.log('ride triggered'),
            },
        ],
    },
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
                content: <div className="px-4 text-white">Send to parking</div>,
                width: 128,
                background: '#4b4eff',
                onTrigger: () => console.log('parking triggered'),
            },
            {
                content: <div className="px-4 text-white">Ride</div>,
                width: 128,
                background: '#ff3737',
                onTrigger: () => console.log('ride triggered'),
            },
        ],
    },
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
                content: <div className="px-4 text-white">Disassemble</div>,
                width: 128,
                background: '#ff3737',
                onTrigger: () => console.log('disassemble triggered'),
            },
        ],
        right: [
            {
                content: <div className="px-4 text-white">Freeze</div>,
                background: '#4b4eff',
                width: 128,
                onTrigger: () => console.log('freeze triggered'),
            },
            {
                content: <div className="px-4 text-white">Unfreeze</div>,
                background: '#ffa837',
                width: 128,
                onTrigger: () => console.log('unfreeze triggered'),
            },
        ],
    },
}
