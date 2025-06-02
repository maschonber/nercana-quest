import { CombatResult } from '../../combat/models/combat.model';
import { Hero } from '../../hero/models/hero.model';
import { Monster, MonsterType, MonsterTier } from '../../quest/models/monster.model';
import { MonsterSelection, SimulationRun, SimulationStatistics } from './simulation.model';

export interface MultiSimulationConfig {
  heroTeam: Hero[];
  runCount: number;
  monsterSelections: MonsterSelection[];
}

export interface MonsterComparisonResult {
  monster: MonsterSelection;
  monsterInstance: Monster;
  runs: SimulationRun[];
  statistics: SimulationStatistics;
  averageHealthLost: number; // Average health lost by heroes during fights
  difficulty: number; // Calculated difficulty score
}

export interface MultiSimulationResults {
  config: MultiSimulationConfig;
  monsterResults: MonsterComparisonResult[];
  startTime: Date;
  endTime?: Date;
  selectedMonsterResult?: MonsterComparisonResult | null; // Currently selected result for detailed view
}

export enum MultiSimulationStatus {
  IDLE = 'idle',
  CONFIGURING = 'configuring',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export type SortableColumn = 'name' | 'winRate' | 'avgHealthLost' | 'difficulty' | 'avgTurns' | 'avgExperience';

export interface SortConfig {
  column: SortableColumn;
  direction: 'asc' | 'desc';
}
