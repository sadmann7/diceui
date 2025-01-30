# @diceui/masonry

A performant masonry layout component for React.

## Installation

```bash
npm install @diceui/masonry
# or
yarn add @diceui/masonry
# or
pnpm add @diceui/masonry
```

## Usage

```tsx
import { MasonryRoot, MasonryItem } from "@diceui/masonry";

function App() {
  const items = [
    { id: 1, height: 100, content: "Item 1" },
    { id: 2, height: 150, content: "Item 2" },
    { id: 3, height: 200, content: "Item 3" },
    // ... more items
  ];

  return (
    <MasonryRoot
      items={items}
      columnWidth={300}
      columnGutter={16}
      rowGutter={16}
    >
      {items.map((item, index) => (
        <MasonryItem key={item.id} index={index}>
          <div style={{ height: item.height }}>
            {item.content}
          </div>
        </MasonryItem>
      ))}
    </MasonryRoot>
  );
}
```

## Props

### MasonryRoot

- `items` - Array of items to render in the grid
- `columnCount` - Optional number of columns (defaults to auto-calculated)
- `columnWidth` - Minimum width of each column (default: 300)
- `columnGutter` - Horizontal gap between columns (default: 16)
- `rowGutter` - Vertical gap between items (default: 16)
- `width` - Optional container width override
- `height` - Optional container height override

### MasonryItem

- `index` - The index of this item in the items array

## Features

- Responsive grid layout
- Dynamic height calculation
- Automatic column count
- Smooth animations
- TypeScript support
- SSR compatible
- Zero dependencies

## License

MIT 