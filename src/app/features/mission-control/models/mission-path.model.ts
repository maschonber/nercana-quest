// Mission path data structures for procedural mission generation

export enum MissionNodeType {
  LANDING_SITE = 'landing_site',    // Always first node
  ENCOUNTER = 'encounter',          // Combat encounters
  TREASURE = 'treasure',            // Resource discoveries
  MINING = 'mining',               // Resource extraction sites
  REST = 'rest',                   // Recovery and preparation
  DECISION = 'decision',           // Story branching points
  EXTRACTION = 'extraction'        // Mission completion, always last node
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high'
}

export enum MissionTheme {
  PLANET = 'planet',        // Planetary surface exploration
  STATION = 'station',      // Abandoned/active station infiltration
  ASTEROID = 'asteroid',    // Asteroid belt mining/exploration
  DERELICT = 'derelict',    // Abandoned ship investigation
  NEBULA = 'nebula'         // Hazardous space phenomena
}

export enum PathComplexity {
  LINEAR = 'linear',           // 3-5 nodes, minimal branching
  BRANCHING = 'branching',     // 5-8 nodes, moderate choices
  COMPLEX = 'complex'          // 8-12 nodes, multiple paths
}

export interface NodeRequirement {
  type: string; // e.g., 'skill', 'equipment', 'health'
  value: string | number;
}

export interface NodeReward {
  type: string; // e.g., 'goo', 'metal', 'energy', 'experience'
  quantity: number;
  probability: number; // 0-1, chance of getting this reward
}

export interface NodeContent {
  // Type-specific content will be defined based on node type
  // For encounters: Monster[] or encounter configuration
  // For treasure/mining: Resource definitions
  // For rest: Recovery options
  [key: string]: any;
}

export interface SkillCheck {
  skill: string;
  difficulty: number;
  successBonus?: NodeReward[];
}

export interface MissionChoice {
  id: string;
  label: string;
  description: string;
  targetNodeId: string; // Links to the next node, creating forward connections
  riskLevel: RiskLevel;
  skillCheck?: SkillCheck; // Future: skill requirements
}

export interface MissionNode {
  id: string;
  type: MissionNodeType;
  title: string;
  description: string;
  choices: MissionChoice[]; // 0-2 choices for branching (links to next nodes)
  requirements?: NodeRequirement[]; // Prerequisites to access this node
  rewards?: NodeReward[]; // What can be gained from this node
  content?: NodeContent; // Type-specific content (encounters, resources, etc.)
}

export interface MissionPath {
  startNodeId: string; // ID of the landing site node
  nodes: Map<string, MissionNode>; // All nodes indexed by ID for easy lookup
  totalNodes: number;
  estimatedDuration: number; // Based on path complexity
  difficulty: number; // Use existing challengeRating scale
}
