# Development Guidelines

Development standards and best practices for the Nercana Angular project.

## AI Agent Workflow

Follow this systematic approach for any code changes:

1. **Research**: Read README.md, SPECS.md, and related files to understand context and requirements
2. **Analyze**: Examine existing code, tests, and dependencies affected by the change  
3. **Plan**: Design solution following project architecture and identify all impacted files
4. **Implement**: Make focused, consistent changes following the guidelines below
5. **Test**: Add/update tests for new functionality, ensure comprehensive coverage
6. **Validate**: Run all tests (Jest + Playwright) and iterate until passing

## Core Standards

- **Architecture**: Models in `/models/`, business logic in `/services/`, UI in components
- **State**: Use NgRx Signal Store exclusively, keep state immutable
- **TypeScript**: Explicit types everywhere, avoid `any`, use interfaces for contracts
- **Testing**: Jest for units, Playwright for e2e, aim for 80%+ coverage on critical features
- **Styling**: SCSS only (no inline styles), use BEM naming, component-scoped styles

## Angular Specifics

### State Management
- NgRx Signal Store for all state
- Never modify state directly, use store methods
- Access state only through stores, not duplicate service properties

### Components  
- Small, focused components with single responsibilities
- Container/presentational pattern for complex views
- Use `OnPush` change detection when appropriate

### Performance
- Prefer Angular bindings over DOM manipulation
- Unsubscribe observables to prevent memory leaks
- Use `trackBy` with `*ngFor` for better rendering

### Testing
- Mock dependencies with Jest
- Test edge cases and error scenarios  
- Use Angular TestBed sparingly, only for integration tests
- Maintain clean test setup/teardown

Following these guidelines ensures consistent, maintainable code that integrates well with the existing codebase.
