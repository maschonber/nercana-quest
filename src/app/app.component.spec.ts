import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ThemeStore } from './shared/services/theme.store';
import { QuestFacadeService } from './features/quest/services/quest-facade.service';
import { LogEntry } from './models/log-entry.model';
import { HeroDetailsComponent } from './features/hero/components/hero-details.component';
import { QuestLogComponent } from './features/quest/components/quest-log.component';
import { signal } from '@angular/core';

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock localStorage for testing
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
});

// Create a mock QuestFacadeService
const mockQuestFacade = {
  questInProgress: signal<boolean>(false),
  log: signal<LogEntry[]>([]),
  recentLogEntries: signal<LogEntry[]>([]),
  hasLogEntries: signal<boolean>(false),

  embarkOnQuest: jest.fn(() => {
    // Update the log signal when called
    const currentLog = mockQuestFacade.log();
    mockQuestFacade.log.set([
      {
        message: 'Quest succeeded! Your hero returns victorious.',
        timestamp: new Date(),
        success: true
      },
      ...currentLog
    ]);
  }),

  addLogEntry: jest.fn(),
  clearLog: jest.fn()
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
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: QuestFacadeService, useValue: mockQuestFacade },
        { provide: ThemeStore, useValue: mockThemeStore }
      ]
    }).compileComponents();

    // Reset the mock log before each test
    mockQuestFacade.log.set([]);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
  it('should expose log from quest facade', () => {
    expect(component.log).toBe(mockQuestFacade.log);
  });

  it('should initialize theme on startup', () => {
    expect(mockThemeStore.initializeTheme).toHaveBeenCalled();
  });
});
