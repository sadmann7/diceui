# Contributing to Dice UI

Thank you for your interest in contributing to Dice UI! This guide will help you get started with contributing to both our components and documentation.

## Project Structure

Dice UI is organized into multiple packages and documentation:

- `/packages/*` - Component packages
  - `@diceui/combobox` - Combobox component
  - `@diceui/mention` - Mention component
  - `@diceui/tags-input` - Tags Input component
  - `@diceui/checkbox-group` - Checkbox Group component
  - `@diceui/shared` - Shared utilities and types
- `/docs/*` - Documentation website
  - `/app/*` - Next.js App Router pages
  - `/content/docs/*` - MDX documentation files
  - `/components/*` - React components used in documentation
  - `/registry/*` - Component examples and demos
  - `/styles/*` - Global styles and Tailwind CSS configurations

## Development Setup

1. Fork the repository

2. Clone the repository:

   ```bash
   git clone https://github.com/sadmann7/diceui.git
   ```

3. Navigate to the project directory:

   ```bash
   cd diceui
   ```

4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Start the development server:

   ```bash
   turbo dev
   ```

## Contributing to Packages

### Creating a New Package

1. Create a new directory in `packages/` with your component name
2. Initialize the package with required files:

   - `package.json`
   - `README.md`
   - `tsconfig.json`
   - `tsup.config.ts`
   - `src/` directory
   - `test/` directory

### Package Structure Example

```text
packages/your-component/
├── src/
│   ├── index.ts
│   ├── your-component-root.tsx
│   ├── your-component-content.tsx
│   └── types.ts
├── test/
│   └── your-component.test.ts
├── tsconfig.json
└── tsup.config.ts
```

| Path | Description |
| --- | --- |
| `packages/your-component/` | Component package directory |
| `src/` | Component source files |
| `index.ts` | Entry point for the component |
| `your-component-root.tsx` | Root component file |
| `test/` | Test source files |
| `your-component.test.ts` | Test file for the component |
| `tsconfig.json` | TypeScript configuration |
| `tsup.config.ts` | Tsup configuration |

### Write Documentation

- Navigate to the `/docs` directory
- Add the package name into `package.json`, and run `pnpm install`
- Create a new file in the `/types/` directory, and import the types from the component package
- Place new documentation in the appropriate directory under `/content/docs/`
- Use MDX format for documentation files
- Include proper frontmatter with title, description, and other metadata
- Follow the existing documentation style and structure

### Component Guidelines

#### TypeScript

- Use TypeScript for all components
- Export proper type definitions
- Use interfaces over types where appropriate
- Provide comprehensive type documentation

#### React Patterns

- Use functional components
- Implement proper prop types and defaults
- Use React Server Components where possible
- Follow the compound component pattern when appropriate

#### Styling

- Use `style` prop for styling
- Keep the `primitive` components as headless as possible
- Follow the `primitive` composition model

#### Accessibility

- Follow WAI-ARIA guidelines
- Include proper ARIA attributes
- Ensure keyboard navigation
- Test with screen readers

## Contributing to Documentation

### Writing Documentation

#### MDX Files

- Place new documentation in the appropriate directory under `/content/docs/`
- Use MDX format for documentation files
- Include proper frontmatter with title, description, and other metadata
- Follow the existing documentation style and structure

#### Code Examples

- Include working examples for components and features
- Use TypeScript for all code examples
- Ensure examples are accessible and follow best practices
- Test examples locally before submitting

### Component Registry

When adding new component examples:

1. Create a new file in `/registry/default/examples/`
2. Add the component to the registry index
3. Include proper documentation and types
4. Test the component in isolation

### Style Guide

- Use clear, concise language
- Include code examples where appropriate
- Follow TypeScript best practices
- Use proper heading hierarchy
- Include proper accessibility information

## Testing

1. Write tests for your component:
   - Unit tests for utilities
   - Component tests with React Testing Library
   - Integration tests where necessary

1. Run tests:

```bash
pnpm test
```

## Version Control

- Follow semantic versioning
- Update CHANGELOG.md with changes
- Use conventional commits

## Code Style

- Follow the project's ESLint configuration
- Use Prettier for code formatting
- Follow existing patterns in the codebase

## Submitting Changes

1. Create a new branch for your changes
2. Make your changes following the guidelines above
3. Test your changes locally
4. Submit a pull request with:
   - Clear description of changes
   - Screenshots/videos if UI changes
   - Updated tests
   - Documentation updates

## Need Help?

If you need help or have questions:

- Open an issue for component or documentation-related questions
- Join our community discussions
- Review existing components and documentation for examples
