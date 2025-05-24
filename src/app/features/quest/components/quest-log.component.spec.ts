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

  it('should apply appropriate classes to log entries based on success', () => {
    const successEntry = fixture.nativeElement.querySelector('li');
    const failEntry = fixture.nativeElement.querySelectorAll('li')[1];
    
    // Check that the entries exist
    expect(successEntry).toBeTruthy();
    expect(failEntry).toBeTruthy();
    
    // Check classes are applied correctly
    expect(successEntry.classList.contains('success-entry')).toBe(true);
    expect(failEntry.classList.contains('fail-entry')).toBe(true);
    
    // Check content is correct
    expect(successEntry.textContent).toContain('Quest succeeded');
    expect(failEntry.textContent).toContain('Quest failed');
  });

  it('should display timestamps correctly', () => {
    const compiled = fixture.nativeElement;
    const timeElements = compiled.querySelectorAll('.entry-time');
    
    expect(timeElements.length).toBe(mockLogEntries.length);
    // Check that timestamp formatting is present (basic check for bracket format)
    expect(timeElements[0].textContent).toMatch(/\[\d{1,2}:\d{2}\s?(AM|PM)?\]/);
  });

  it('should handle empty log', () => {
    component.log = [];
    fixture.detectChanges();
    
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(0);
    
    const emptyMessage = fixture.nativeElement.querySelector('.empty-log');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.textContent).toContain('No quests completed yet');
  });
  
  it('should show log entry counter when entries exist', () => {
    const counter = fixture.nativeElement.querySelector('.log-counter');
    expect(counter).toBeTruthy();
    expect(counter.textContent).toContain('2 entries');
  });
  
  it('should mark new entries correctly', () => {
    // Simulate a new entry being added
    const newMockEntries = [
      {
        message: 'New quest completed!',
        timestamp: new Date(),
        success: true
      },
      ...mockLogEntries
    ];
    
    component.log = newMockEntries;
    
    // Manually trigger the ngOnChanges lifecycle method
    component.ngOnChanges({
      log: {
        currentValue: newMockEntries,
        previousValue: mockLogEntries,
        firstChange: false,
        isFirstChange: () => false
      }
    });
    
    fixture.detectChanges();
    
    // The isNewEntry method should return true for the first entry
    expect(component.isNewEntry(0)).toBeTruthy();
    expect(component.isNewEntry(1)).toBeFalsy();
  });
});
