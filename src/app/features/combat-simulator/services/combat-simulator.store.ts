import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { 
  SimulationConfig, 
  SimulationResults, 
  SimulationStatus, 
  TemplateHero, 
  MonsterSelection,
  TEMPLATE_HEROES 
} from '../models/simulation.model';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../../quest/models/monster.model';

interface SimulationState {
  status: SimulationStatus;
  selectedHeroes: Array<{ template: TemplateHero; level: number }>;
  heroConfigs: Array<{ template: TemplateHero; level: number; enabled: boolean }>;
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
  heroConfigs: TEMPLATE_HEROES.map(template => ({
    template,
    level: 1,
    enabled: false
  })),
  selectedMonsters: [],
  runCount: 10,
  currentResults: null,
  isRunning: false,
  progress: 0,
  errors: []
};

export const CombatSimulatorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),  withComputed(({ selectedHeroes, selectedMonsters, runCount, errors, heroConfigs }) => ({
    canStartSimulation: computed(() => {
      const enabledHeroes = heroConfigs().filter(config => config.enabled);
      return enabledHeroes.length > 0 && 
        enabledHeroes.length <= 3 &&
        selectedMonsters().length > 0 && 
        selectedMonsters().length <= 3 &&
        runCount() > 0 && 
        runCount() <= 100 &&
        errors().length === 0;
    }),
    heroTeamSize: computed(() => heroConfigs().filter(config => config.enabled).length),
    enemyTeamSize: computed(() => selectedMonsters().length),
    isTeamConfigurationValid: computed(() => {
      const enabledHeroes = heroConfigs().filter(config => config.enabled);
      return enabledHeroes.length > 0 && selectedMonsters().length > 0;
    }),
    enabledHeroes: computed(() => heroConfigs().filter(config => config.enabled))
  })),
  withMethods((store) => ({
    setStatus(status: SimulationStatus) {
      patchState(store, { status });
    },    toggleHero(heroIndex: number) {
      const current = store.heroConfigs();
      if (heroIndex >= 0 && heroIndex < current.length) {
        const updated = [...current];
        const enabledCount = current.filter(config => config.enabled).length;
        
        // If trying to enable and already at max, show error
        if (!updated[heroIndex].enabled && enabledCount >= 3) {
          patchState(store, { 
            errors: ['Maximum 3 heroes allowed'] 
          });
          return;
        }
        
        updated[heroIndex] = { ...updated[heroIndex], enabled: !updated[heroIndex].enabled };
        
        // Update selectedHeroes for compatibility with existing code
        const selectedHeroes = updated
          .filter(config => config.enabled)
          .map(config => ({ template: config.template, level: config.level }));
        
        patchState(store, { 
          heroConfigs: updated,
          selectedHeroes,
          errors: []
        });
      }
    },

    updateHeroLevel(heroIndex: number, level: number) {
      const current = store.heroConfigs();
      if (heroIndex >= 0 && heroIndex < current.length) {
        const updated = [...current];
        updated[heroIndex] = { ...updated[heroIndex], level };
        
        // Update selectedHeroes for compatibility with existing code
        const selectedHeroes = updated
          .filter(config => config.enabled)
          .map(config => ({ template: config.template, level: config.level }));
        
        patchState(store, { 
          heroConfigs: updated,
          selectedHeroes,
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
    },    reset() {
      patchState(store, {
        ...initialState,
        heroConfigs: TEMPLATE_HEROES.map(template => ({
          template,
          level: 1,
          enabled: false
        }))
      });
    },resetConfiguration() {
      patchState(store, { 
        selectedHeroes: [],
        heroConfigs: TEMPLATE_HEROES.map(template => ({
          template,
          level: 1,
          enabled: false
        })),
        selectedMonsters: [],
        runCount: 10,
        errors: []
      });
    }
  }))
);
