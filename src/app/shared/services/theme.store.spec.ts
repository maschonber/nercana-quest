import { TestBed } from '@angular/core/testing';
import { ThemeStore } from './theme.store';

describe('ThemeStore', () => {
  let store: InstanceType<typeof ThemeStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeStore]
    });
    store = TestBed.inject(ThemeStore);

    // Clear localStorage before each test
    localStorage.clear();

    // Reset document body classes
    document.body.className = '';
  });

  afterEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with light mode by default', () => {
    expect(store.isDarkMode()).toBe(false);
  });

  it('should toggle theme from light to dark', () => {
    store.toggleTheme();

    expect(store.isDarkMode()).toBe(true);
    expect(localStorage.getItem('nercana-theme')).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('should toggle theme from dark to light', () => {
    // Set to dark first
    store.setTheme(true);

    // Then toggle back to light
    store.toggleTheme();

    expect(store.isDarkMode()).toBe(false);
    expect(localStorage.getItem('nercana-theme')).toBe('light');
    expect(document.body.classList.contains('light-theme')).toBe(true);
  });

  it('should set theme to dark mode', () => {
    store.setTheme(true);

    expect(store.isDarkMode()).toBe(true);
    expect(localStorage.getItem('nercana-theme')).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('should set theme to light mode', () => {
    store.setTheme(false);

    expect(store.isDarkMode()).toBe(false);
    expect(localStorage.getItem('nercana-theme')).toBe('light');
    expect(document.body.classList.contains('light-theme')).toBe(true);
  });

  it('should initialize theme from localStorage when saved preference exists', () => {
    localStorage.setItem('nercana-theme', 'dark');

    store.initializeTheme();

    expect(store.isDarkMode()).toBe(true);
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('should initialize theme from localStorage when light preference exists', () => {
    localStorage.setItem('nercana-theme', 'light');

    store.initializeTheme();

    expect(store.isDarkMode()).toBe(false);
    expect(document.body.classList.contains('light-theme')).toBe(true);
  });

  it('should initialize theme from system preference when no saved preference', () => {
    // Mock window.matchMedia
    const mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });

    store.initializeTheme();

    expect(store.isDarkMode()).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('should apply correct body classes for dark theme', () => {
    store.setTheme(true);

    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(document.body.classList.contains('light-theme')).toBe(false);
  });

  it('should apply correct body classes for light theme', () => {
    store.setTheme(false);

    expect(document.body.classList.contains('light-theme')).toBe(true);
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('should persist theme preference to localStorage', () => {
    store.setTheme(true);
    expect(localStorage.getItem('nercana-theme')).toBe('dark');

    store.setTheme(false);
    expect(localStorage.getItem('nercana-theme')).toBe('light');
  });
});
