import { MonsterType, MonsterTier } from './monster.model';

export interface MonsterData {
  readonly baseHealth: number;
  readonly baseAttack: number;
  readonly baseDefense: number;
  readonly baseExpReward: number;
  readonly name: string;
  readonly description: string;
  readonly tierNames?: Partial<Record<MonsterTier, string>>;
}

export interface TierData {
  readonly multiplier: number;
  readonly prefix: string;
}

export interface MonsterConfig {
  readonly monsters: Record<MonsterType, MonsterData>;
  readonly tiers: Record<MonsterTier, TierData>;
}
