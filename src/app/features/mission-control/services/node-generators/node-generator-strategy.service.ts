import { MissionNode, MissionTheme } from '../../models/mission-path.model';

// Strategy interface for node generation
export interface NodeGeneratorStrategy {
  generateNode(theme: MissionTheme, difficulty: number, nodeId: string, depth: number, parentNodeId?: string): MissionNode;
}
