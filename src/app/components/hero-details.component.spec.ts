import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroDetailsComponent } from './hero-details.component';
import { Hero } from '../models/hero.model';

describe('HeroDetailsComponent', () => {
  let component: HeroDetailsComponent;
  let fixture: ComponentFixture<HeroDetailsComponent>;

  const mockHero: Hero = {
    name: 'Test Hero',
    health: 100,
    attack: 15,
    defense: 10,
    luck: 7
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroDetailsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroDetailsComponent);
    component = fixture.componentInstance;
    component.hero = mockHero;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero stats correctly', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.textContent).toContain('Test Hero');
    expect(compiled.textContent).toContain('100');
    expect(compiled.textContent).toContain('15');
    expect(compiled.textContent).toContain('10');
    expect(compiled.textContent).toContain('7');
  });
  it('should emit embarkOnQuest event when button is clicked', () => {
    jest.spyOn(component.embarkOnQuest, 'emit');
    
    const button = fixture.nativeElement.querySelector('.quest-btn');
    button.click();
    
    expect(component.embarkOnQuest.emit).toHaveBeenCalled();
  });

  it('should have correct button text', () => {
    const button = fixture.nativeElement.querySelector('.quest-btn');
    expect(button.textContent.trim()).toBe('Embark on quest');
  });
});
