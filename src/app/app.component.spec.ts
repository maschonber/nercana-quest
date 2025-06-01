import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ThemeStore } from './shared/services/theme.store';
import { NavigationService } from './shared/services/navigation.service';
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

// Create a mock NavigationService
const mockNavigationService = {
  currentTitle: signal<string>(''),
  breadcrumbs: signal<{ label: string; route?: string }[]>([]),
  
  setCurrentTitle: jest.fn(),
  clearCurrentTitle: jest.fn(),
  setBreadcrumbs: jest.fn(),
  clearBreadcrumbs: jest.fn()
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
        { provide: NavigationService, useValue: mockNavigationService },
        { provide: ThemeStore, useValue: mockThemeStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should expose currentTitle from navigation service', () => {
    expect(component.currentTitle).toBe(mockNavigationService.currentTitle);
  });

  it('should expose breadcrumbs from navigation service', () => {
    expect(component.breadcrumbs).toBe(mockNavigationService.breadcrumbs);
  });

  it('should initialize theme on startup', () => {
    expect(mockThemeStore.initializeTheme).toHaveBeenCalled();
  });
});
