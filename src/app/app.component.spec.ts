import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { QuestStore } from './shared/services/quest.store';
import { ThemeStore } from './shared/services/theme.store';
import { LogEntry } from './models/log-entry.model';
import { Hero } from './features/hero/models/hero.model';
import { HeroDetailsComponent } from './features/hero/components/hero-details.component';
import { QuestLogComponent } from './features/quest/components/quest-log.component';
import { signal } from '@angular/core';

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage for testing
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
});

// Create a mock QuestStore
const mockQuestStore = {  // Mock the hero and log signals
  hero: signal<Hero>({
    name: 'Adventurer',
    health: 100,
    attack: 12,
    defense: 8,
    luck: 5,
    level: 1,
    experience: 0,
    gold: 0
  }),
  
  log: signal<LogEntry[]>([]),
  
  // Mock the embarkOnQuest method
  embarkOnQuest: jest.fn(() => {
    // Update the log signal when called
    const currentLog = mockQuestStore.log();
    mockQuestStore.log.set([
      {
        message: 'Quest succeeded! Your hero returns victorious.',
        timestamp: new Date(),
        success: true
      },
      ...currentLog
    ]);
  })
};

// Create a mock ThemeStore
const mockThemeStore = {
  isDarkMode: signal<boolean>(false),
  theme: signal<'light' | 'dark'>('light'),
  
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
  initializeTheme: jest.fn(),
  applyTheme: jest.fn()
};

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: QuestStore, useValue: mockQuestStore },
        { provide: ThemeStore, useValue: mockThemeStore }
      ]
    }).compileComponents();

    // Reset the mock log before each test
    mockQuestStore.log.set([]);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
  it('should have a hero with correct default stats', () => {
    expect(component.hero()).toEqual({
      name: 'Adventurer',
      health: 100,
      attack: 12,
      defense: 8,
      luck: 5,
      level: 1,
      experience: 0,
      gold: 0
    });
  });

  it('should add a log entry when embarking on a quest', () => {
    // Initial log should be empty
    expect(component.log().length).toBe(0);
    
    // Call embarkOnQuest
    component.embarkOnQuest();
    
    // Check if the quest store method was called
    expect(mockQuestStore.embarkOnQuest).toHaveBeenCalled();
    
    // Verify log has an entry
    expect(component.log().length).toBe(1);
    expect(component.log()[0].message).toMatch(/Quest succeeded/);
  });
});
