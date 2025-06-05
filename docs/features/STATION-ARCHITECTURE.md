# Station System Architecture

## Overview

The Station System Architecture implements a modular, navigation-based approach to Nercana Quest's game interface. This design organizes the game's functionality into distinct station subsystems that can be accessed from a central hub (Station Overview). The architecture follows Angular best practices, leveraging modular components, lazy loading, and a consistent user experience.

## Core Components

### Station Overview

The Station Overview serves as the main hub, displaying all available station subsystems in a card-based UI. Each card represents a station subsystem (like Mission Control, Engineering, etc.) with relevant status information and navigation capability.

**Key Features:**
- Card-based navigation to subsystems
- Station status overview with system health metrics
- AI status messages and notifications
- Responsive grid layout

### Mission Control Subsystem

Mission Control is the first implemented subsystem, containing the original quest management functionality. It offers access to the quest log, hero details, and quest actions.

**Key Features:**
- Quest log display
- Hero management and statistics
- Mission actions and deployment
- Breadcrumb navigation back to the station overview

### Navigation System

A central navigation service manages application routing and breadcrumb state, providing a consistent way to navigate between subsystems and back to the main station overview.

**Key Components:**
- `NavigationService` - Manages breadcrumbs and station system definitions
- `BreadcrumbComponent` - Displays current location and enables navigation
- Angular Router configuration - Lazy loads components for optimal performance

## Architecture Benefits

1. **Modularity**: Each station subsystem is self-contained, making development, testing, and maintenance easier
2. **Scalability**: New subsystems can be added without modifying existing code
3. **Performance**: Lazy loading ensures only necessary code is loaded
4. **Consistency**: StandardViewComponent ensures visual consistency across subsystems
5. **Flexibility**: Content projection allows for diverse subsystem interfaces within the same layout

## Navigation Flow

1. User starts at Station Overview (root route: `/`)
2. User clicks on a station subsystem card
3. Router navigates to the specific subsystem route (e.g., `/mission-control`)
4. Subsystem component updates breadcrumbs through NavigationService
5. User can return to Station Overview via breadcrumb navigation

## Extending with New Subsystems

Adding a new subsystem requires:

1. Creating the subsystem component using StandardViewComponent
2. Adding the subsystem definition to NavigationService
3. Adding the route to app.routes.ts
4. Setting appropriate breadcrumbs in the component
