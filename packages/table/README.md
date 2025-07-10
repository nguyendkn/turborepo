# @teable/table

A powerful, reusable data table component library extracted from Teable, featuring advanced grid capabilities, virtualization, and comprehensive table functionality.

## Features

- 🚀 **High Performance**: Virtualized rendering for large datasets
- 📊 **Advanced Grid**: Canvas-based rendering with complex interactions
- 🔄 **Infinite Scrolling**: Seamless data loading
- 🎯 **Selection**: Multi-level selection (cells, rows, columns)
- 📏 **Resizable Columns**: Drag to resize with constraints
- 🔒 **Column Freezing**: Pin columns to left or right
- 🎨 **Theming**: Customizable themes and styling
- ⌨️ **Keyboard Navigation**: Full keyboard support
- 📱 **Touch Support**: Mobile-friendly interactions
- 🤝 **Collaborative**: Real-time collaboration features
- 🔍 **Search & Filter**: Built-in search and filtering
- 📝 **Inline Editing**: Cell-level editing capabilities

## Installation

```bash
npm install @teable/table
# or
yarn add @teable/table
# or
pnpm add @teable/table
```

## Quick Start

```tsx
import { BasicTable } from '@teable/table';

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

const columns = [
  { id: 'name', name: 'Name', accessor: 'name' },
  { id: 'email', name: 'Email', accessor: 'email' },
];

function MyTable() {
  return (
    <BasicTable
      data={data}
      columns={columns}
    />
  );
}
```

## Components

### BasicTable
Simple table component for basic data display.

### InfiniteTable
Table with infinite scrolling capabilities.

### VirtualizedTable
High-performance table with row virtualization.

### DataGrid
Advanced grid component with canvas rendering and complex interactions.

## API Reference

See the [API documentation](./docs/api.md) for detailed component props and methods.

## Examples

Check out the [examples directory](./examples) for more usage examples.

## Contributing

Please read our [contributing guidelines](../../CONTRIBUTING.md) before submitting PRs.

## License

MIT License - see [LICENSE](./LICENSE) file for details.
