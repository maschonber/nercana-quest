# Nercana

Nercana is an automated quest-based roleplaying game with progression mechanics.

## Game Overview

Players control a hero character with various stats who embarks on quests. The gameplay is automated, with quest outcomes determined by the hero's stats, level, and random chance. The hero gains experience and gold from completing quests, allowing for character progression through a leveling system.

## Core Features

### Hero Progression System

- **Experience Points (XP)**: Hero gains experience from quests (more for success, less for failure)
- **Leveling System**: Experience translates to levels using a scaling formula: `level = 1 + sqrt(experience / 50)`
- **Stat Growth**: Each level up increases hero stats (Health +5, Attack +2, Defense +2, Luck +1)
- **Gold Economy**: Successful quests reward gold based on hero level and luck

### Main View

The main view consists of two primary sections:

1. **Hero Details (Left Side)**
   - Displays the hero's name and basic stats (health, attack, defense, luck)
   - Shows level, experience, and gold information
   - Experience progress bar tracking advancement to next level
   - Contains the "Embark on quest" button
   - Shows calculated Combat Readiness (power level)

2. **Quest Log (Right Side)**
   - Shows a chronological record of quest attempts
   - Displays at least 12-15 entries with a scrollable interface
   - New entries are added at the top when the player embarks on a quest
   - Each entry shows whether the quest succeeded or failed based on outcome
   - Each entry includes a timestamp and colored indicators for success/failure
   - Visual icons indicate different quest step types (exploration, encounter, treasure)
   - Quest success rates are influenced by the hero's stats
   - Shows entry count in the header

### Quest System

Quests are dynamic adventures that unfold through multiple steps:

- **Multi-Step Design**: Each quest consists of 2-5 sequential steps
- **Step Types**:
  - **Exploration**: Narrative-focused steps that provide world context without affecting gameplay
  - **Encounter**: Combat-based steps where the hero confronts enemies (future: stat checks in combat)
  - **Treasure**: Reward steps where the hero finds gold or items
- **Step Timing**: Each step takes 200ms to complete, creating a progressive adventure experience
- **Step Display**: Each step appears as a separate log entry with appropriate visual styling
- **Reward Distribution**: Experience is gained primarily from encounters, gold from treasure steps

## Design Specifications

The application uses a clean, modern UI design with a light color scheme:

- Light color palette with soft blues (#f5f7fa background, #1a73e8 accents)
- Modern Inter and Poppins font families
- Card-based layout with subtle shadows and rounded corners
- Clean, readable interface with proper spacing
- Responsive layout that adapts to various screen sizes
- Scrollable components with custom scrollbar styling
- Visual feedback for quest outcomes (green for success, red for failures)
- Progress indicators for character advancement
- **No gradients**: All UI elements use solid colors instead of gradients for a clean, uncluttered appearance

## Technical Implementation

- Angular Single Page Application with standalone components
- NgRx Signal Store for state management
- Immutable state updates
- Comprehensive test coverage (Jest for unit tests, Playwright for E2E)
- Responsive design with mobile and desktop layouts
- TypeScript interfaces for strong typing
