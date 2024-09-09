# @letoxyz/swipeout

A React library for creating swipeable components with customizable actions.

## Installation

```bash
npm install @letoxyz/swipeout
```


or

```bash
yarn add @letoxyz/swipeout
```


## Usage

First, import the component and its styles:

```typescript
import { Swipeout } from '@letoxyz/swipeout';
import '@letoxyz/swipeout/style.css';
```


Then use it in your React component:

```typescript
import React, { useCallback, useMemo } from 'react'
import { Swipeout } from '@letoxyz/swipeout'
import '@letoxyz/swipeout/style.css'

const MyComponent: React.FC = () => {
  const handleDelete = useCallback(() => {
    console.log('Delete action triggered')
  }, [])

  const renderSwipeContent = useCallback(({ isArmed }: { isArmed: boolean }) => (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '75px',
    }}>
      Delete {isArmed ? '(Armed)' : ''}
    </div>
  ), [])

  const actions = useMemo(() => ({
    right: [
      {
        renderContent: renderSwipeContent,
        background: 'red',
        width: 75,
        onTrigger: handleDelete,
      },
    ],
  }), [renderSwipeContent, handleDelete])

  const handleActionArmedChange = useCallback((isArmed: boolean) => {
    console.log(`Action is ${isArmed ? 'armed' : 'unarmed'}`)
  }, [])

  return (
    <Swipeout
      actions={actions}
      onActionArmedChange={handleActionArmedChange}
    >
      <div className="p-4 bg-black">
        <div className="text-xl font-bold">Swipe me to the left</div>
        <div>This content can be swiped</div>
      </div>
    </Swipeout>
  )
}

export default MyComponent
```


## API

### Swipeout

The main component for creating a swipeable element.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content of the component |
| `actions` | `{ left?: ActionConfig[], right?: ActionConfig[] }` | Configuration of actions for left and right swipes |
| `onActionArmedChange` | `(isArmed: boolean) => void` | Callback function called when the action armed state changes |

### ActionConfig

An object describing the configuration of a swipe action.

| Property | Type | Description |
|----------|------|-------------|
| `renderContent` | `(params: { isArmed: boolean }) => ReactNode` | Function to render the action content |
| `background` | `string` | Background color of the action |
| `width` | `number` | Width of the action in pixels |
| `onTrigger` | `() => void` | Function called when the action is triggered |

## TypeScript Support

For correct TypeScript support, create a file `src/swipeout.d.ts` with the following content:

```typescript
declare module '@letoxyz/swipeout' {
  import React, { ReactNode } from 'react';

  interface ActionConfig {
    renderContent: (params: { isArmed: boolean }) => ReactNode;
    background: string;
    width: number;
    onTrigger: () => void;
  }

  interface SwipeoutProps {
    children: ReactNode;
    actions?: {
      left?: ActionConfig[];
      right?: ActionConfig[];
    };
    onActionArmedChange?: (isArmed: boolean) => void;
  }

  export const Swipeout: React.FC<SwipeoutProps>;
}
```


This will provide proper type definitions for the Swipeout component and its props.

## License

This project is licensed under the MIT License.
