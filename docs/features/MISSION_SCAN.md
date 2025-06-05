# Mission Scan Feature Specification

## Overview

The Mission Scan feature represents a major evolution of the Mission Control system, transforming it from a continuous quest log interface to a strategic mission selection interface. This change shifts the focus from reactive quest tracking to proactive mission planning and selection.

## Current vs. New Architecture

### Current Implementation
- **Quest Log Display**: Shows completed quest history in chronological order
- **Single Action**: "Deploy on mission" button that immediately starts a randomized quest
- **No Mission Selection**: Players have no choice in mission type or objectives
- **Immediate Execution**: Quests start instantly without preview or preparation

### New Mission Scan Architecture
- **Mission Control Overview**: Card-based grid for scanning and viewing available missions
- **Mission Details View**: Separate route showing detailed mission information
- **Mission Outlines**: Simplified mission templates with basic information
- **Strategic Planning**: Players scan, review, and navigate to missions before deployment
- **Deployment Preparation**: Deploy action available in mission details view (future feature)

## Feature Requirements

### 1. Mission Control Overview Interface

**Replace the current quest log with a mission overview interface:**
- **Layout**: Responsive card grid (2-3 columns on desktop, 1-2 on mobile)
- **Initial State**: Empty grid with explanatory message and prominent scan button
- **Card Design**: Clean, modern cards showing mission outlines
- **Navigation**: Click mission card navigates to mission details route
- **Accessibility**: Proper ARIA labels, keyboard navigation support

### 2. Mission Details View

**Separate route showing detailed mission information:**
- **Route**: `/mission-control/missions/:missionId`
- **Layout**: StandardView with mission details as main content
- **Mission Brief**: Expanded description and objectives (simplified dummy content)
- **Mission Parameters**: Travel time, difficulty rating, basic information
- **Deployment Action**: "Deploy Clones" button (functionality for future development)
- **Navigation**: Back to Mission Control Overview via breadcrumbs

### 3. Mission Scan Functionality

**Scan button creates new mission outlines:**
- **Button Location**: Prominent position in mission control overview interface
- **Button Text**: "Deep Space Scan"
- **Action**: Generates and adds a new mission outline to the grid
- **Feedback**: Loading state during scan process (500-1000ms)
- **Limit**: Maximum number of active missions (8 missions)

### 4. Mission Card Content

**Each mission card displays summary information:**

#### Visual Elements
- **Mission Image**: Use `assets/mission/placeholder.png` initially
- **Mission Type Icon**: Visual indicator of mission category
- **Status Badge**: Available, In Progress (future), Completed (future)
- **Navigation Indicator**: Visual cue that card is clickable/navigates

#### Mission Summary
- **Title**: Simple procedurally generated mission name
  - Examples: "Deep Space Patrol", "Asteroid Survey", "Station Check"
- **Travel Time**: Simple time display (in minutes and seconds)
  - Example: "Travel Time: 5m 30s"
- **Brief Description**: 1 sentence mission summary (static dummy content)
- **Difficulty Indicator**: Simple visual difficulty rating (Easy/Medium/Hard)
- **Resource Indicator**: Simple icon showing mission involves resources

#### Mission Outline Data Structure
```typescript
interface MissionOutline {
  id: string;
  title: string;
  briefDescription: string;
  detailedDescription: string;
  imageUrl: string;
  travelTime: number; // in seconds
  challengeRating: number; // will be calculated based on encounters
  missionType: 'exploration' | 'mining' | 'rescue' | 'combat'; // Example mission types, create enum
  status: 'available' | 'in-progress' | 'completed'; // use enum
  discoveredAt: Date;

}
```

### 5. Navigation & Routing

**Multi-view navigation flow:**
- **Mission Control Overview**: `/mission-control` - Main grid showing all available missions
- **Mission Details**: `/mission-control/missions/:missionId` - Detailed mission view
- **Navigation Actions**: Click mission card navigates to details route
- **Breadcrumb Navigation**: "Station Overview > Mission Control > [Mission Name]"
- **Action Separation**: Scan button in overview, Deploy button in details

## Technical Implementation Plan

### Phase 1: Mission Control Infrastructure
1. **Mission Outline Models**
   - `mission-control/models/mission-outline.model.ts`
   - Simple `MissionOutline` interface
   - Basic mission generation templates with static dummy data

