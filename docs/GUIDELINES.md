# Development Guidelines

This document outlines the development standards and best practices for the Nercana project.

## Coding Guidelines

The application should follow best practices for a clean architecture and maintainable, easily extendable code.

- Style definitions should be restricted to SCSS files only, not inside HTML
- Use meaningful variable and function names
- Follow consistent code formatting (use Prettier and ESLint)
- Document complex logic with clear comments
- Keep functions small and focused on a single responsibility

## Architecture Guidelines

Follow these separation principles to ensure a clean, maintainable, and easily extendable codebase:

### Component-Based Architecture

- **Models**: All data models and interfaces (such as `Hero`, `LogEntry`, etc.) must be defined in their own files under `src/app/models/`
- **Services**: Business logic and data management should be implemented in Angular services under `src/app/services/`. Services should not contain UI logic
- **View Components**: UI and presentation logic should be implemented in Angular components under `src/app/`. Components should only interact with models and services via well-defined interfaces

This separation of concerns makes the application easier to test, extend, and maintain.

### Angular Best Practices

#### State Management

- Use NgRx Signal Store for state management
- Make state immutable; never modify state directly
- Separate reads (selectors/computed values) from writes (methods/actions)
- Use proper typing for all state
- Store all relevant application state in the NgRx Signal Store
- Never duplicate state across multiple services or components
- Always access state data from the appropriate store, not from redundant service properties

#### Component Design

- Keep components small and focused on specific UI tasks
- Use `OnPush` change detection strategy where appropriate
- Implement container/presentational component pattern for complex views
  - Container components manage state and connect to services
  - Presentational components receive inputs and emit outputs

#### Performance Optimization

- Minimize DOM manipulation; prefer Angular's binding system
- Unsubscribe from observables to prevent memory leaks
- Use `trackBy` function with `*ngFor` directives to improve rendering performance
- Implement lazy loading for feature modules

#### Testing

- Write unit tests for all services and components
- Use Jest as the testing framework
- Mock dependencies using Jest's mocking capabilities
- Use Angular TestBed only when necessary to test component interactions
- Test edge cases and failure scenarios
- Write readable, maintainable tests using describe/it structure
- Use the Jest coverage report to identify untested code
- Aim for at least 80% code coverage for critical app features
- Include proper setup and cleanup in tests to avoid test pollution

## TypeScript Typing Guidelines

To ensure code quality, maintainability, and robust tooling support:

- Always use explicit and correct TypeScript types for all variables, function parameters, and return values
- Avoid using `any` and prefer strong typing for all data structures
- Use interfaces to define data structure contracts
- Leverage TypeScript's advanced types (union, intersection, generics) when appropriate
- Define meaningful type aliases for complex types

## SCSS Best Practices

- Use variables for colors, spacing, and typography
- Implement a consistent naming convention (BEM recommended)
- Create reusable mixins for common style patterns
- Organize styles by component, with shared styles in a common location
- Use nesting judiciously to avoid overly specific selectors

## Git Workflow

- Make frequent, small commits with clear messages
- Create feature branches for new development
- Use pull requests for code review before merging
- Keep the main branch deployable at all times

Following these guidelines will help create a consistent, maintainable codebase that is easy to extend and enhances collaboration among developers.
