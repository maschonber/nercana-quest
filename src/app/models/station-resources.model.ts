/**
 * Station resource model for persistent resources between missions
 */
export interface StationResources {
  goo: number;
  metal: number;
}

/**
 * Resource type enumeration for type safety
 */
export enum ResourceType {
  GOO = 'goo',
  METAL = 'metal'
}

/**
 * Resource change event for tracking resource modifications
 */
export interface ResourceChange {
  type: ResourceType;
  amount: number;
  previousAmount: number;
  newAmount: number;
  source: string; // Description of what caused the change
}
