import { Component, AfterContentInit, ContentChild, TemplateRef, ElementRef } from '@angular/core';

@Component({
  selector: 'app-standard-view',
  templateUrl: './standard-view.component.html',
  styleUrls: ['./standard-view.component.scss'],
  standalone: true,
  imports: []
})
export class StandardViewComponent implements AfterContentInit {
  @ContentChild('[slot="main-right"]', { read: ElementRef }) rightSlotContent?: ElementRef;
  
  hasRightContent = false;

  ngAfterContentInit(): void {
    // Check if right slot has any meaningful content
    this.hasRightContent = this.checkHasRightContent();
  }

  private checkHasRightContent(): boolean {
    if (!this.rightSlotContent?.nativeElement) {
      return false;
    }

    const element = this.rightSlotContent.nativeElement;
    
    // Check if element has child nodes with actual content
    const hasChildren = element.children.length > 0;
    
    // Also check for text content (trimmed)
    const hasTextContent = element.textContent?.trim().length > 0;
    
    // Check if the element is not just a placeholder comment or empty div
    const isPlaceholder = element.classList.contains('placeholder') || 
                         element.hasAttribute('data-placeholder') ||
                         (element.children.length === 0 && !hasTextContent);
    
    return (hasChildren || hasTextContent) && !isPlaceholder;
  }
}
