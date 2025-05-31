import { MonsterType, MonsterTier, CombatAbility } from './monster.model';

export interface MonsterData {
  readonly baseHealth: number;
  readonly baseAttack: number;
  readonly baseDefense: number;
  readonly baseSpeed: number;
  readonly baseExpReward: number;
  readonly name: string;
  readonly description: string;
  readonly tierNames?: Partial<Record<MonsterTier, string>>;
  readonly abilities: CombatAbility[]; // Combat abilities this monster type possesses
}

export interface TierData {
  readonly multiplier: number;
  readonly prefix: string;
}

export interface MonsterConfig {
  readonly monsters: Record<MonsterType, MonsterData>;
  readonly tiers: Record<MonsterTier, TierData>;
}
