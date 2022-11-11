import * as jest from 'jest-mock'
window.jest = jest

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
        default: 'dimmed',
        values: [
            {
                name: 'white',
                value: '#fff',
            },
            {
                name: 'dimmed',
                value: '#f5f5f5',
            },
        ],
    },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
}