2. **Mission Store**
   - `mission-control/stores/mission.store.ts`
   - `MissionStore` using NgRx signals
   - Available mission tracking (no selection state needed)
   - No integration with quest system (kept separate)

3. **Mission Service**
   - `mission-control/services/mission.service.ts`
   - `MissionService` for mission outline generation
   - Simple procedural mission creation with dummy content
   - Mission state management and persistence

### Phase 2: UI Components & Routing
1. **Mission Control Overview Component**
   - `mission-control/components/mission-control-overview.component.ts`
   - Replace current quest log in mission-control layout
   - Mission card grid with responsive design
   - Scan button and empty state handling

2. **Mission Card Component**
   - `mission-control/components/mission-card.component.ts`
   - Input properties for mission outline display
   - Click navigation to mission details route
   - Hover/focus states and accessibility

3. **Mission Details Component**
   - `mission-control/components/mission-details.component.ts`
   - Separate route component for detailed mission view
   - StandardView layout with mission information
   - Deploy button (disabled, for future development)

4. **Routing Updates**
   - Update app routing for mission details subroute
   - Breadcrumb navigation updates
   - Route parameter handling for mission ID

### Phase 3: Integration & Polish
1. **Mission Control Layout Updates**
   - Update existing mission-control component to use overview
   - Maintain existing navigation and breadcrumbs for overview
   - Ensure clean routing between overview and details

2. **UI Polish & States**
   - Loading states during mission scanning
   - Navigation transitions and feedback
   - Error handling for scan failures
   - Responsive design refinements

## Design Considerations

### User Experience
- **Discoverability**: Clear instructions for new players
- **Information Hierarchy**: Important details prominently displayed
- **Visual Consistency**: Matches existing game aesthetic
- **Performance**: Smooth animations and responsive interactions

### Future Extensibility
- **Mission Types**: Framework for different mission categories and templates
- **Dynamic Content**: System ready for server-generated mission outlines
- **Mission Modifiers**: Support for special conditions or environmental factors
- **Prerequisites**: Framework for locked missions requiring station progression
- **Deployment System**: Ready for clone deployment and mission execution integration

## Questions & Considerations

### Critical Questions for Stakeholders

1. **Mission Persistence**: Should mission outlines remain available permanently, or expire after a certain time?
    - Answer: Mission outlines should remain available until manually cleared.

2. **Mission Outline Complexity**: How detailed should mission challenges be in the preview vs. left to execution?
    - Answer: Mission outlines should provide a brief overview of challenges, but detailed execution mechanics will be handled in the future deployment system.

3. **Resource Preview Granularity**: Should missions show specific resource types only, or also hint at quantity ranges?
    - Answer: Missions should show specific resource types and hint at quantity ranges (little to high amount)

4. **Concurrent Mission Limits**: How many missions should players be able to scan and keep available?
    - Answer: Players should be able to scan and keep a maximum of 8 concurrent missions.

5. **Mission Refresh**: Should players be able to clear/refresh available missions, or only add new ones?
    - Answer: Players should be able to scrap existing missions to make room for new ones, if they have not started them yet.

6. **Selection Persistence**: Should selected mission state persist across browser sessions?
    - Answer: No, persistency will be added at a later stage.

### Technical Concerns

1. **Mission Outline Storage**: How to structure mission outline data for optimal performance and extensibility?
    - Answer: Keep it simple with a basic interface for now, allowing for future expansion. Use NgRx signals for state management.

2. **State Management**: Keeping mission control state separate from quest system while maintaining clean architecture?
    - Answer: Do not care about quest system state, mission control is self-contained. Quest system will be deprecated in the future.

3. **Component Architecture**: Best practices for StandardView sidebar integration with mission details?
    - Answer: The sidebar will later be used for deployment details. Keep minimal for now.

4. **Testing Strategy**: How to test mission generation and selection flows without quest system integration?
    - Answer: Keep simple for now, focus on UI interactions. Mission generation will be part of separate feature.

## Conclusion

The Mission Scan feature creates a strategic planning layer for mission control. Players gain mission selection and preview capabilities (independent of old quest system).

The mission-control feature becomes a self-contained mission planning interface with clear separation of concerns. The StandardView integration provides intuitive navigation between mission scanning overview and detailed mission information.

The phased implementation focuses first on core infrastructure (models, store, service) then builds UI components, ensuring solid foundations before user-facing features. The mission outline approach provides flexibility for future deployment and execution systems.
