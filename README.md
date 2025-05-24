# Nercana

Nercana is an auto battling text-based roleplaying game.

> **Note**: This README provides a high-level overview of the project. For more details, see:
> - [SPECS.md](./docs/SPECS.md) - Detailed specifications of the game features and design
> - [GUIDELINES.md](./docs/GUIDELINES.md) - Development guidelines and best practices
> - [TESTING.md](./docs/TESTING.md) - Jest testing guide and best practices

## Project Overview

This project implements a fantasy-themed auto-battling game where players control a hero who embarks on quests with randomized outcomes based on their stats.

The application is hosted on github under https://github.com/maschonber/nercana-quest

## Features

### Multi-Step Quest System

Quests consist of 2-5 sequential steps that unfold as short adventures:

- **Exploration Steps**: Narrative discovery moments that set the scene without mechanical impact
- **Encounter Steps**: Combat-focused events where the hero's stats are checked (future: detailed combat)
- **Treasure Steps**: Reward moments where the hero gains gold

Each step takes a short time (200ms) to complete and appears as a separate log entry, creating a more immersive questing experience.

### Dark Mode Support

The application features a comprehensive dark mode theme system:

- **Theme Toggle**: Click the theme toggle button in the header to switch between light and dark modes
- **Automatic Detection**: On first visit, the app detects your system preference (light/dark)
- **Persistent Preference**: Your theme choice is saved to localStorage and restored on future visits
- **Smooth Transitions**: All UI elements transition smoothly between themes with CSS animations
- **Accessibility**: Proper contrast ratios and focus states are maintained in both themes

The dark mode uses a carefully designed color palette that reduces eye strain while maintaining excellent readability and visual hierarchy.

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

The usual development environment is on Windows, using Powershell. So to start a script, commands can and should be chained like this:

```bash
cd d:\workspace\vscode\nercana; npm test
cd d:\workspace\vscode\nercana; ng serve
```

Navigate to `http://localhost:4200/`.

## Building for Production

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
