import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeStore } from '../services/theme.store';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let mockThemeStore: jest.Mocked<ThemeStore>;

  beforeEach(async () => {
    // Create mock theme store
    mockThemeStore = {
      isDarkMode: jest.fn().mockReturnValue(false),
      toggleTheme: jest.fn(),
      setTheme: jest.fn(),
      initializeTheme: jest.fn(),
      applyThemeToBody: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [
        { provide: ThemeStore, useValue: mockThemeStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct icon and text for light mode', () => {
    mockThemeStore.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('.theme-icon');
    const text = compiled.querySelector('.theme-text');
    
    expect(icon.textContent.trim()).toBe('🌙');
    expect(text.textContent.trim()).toBe('Dark Mode');
  });

  it('should display correct icon and text for dark mode', () => {
    mockThemeStore.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('.theme-icon');
    const text = compiled.querySelector('.theme-text');
    
    expect(icon.textContent.trim()).toBe('☀️');
    expect(text.textContent.trim()).toBe('Light Mode');
  });

  it('should call toggleTheme when button is clicked', () => {
    const button = fixture.nativeElement.querySelector('.theme-toggle-btn');
    
    button.click();
    
    expect(mockThemeStore.toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label for light mode', () => {
    mockThemeStore.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.theme-toggle-btn');
    
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  it('should have correct aria-label for dark mode', () => {
    mockThemeStore.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.theme-toggle-btn');
    
    expect(button.getAttribute('aria-label')).toBe('Switch to light mode');
  });

  it('should call onToggleTheme when button is clicked', () => {
    jest.spyOn(component, 'onToggleTheme');
    
    const button = fixture.nativeElement.querySelector('.theme-toggle-btn');
    button.click();
    
    expect(component.onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
