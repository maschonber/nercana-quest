import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroDetailsComponent } from './hero-details.component';
import { Hero } from '../models/hero.model';
import { HeroFacadeService } from '../services/hero-facade.service';
import { signal } from '@angular/core';

describe('HeroDetailsComponent', () => {
  let component: HeroDetailsComponent;
  let fixture: ComponentFixture<HeroDetailsComponent>;
  const mockHero: Hero = {
    name: 'Test Hero',
    health: 100,
    attack: 15,
    defense: 10,
    luck: 7,
    level: 1,
    experience: 0,
    gold: 0
  };

  // Create a mock HeroFacadeService
  const mockHeroFacade = {
    hero: signal<Hero>(mockHero),
    heroPower: signal<number>(25), // attack + defense
    experienceToNextLevel: signal<number>(100),
    experienceProgress: signal<number>(0),
    gainExperience: jest.fn(),
    gainGold: jest.fn(),
    takeDamage: jest.fn(),
    heal: jest.fn(),
    levelUp: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroDetailsComponent],
      providers: [
        { provide: HeroFacadeService, useValue: mockHeroFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroDetailsComponent);
    component = fixture.componentInstance;
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

  it('should display hero power correctly', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('25'); // heroPower value
  });

  it('should display experience progress correctly', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('0 / 100 XP'); // experience and next level
  });
});
