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

```jsx
import { Swipeout } from '@letoxyz/swipeout';
import '@letoxyz/swipeout/style.css';
```

Then, use it in your React component:

```jsx
import React from 'react';
import { Swipeout } from '@letoxyz/swipeout';
import '@letoxyz/swipeout/style.css';

const MyComponent = () => {
  const handleDelete = () => {
    console.log('Delete action triggered');
  };

  const renderSwipeContent = () => (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '75px'
    }}>
      Delete
    </div>
  );

  return (
    <Swipeout
      right={[
        {
          content: renderSwipeContent(),
          action: handleDelete,
        },
      ]}
      autoClose={true}
    >
      <div>Swipeable content goes here</div>
    </Swipeout>
  );
};

export default MyComponent;
```

## API

### Swipeout

The main component for creating a swipeable element.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `left` | `Array<SwipeoutButton>` | `[]` | Array of buttons for left swipe |
| `right` | `Array<SwipeoutButton>` | `[]` | Array of buttons for right swipe |
| `autoClose` | `boolean` | `false` | Automatically close swipe after action |
| `sensitivity` | `number` | `10` | Swipe sensitivity |
| `children` | `ReactNode` | - | Content of the swipeable component |

### SwipeoutButton

An object describing a swipe button.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `content` | `ReactNode` | Content of the button |
| `action` | `() => void` | Function called when the button is pressed |

## TypeScript Support

This library includes TypeScript definitions. Here's an example of the type definitions:

```typescript
// index.d.ts

import { ReactNode } from 'react';

export interface SwipeoutButton {
  content: ReactNode;
  action: () => void;
}

export interface SwipeoutProps {
  left?: SwipeoutButton[];
  right?: SwipeoutButton[];
  autoClose?: boolean;
  sensitivity?: number;
  children: ReactNode;
}

export class Swipeout extends React.Component<SwipeoutProps> {}
```

## Examples

### Left and Right Swipe

```jsx
<Swipeout
  left={[
    {
      content: <div>Archive</div>,
      action: () => console.log('Archived'),
    },
  ]}
  right={[
    {
      content: <div>Delete</div>,
      action: () => console.log('Deleted'),
    },
  ]}
>
  <div>Swipe me left or right</div>
</Swipeout>
```

### Multiple Buttons

```jsx
<Swipeout
  right={[
    {
      content: <div>Edit</div>,
      action: () => console.log('Edit'),
    },
    {
      content: <div>Delete</div>,
      action: () => console.log('Delete'),
    },
  ]}
>
  <div>Swipe me right for multiple actions</div>
</Swipeout>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
