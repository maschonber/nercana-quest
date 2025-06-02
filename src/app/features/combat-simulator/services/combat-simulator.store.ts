import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { 
  SimulationConfig, 
  SimulationResults, 
  SimulationStatus, 
  TemplateHero, 
  MonsterSelection 
} from '../models/simulation.model';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../../quest/models/monster.model';

interface SimulationState {
  status: SimulationStatus;
  selectedHeroes: Array<{ template: TemplateHero; level: number }>;
  selectedMonsters: MonsterSelection[];
  runCount: number;
  currentResults: SimulationResults | null;
  isRunning: boolean;
  progress: number; // 0-100
  errors: string[];
}

const initialState: SimulationState = {
  status: SimulationStatus.IDLE,
  selectedHeroes: [],
  selectedMonsters: [],
  runCount: 10,
  currentResults: null,
  isRunning: false,
  progress: 0,
  errors: []
};

export const CombatSimulatorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ selectedHeroes, selectedMonsters, runCount, errors }) => ({
    canStartSimulation: computed(() => 
      selectedHeroes().length > 0 && 
      selectedHeroes().length <= 3 &&
      selectedMonsters().length > 0 && 
      selectedMonsters().length <= 3 &&
      runCount() > 0 && 
      runCount() <= 100 &&
      errors().length === 0
    ),
    heroTeamSize: computed(() => selectedHeroes().length),
    enemyTeamSize: computed(() => selectedMonsters().length),
    isTeamConfigurationValid: computed(() => 
      selectedHeroes().length > 0 && selectedMonsters().length > 0
    )
  })),
  withMethods((store) => ({
    setStatus(status: SimulationStatus) {
      patchState(store, { status });
    },

    addHero(template: TemplateHero, level: number = 1) {
      const current = store.selectedHeroes();
      if (current.length >= 3) {
        patchState(store, { 
          errors: ['Maximum 3 heroes allowed'] 
        });
        return;
      }

      patchState(store, { 
        selectedHeroes: [...current, { template, level }],
        errors: []
      });
    },

    removeHero(index: number) {
      const current = store.selectedHeroes();
      const updated = current.filter((_, i) => i !== index);
      patchState(store, { 
        selectedHeroes: updated,
        errors: []
      });
    },

    updateHeroLevel(index: number, level: number) {
      const current = store.selectedHeroes();
      if (index >= 0 && index < current.length) {
        const updated = [...current];
        updated[index] = { ...updated[index], level };
        patchState(store, { 
          selectedHeroes: updated,
          errors: []
        });
      }
    },

    addMonster(selection: MonsterSelection) {
      const current = store.selectedMonsters();
      if (current.length >= 3) {
        patchState(store, { 
          errors: ['Maximum 3 monsters allowed'] 
        });
        return;
      }

      patchState(store, { 
        selectedMonsters: [...current, selection],
        errors: []
      });
    },

    removeMonster(index: number) {
      const current = store.selectedMonsters();
      const updated = current.filter((_, i) => i !== index);
      patchState(store, { 
        selectedMonsters: updated,
        errors: []
      });
    },

    setRunCount(count: number) {
      if (count < 1 || count > 100) {
        patchState(store, { 
          errors: ['Run count must be between 1 and 100'] 
        });
        return;
      }

      patchState(store, { 
        runCount: count,
        errors: []
      });
    },

    setIsRunning(isRunning: boolean) {
      patchState(store, { isRunning });
    },

    setProgress(progress: number) {
      patchState(store, { progress: Math.max(0, Math.min(100, progress)) });
    },

    setResults(results: SimulationResults) {
      patchState(store, { 
        currentResults: results,
        status: SimulationStatus.COMPLETED,
        isRunning: false,
        progress: 100
      });
    },

    setError(error: string) {
      patchState(store, { 
        errors: [error],
        status: SimulationStatus.ERROR,
        isRunning: false
      });
    },

    clearErrors() {
      patchState(store, { errors: [] });
    },

    reset() {
      patchState(store, initialState);
    },

    resetConfiguration() {
      patchState(store, { 
        selectedHeroes: [],
        selectedMonsters: [],
        runCount: 10,
        errors: []
      });
    }
  }))
);
