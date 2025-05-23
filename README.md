# Nercana

Nercana is an auto battling text-based roleplaying game.

> **Note**: This README provides a high-level overview of the project. For more details, see:
> - [SPECS.md](./docs/SPECS.md) - Detailed specifications of the game features and design
> - [GUIDELINES.md](./docs/GUIDELINES.md) - Development guidelines and best practices
> - [TESTING.md](./docs/TESTING.md) - Jest testing guide and best practices

## Project Overview

This project implements a fantasy-themed auto-battling game where players control a hero who embarks on quests with randomized outcomes based on their stats.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
npm install
```

### Development Server

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`.

## Project Structure

- `src/app/models/` - Data models and interfaces
- `src/app/services/` - Business logic and state management
- `src/app/` - Components and application code

## Testing

### Unit Testing

Nercana uses Jest for unit testing.

```bash
# Run all tests
npm test
```

### End-to-End Testing with Playwright

Nercana uses Playwright for end-to-end testing and MCP (Model Context Protocol) integration.

```bash
# Run Playwright tests
npm run playwright:test

# Open interactive UI for Playwright tests
npm run playwright:ui

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

The test coverage report will be generated in the `coverage` directory.

### End-to-End Testing with Playwright

The project uses Playwright for end-to-end testing.

```bash
# Install Playwright browsers
node scripts/install-browsers.js

# Run Playwright tests
npm run playwright:test

# Run tests with UI mode
npm run playwright:ui

# View Playwright test report
npm run playwright:report

# Generate Playwright test code
npm run playwright:codegen
```

## Building for Production

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
