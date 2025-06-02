import { CombatResult } from '../../combat/models/combat.model';
import { Hero } from '../../hero/models/hero.model';
import { Monster, MonsterType, MonsterTier } from '../../quest/models/monster.model';

export interface SimulationTeam {
  heroes: Hero[];
  monsters: Monster[];
}

export interface SimulationConfig {
  heroTeam: Hero[];
  enemyTeam: Monster[];
  runCount: number;
}

export interface SimulationRun {
  runNumber: number;
  combatResult: CombatResult;
  timestamp: Date;
}

export interface SimulationResults {
  config: SimulationConfig;
  runs: SimulationRun[];
  statistics: SimulationStatistics;
  startTime: Date;
  endTime?: Date;
}

export interface SimulationStatistics {
  totalRuns: number;
  heroVictories: number;
  heroDefeats: number;
  heroFlees: number;
  heroWinPercentage: number;
  enemyWinPercentage: number;
  fleePercentage: number;
  averageTurns: number;
  averageExperience: number;
}

export interface MonsterSelection {
  type: MonsterType;
  tier: MonsterTier;
  name: string;
}

// Template heroes for combat simulation
export interface TemplateHero {
  name: string;
  baseStats: Omit<Hero, 'name' | 'level' | 'experience'>;
}

export const TEMPLATE_HEROES: TemplateHero[] = [
  {
    name: 'Alice',
    baseStats: {
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 12,
      speed: 10,
      luck: 8
    }
  },
  {
    name: 'Bob',
    baseStats: {
      health: 100,
      maxHealth: 100,
      attack: 12,
      defense: 15,
      speed: 8,
      luck: 10
    }
  },
  {
    name: 'Charlie',
    baseStats: {
      health: 100,
      maxHealth: 100,
      attack: 18,
      defense: 8,
      speed: 12,
      luck: 7
    }
  }
];

export enum SimulationStatus {
  IDLE = 'idle',
  CONFIGURING = 'configuring',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error'
}
