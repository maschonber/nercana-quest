import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { HeroActionsComponent } from './hero-actions.component';
import { HeroFacadeService } from '../services/hero-facade.service';
import { QuestFacadeService } from '../../quest/services/quest-facade.service';

describe('HeroActionsComponent', () => {
  let component: HeroActionsComponent;
  let fixture: ComponentFixture<HeroActionsComponent>;
  let mockHeroFacade: jest.Mocked<HeroFacadeService>;
  let mockQuestFacade: jest.Mocked<QuestFacadeService>;
  let isHeroReadySignal: WritableSignal<boolean>;
  let questInProgressSignal: WritableSignal<boolean>;  beforeEach(async () => {
    // Create writable signal mocks
    isHeroReadySignal = signal(true);
    questInProgressSignal = signal(false);

    // Create mock facades with writable signals
    mockHeroFacade = {
      isHeroReady: isHeroReadySignal,
    } as any;

    mockQuestFacade = {
      questInProgress: questInProgressSignal,
      embarkOnQuest: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [HeroActionsComponent],
      providers: [
        { provide: HeroFacadeService, useValue: mockHeroFacade },
        { provide: QuestFacadeService, useValue: mockQuestFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });  it('should enable quest button when hero is ready and no quest in progress', () => {
    isHeroReadySignal.set(true);
    questInProgressSignal.set(false);
    fixture.detectChanges();

    expect(component.canStartQuest()).toBe(true);
    expect(component.buttonText()).toBe('Deploy on mission');
  });
  it('should disable quest button when hero is not ready', () => {
    isHeroReadySignal.set(false);
    questInProgressSignal.set(false);
    fixture.detectChanges();

    expect(component.canStartQuest()).toBe(false);
    expect(component.buttonText()).toBe('Clone expired');
  });
  it('should disable quest button when quest is in progress', () => {
    isHeroReadySignal.set(true);
    questInProgressSignal.set(true);
    fixture.detectChanges();

    expect(component.canStartQuest()).toBe(false);
    expect(component.buttonText()).toBe('Mission in progress...');
  });

  it('should call questFacade.embarkOnQuest when button is clicked and quest can start', () => {
    isHeroReadySignal.set(true);
    questInProgressSignal.set(false);
    fixture.detectChanges();

    component.onEmbarkOnQuest();

    expect(mockQuestFacade.embarkOnQuest).toHaveBeenCalled();
  });

  it('should not call questFacade.embarkOnQuest when button is clicked but quest cannot start', () => {
    isHeroReadySignal.set(false);
    questInProgressSignal.set(false);
    fixture.detectChanges();

    component.onEmbarkOnQuest();

    expect(mockQuestFacade.embarkOnQuest).not.toHaveBeenCalled();
  });
  it('should display correct button text based on state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.quest-btn');

    // Hero ready, no quest in progress
    isHeroReadySignal.set(true);
    questInProgressSignal.set(false);
    fixture.detectChanges();
    expect(button?.textContent?.trim()).toBe('Deploy on mission');

    // Hero not ready
    isHeroReadySignal.set(false);
    questInProgressSignal.set(false);
    fixture.detectChanges();
    expect(button?.textContent?.trim()).toBe('Clone expired');

    // Quest in progress
    isHeroReadySignal.set(true);
    questInProgressSignal.set(true);
    fixture.detectChanges();
    expect(button?.textContent?.trim()).toBe('Mission in progress...');
  });

  it('should add quest-in-progress class when quest is in progress', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.quest-btn');

    questInProgressSignal.set(true);
    fixture.detectChanges();

    expect(button?.classList.contains('quest-in-progress')).toBe(true);
  });
});
