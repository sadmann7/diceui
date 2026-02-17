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
  - `/content/docs/components/*` - MDX documentation files organized by base (radix/base)
  - `/components/*` - React components used in documentation
  - `/registry/bases/*` - Multi-base component registry
    - `/radix/*` - Radix UI based components
    - `/base/*` - Base UI based components
  - `/types/*` - TypeScript type definitions organized by base
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
- Create a new file in the appropriate `/types/[base]/` directory (radix or base)
- Import the types from the component package
- Place new documentation in the appropriate base directory under `/content/docs/components/[base]/`
- Set the `base` frontmatter field to either "radix" or "base"
- Use MDX format for documentation files
- Include proper frontmatter with title, description, and other metadata
- Update AutoTypeTable paths to reference `./types/[base]/[component-name].ts`
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

DiceUI supports multiple UI base libraries (Radix UI and Base UI). When adding new components:

1. Choose the appropriate base library:
   - **Radix UI**: Use for components built with `@radix-ui/react-*` primitives
   - **Base UI**: Use for components built with `@base-ui/react` primitives

2. Create component files in the appropriate base directory:
   - UI components: `/registry/bases/[base]/ui/`
   - Examples: `/registry/bases/[base]/examples/`
   - Hooks: `/registry/bases/[base]/hooks/`
   - Utilities: `/registry/bases/[base]/lib/`

3. Update the respective `_registry.ts` files in each directory

4. For Radix UI components:
   - Use `asChild` prop pattern with Slot primitive
   - Use `CompositionProps` and `EmptyProps` for type definitions
   - Import utilities from `@/registry/bases/radix/`

5. For Base UI components:
   - Use `render` prop pattern with `useRender` hook
   - Use `useRender.ComponentProps` and `EmptyProps` for type definitions
   - Import utilities from `@/registry/bases/base/`

6. Include proper documentation and types in `/types/[base]/`

7. Test the component in isolation

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
- Use conventional commits with the following pattern:

### Commit Convention

Use the format: `type(scope): description`

**Examples:**

```text
feat(media-player): optimize scrubbing performance
fix(combobox): resolve keyboard navigation issue
docs(mention): update API documentation
refactor(shared): simplify utility functions
test(tags-input): add validation tests
```

**Types:**

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation changes
- `refactor`: code refactoring
- `test`: adding or updating tests
- `chore`: maintenance tasks
- `perf`: performance improvements
- `ci`: continuous integration changes

**Scope:**

- Use the package/component name (e.g., `combobox`, `mention`, `tags-input`, `media-player`)
- Use `shared` for shared utilities
- Use `docs` for documentation-specific changes

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
