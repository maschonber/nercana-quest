import { Injectable, signal } from '@angular/core';

export interface Breadcrumb {
  label: string;
  route?: string;
}

export interface StationSystem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  isActive: boolean;
  comingSoon?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private _breadcrumbs = signal<Breadcrumb[]>([]);
  private _currentTitle = signal<string>('Nercana Quest');
  
  breadcrumbs = this._breadcrumbs.asReadonly();
  currentTitle = this._currentTitle.asReadonly();

  private _stationSystems: StationSystem[] = [
    {
      id: 'mission-control',
      title: 'Mission Control',
      description: 'Manage quests, deploy clones, and monitor exploration activities',
      icon: '🚀',
      route: '/mission-control',
      isActive: true
    },
    {
      id: 'engineering',
      title: 'Engineering',
      description: 'Repair station systems, upgrade facilities, and manage power',
      icon: '⚙️',
      route: '/engineering',
      isActive: false,
      comingSoon: true
    },
    {
      id: 'medical-bay',
      title: 'Medical Bay',
      description: 'Monitor clone health, treat injuries, and research bio-enhancements',
      icon: '🏥',
      route: '/medical-bay',
      isActive: false,
      comingSoon: true
    },
    {
      id: 'cloning-facility',
      title: 'Cloning Facility',
      description: 'Create new clones, manage templates, and process genetic material',
      icon: '🧬',
      route: '/cloning-facility',
      isActive: false,
      comingSoon: true
    },
    {
      id: 'simulator',
      title: 'Combat Simulator',
      description: 'Train clones, test strategies, and prepare for missions',
      icon: '🛡️',
      route: '/simulator',
      isActive: true
    },
    {
      id: 'research-lab',
      title: 'Research Lab',
      description: 'Develop new technologies, analyze artifacts, and upgrade systems',
      icon: '🔬',
      route: '/research-lab',
      isActive: false,
      comingSoon: true
    }
  ];

  getStationSystems(): StationSystem[] {
    return this._stationSystems;
  }

  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    this._breadcrumbs.set(breadcrumbs);
  }

  clearBreadcrumbs(): void {
    this._breadcrumbs.set([]);
  }

  setCurrentTitle(title: string): void {
    this._currentTitle.set(title);
  }

  clearCurrentTitle(): void {
    this._currentTitle.set('Nercana Quest');
  }
}
