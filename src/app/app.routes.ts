import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/station/components/station-overview.component').then(m => m.StationOverviewComponent)
  },
  {
    path: 'mission-control',
    loadComponent: () => import('./features/mission-control/components/mission-control.component').then(m => m.MissionControlComponent)
  },
  {
    path: 'combat-simulator',
    loadComponent: () => import('./features/combat-simulator/components/combat-simulator.component').then(m => m.CombatSimulatorComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
