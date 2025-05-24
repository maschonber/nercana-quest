import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestLogComponent } from './quest-log.component';
import { LogEntry } from '../../../models/log-entry.model';

describe('QuestLogComponent', () => {
  let component: QuestLogComponent;
  let fixture: ComponentFixture<QuestLogComponent>;

  const mockLogEntries: LogEntry[] = [
    {
      message: 'Quest succeeded! Your hero returns victorious.',
      timestamp: new Date('2024-01-01T12:00:00'),
      success: true
    },
    {
      message: 'Quest failed. Your hero barely escapes!',
      timestamp: new Date('2024-01-01T11:30:00'),
      success: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestLogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestLogComponent);
    component = fixture.componentInstance;
    component.log = mockLogEntries;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display log entries correctly', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.textContent).toContain('Quest succeeded');
    expect(compiled.textContent).toContain('Quest failed');
  });

  it('should apply success class to successful quest entries', () => {
    const successSpan = fixture.nativeElement.querySelector('.success');
    expect(successSpan).toBeTruthy();
    expect(successSpan.textContent).toContain('Quest succeeded');
  });

  it('should apply fail class to failed quest entries', () => {
    const failSpan = fixture.nativeElement.querySelector('.fail');
    expect(failSpan).toBeTruthy();
    expect(failSpan.textContent).toContain('Quest failed');
  });

  it('should display timestamps correctly', () => {
    const compiled = fixture.nativeElement;
    // Check that timestamp formatting is present (basic check for bracket format)
    expect(compiled.textContent).toMatch(/\[\d{1,2}:\d{2}\s?(AM|PM)?\]/);
  });

  it('should handle empty log', () => {
    component.log = [];
    fixture.detectChanges();
    
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(0);
  });
});
