import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MissionCardComponent } from './mission-card.component';
import { MissionOutline, MissionType, MissionStatus } from '../models/mission-outline.model';

describe('MissionCardComponent', () => {
  let component: MissionCardComponent;
  let fixture: ComponentFixture<MissionCardComponent>;
  let mockRouter: jest.Mocked<Router>;

  const mockMission: MissionOutline = {
    id: 'test-mission-1',
    title: 'Test Mission',
    briefDescription: 'A test mission for unit testing',
    detailedDescription: 'This is a detailed test mission description',
    imageUrl: 'assets/mission/placeholder.png',
    travelTime: 300, // 5 minutes
    challengeRating: 3,
    missionType: MissionType.EXPLORATION,
    status: MissionStatus.AVAILABLE,
    discoveredAt: new Date('2024-01-01')
  };

  beforeEach(async () => {
    const routerSpy = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [MissionCardComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MissionCardComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jest.Mocked<Router>;
    
    component.mission = mockMission;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display mission information correctly', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.querySelector('.mission-title').textContent).toContain('Test Mission');
    expect(compiled.querySelector('.mission-description').textContent).toContain('A test mission for unit testing');
  });

  it('should navigate to mission details when clicked', () => {
    component.onCardClick();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/mission-control/missions', 'test-mission-1']);
  });
  it('should emit scrap event when scrap button is clicked', () => {
    const emitSpy = jest.spyOn(component.scrapMission, 'emit');
    const mockEvent = new Event('click');
    const stopPropagationSpy = jest.spyOn(mockEvent, 'stopPropagation');
    
    component.onScrapMission(mockEvent);
    
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith('test-mission-1');
  });

  it('should format travel time correctly', () => {
    expect(component.formatTravelTime(60)).toBe('1m');
    expect(component.formatTravelTime(30)).toBe('30s');
    expect(component.formatTravelTime(90)).toBe('1m 30s');
  });

  it('should return correct difficulty class and text', () => {
    expect(component.getDifficultyClass(1)).toBe('difficulty-easy');
    expect(component.getDifficultyClass(3)).toBe('difficulty-medium');
    expect(component.getDifficultyClass(4)).toBe('difficulty-hard');
    expect(component.getDifficultyClass(5)).toBe('difficulty-extreme');
    
    expect(component.getDifficultyText(1)).toBe('Easy');
    expect(component.getDifficultyText(3)).toBe('Medium');
    expect(component.getDifficultyText(4)).toBe('Hard');
    expect(component.getDifficultyText(5)).toBe('Extreme');
  });

  it('should return correct mission type icon', () => {
    expect(component.getMissionTypeIcon(MissionType.EXPLORATION)).toBe('🔍');
    expect(component.getMissionTypeIcon(MissionType.MINING)).toBe('⛏️');
    expect(component.getMissionTypeIcon(MissionType.RESCUE)).toBe('🚑');
    expect(component.getMissionTypeIcon(MissionType.COMBAT)).toBe('⚔️');
  });
});
