import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-breadcrumb',  template: `
    @if (breadcrumbs().length > 0) {
      <nav class="breadcrumb">
        <ol class="breadcrumb-list">
          @for (breadcrumb of breadcrumbs(); track breadcrumb.label; let isLast = $last) {
            <li class="breadcrumb-item">
              @if (breadcrumb.route && !isLast) {
                <button 
                  class="breadcrumb-link" 
                  (click)="navigate(breadcrumb.route)"
                  type="button">
                  {{ breadcrumb.label }}
                </button>
              } @else {
                <span class="breadcrumb-current">{{ breadcrumb.label }}</span>
              }
              @if (!isLast) {
                <span class="breadcrumb-separator">›</span>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
  styles: [`
    .breadcrumb {
      margin-bottom: 1rem;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.5rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-link {
      background: none;
      border: none;
      color: var(--accent-primary);
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .breadcrumb-link:hover {
      color: var(--accent-primary-hover);
      text-decoration: underline;
    }

    .breadcrumb-current {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .breadcrumb-separator {
      color: var(--text-tertiary);
      font-size: 0.875rem;
      user-select: none;
    }
  `],
  standalone: true
})
export class BreadcrumbComponent {
  private readonly navigationService = inject(NavigationService);
  private readonly router = inject(Router);

  breadcrumbs = this.navigationService.breadcrumbs;

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
