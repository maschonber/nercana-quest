import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import mermaid from 'mermaid';
import {
  MissionPath,
  MissionNode,
  MissionNodeType,
  RiskLevel
} from '../models/mission-path.model';

// Configuration interfaces for better type safety
interface LegendItem {
  type: MissionNodeType;
  icon: string;
  label: string;
}

interface PathStat {
  label: string;
  value: number;
}

interface MermaidConfig {
  nodeColors: Record<MissionNodeType, { fill: string; stroke: string; textColor: string }>;
  theme: {
    background: string;
    textColor: string;
    lineColor: string;
  };
}

@Component({
  selector: 'app-mission-path-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mission-path-visualization.component.html',
  styleUrls: ['./mission-path-visualization.component.scss']
})
export class MissionPathVisualizationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() missionPath: MissionPath | null = null;
  @ViewChild('mermaidChart', { static: false }) mermaidChart!: ElementRef;

  // Template data
  legendItems: LegendItem[] = [];
  pathStats: PathStat[] = [];

  private readonly mermaidId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
  private readonly config: MermaidConfig = this.createMermaidConfig();

  constructor(private cdr: ChangeDetectorRef) {
    this.initializeLegendItems();
  }

  ngOnInit(): void {
    this.initializeMermaid();
  }

  ngOnDestroy(): void {
    // Cleanup mermaid resources if needed
    this.clearChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['missionPath'] && this.missionPath) {
      this.updatePathStats();
      this.scheduleRender();
    }
  }

  ngAfterViewInit(): void {
    if (this.missionPath) {
      this.scheduleRender();
    }
  }

  /**
   * Initialize legend items for the visualization
   */
  private initializeLegendItems(): void {
    this.legendItems = [
      { type: MissionNodeType.LANDING_SITE, icon: '🚁', label: 'Start' },
      { type: MissionNodeType.ENCOUNTER, icon: '⚔️', label: 'Combat' },
      { type: MissionNodeType.TREASURE, icon: '💎', label: 'Treasure' },
      { type: MissionNodeType.MINING, icon: '⛏️', label: 'Mining' },
      { type: MissionNodeType.REST, icon: '🏕️', label: 'Rest' },
      { type: MissionNodeType.EXTRACTION, icon: '🏠', label: 'Exit' }
    ];
  }

  /**
   * Update path statistics based on current mission path
   */
  private updatePathStats(): void {
    if (!this.missionPath) {
      this.pathStats = [];
      return;
    }

    this.pathStats = [
      { label: 'Total Nodes', value: this.missionPath.totalNodes },
      { label: 'Max Depth', value: this.missionPath.maxDepth },
      { label: 'Branches', value: this.missionPath.branchCount }
    ];
  }

  /**
   * Create Mermaid configuration with futuristic dark theme
   */
  private createMermaidConfig(): MermaidConfig {
    return {
      nodeColors: {
        [MissionNodeType.LANDING_SITE]: { fill: '#1f2937', stroke: '#10b981', textColor: '#10b981' },
        [MissionNodeType.ENCOUNTER]: { fill: '#1f2937', stroke: '#ef4444', textColor: '#ef4444' },
        [MissionNodeType.TREASURE]: { fill: '#1f2937', stroke: '#f59e0b', textColor: '#f59e0b' },
        [MissionNodeType.MINING]: { fill: '#1f2937', stroke: '#3b82f6', textColor: '#3b82f6' },
        [MissionNodeType.REST]: { fill: '#1f2937', stroke: '#8b5cf6', textColor: '#8b5cf6' },
        [MissionNodeType.DECISION]: { fill: '#1f2937', stroke: '#6b7280', textColor: '#9ca3af' },
        [MissionNodeType.EXTRACTION]: { fill: '#1f2937', stroke: '#10b981', textColor: '#10b981' }
      },
      theme: {
        background: '#111827',
        textColor: '#e5e7eb',
        lineColor: '#4b5563'
      }
    };
  }

  /**
   * Initialize Mermaid with optimized configuration
   */
  private initializeMermaid(): void {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        ...this.config.theme,
        primaryColor: '#1f2937',
        primaryTextColor: '#e5e7eb',
        primaryBorderColor: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
        nodeBkg: '#1f2937',
        nodeBorder: '#374151',
        nodeTextColor: '#e5e7eb'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: false,
        curve: 'basis',
        nodeSpacing: 70,
        rankSpacing: 110,
        padding: 30
      }
    });
  }

  /**
   * Schedule chart rendering with error handling
   */
  private scheduleRender(): void {
    if (!this.mermaidChart) return;
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => this.renderMissionPath().catch(this.handleRenderError.bind(this)), 0);
  }

  /**
   * Render the mission path as a Mermaid flowchart
   */
  private async renderMissionPath(): Promise<void> {
    if (!this.missionPath || !this.mermaidChart?.nativeElement) {
      return;
    }

    try {
      const graphDefinition = this.generateFlowchartDefinition(this.missionPath);
      
      this.clearChart();
      
      const { svg } = await mermaid.render(this.mermaidId, graphDefinition);
      this.mermaidChart.nativeElement.innerHTML = svg;
      
      this.addNodeInteractivity();
      
    } catch (error) {
      throw new Error(`Failed to render mission path: ${error}`);
    }
  }

  /**
   * Generate Mermaid flowchart definition
   */
  private generateFlowchartDefinition(missionPath: MissionPath): string {
    const lines: string[] = ['flowchart TD'];
    
    // Add CSS class definitions
    lines.push(...this.generateCssClassDefinitions());
    
    // Add nodes
    lines.push(...this.generateNodeDefinitions(missionPath));
    
    // Add connections
    lines.push(...this.generateConnectionDefinitions(missionPath));
    
    // Apply CSS classes
    lines.push(...this.generateClassApplications(missionPath));
    
    return lines.join('\n');
  }

  /**
   * Generate CSS class definitions for node styling
   */
  private generateCssClassDefinitions(): string[] {
    return Object.entries(this.config.nodeColors).map(([nodeType, colors]) => {
      const className = this.getNodeCssClass(nodeType as MissionNodeType);
      return `  classDef ${className} fill:${colors.fill},stroke:${colors.stroke},stroke-width:2px,color:${colors.textColor}`;
    });
  }

  /**
   * Generate node definitions with labels and icons
   */
  private generateNodeDefinitions(missionPath: MissionPath): string[] {
    return Array.from(missionPath.nodes.entries()).map(([nodeId, node]) => {
      const icon = this.getNodeIcon(node.type);
      const riskIndicator = this.getRiskIndicator(node);
      const label = `${icon} ${node.title}${riskIndicator}`;
      
      return `  ${nodeId}["${label}"]`;
    });
  }

  /**
   * Generate connection definitions between nodes
   */
  private generateConnectionDefinitions(missionPath: MissionPath): string[] {
    const connections: string[] = [];
    
    for (const [nodeId, node] of missionPath.nodes) {
      for (const choice of node.choices) {
        connections.push(`  ${nodeId} -->|"${choice.label}"| ${choice.targetNodeId}`);
      }
    }
    
    return connections;
  }

  /**
   * Generate CSS class applications for nodes
   */
  private generateClassApplications(missionPath: MissionPath): string[] {
    return Array.from(missionPath.nodes.entries()).map(([nodeId, node]) => {
      const cssClass = this.getNodeCssClass(node.type);
      return `  class ${nodeId} ${cssClass}`;
    });
  }

  /**
   * Get icon for a specific node type
   */
  private getNodeIcon(nodeType: MissionNodeType): string {
    const iconMap: Record<MissionNodeType, string> = {
      [MissionNodeType.LANDING_SITE]: '🚁',
      [MissionNodeType.ENCOUNTER]: '⚔️',
      [MissionNodeType.TREASURE]: '💎',
      [MissionNodeType.MINING]: '⛏️',
      [MissionNodeType.REST]: '🏕️',
      [MissionNodeType.DECISION]: '🤔',
      [MissionNodeType.EXTRACTION]: '🏠'
    };
    
    return iconMap[nodeType] || '❓';
  }

  /**
   * Get risk indicator based on node choices
   */
  private getRiskIndicator(node: MissionNode): string {
    const maxRisk = node.choices.reduce((max, choice) => {
      if (choice.riskLevel === RiskLevel.HIGH) return RiskLevel.HIGH;
      if (choice.riskLevel === RiskLevel.MEDIUM && max !== RiskLevel.HIGH) return RiskLevel.MEDIUM;
      return max;
    }, RiskLevel.LOW);

    const riskIndicators: Record<RiskLevel, string> = {
      [RiskLevel.HIGH]: ' ⚠️',
      [RiskLevel.MEDIUM]: ' ⚡',
      [RiskLevel.LOW]: ''
    };

    return riskIndicators[maxRisk];
  }

  /**
   * Get CSS class name for a node type
   */
  private getNodeCssClass(nodeType: MissionNodeType): string {
    const classMap: Record<MissionNodeType, string> = {
      [MissionNodeType.LANDING_SITE]: 'startNode',
      [MissionNodeType.ENCOUNTER]: 'encounterNode',
      [MissionNodeType.TREASURE]: 'treasureNode',
      [MissionNodeType.MINING]: 'miningNode',
      [MissionNodeType.REST]: 'restNode',
      [MissionNodeType.DECISION]: 'decisionNode',
      [MissionNodeType.EXTRACTION]: 'extractionNode'
    };
    
    return classMap[nodeType] || 'decisionNode';
  }

  /**
   * Add click handlers for node interactivity
   */
  private addNodeInteractivity(): void {
    if (!this.mermaidChart?.nativeElement) return;

    const nodes = this.mermaidChart.nativeElement.querySelectorAll('.node');
    nodes.forEach((node: Element) => {
      node.addEventListener('click', this.handleNodeClick.bind(this));
    });
  }

  /**
   * Handle node click events
   */
  private handleNodeClick(event: Event): void {
    const nodeElement = (event.target as Element).closest('.node') as HTMLElement;
    if (nodeElement) {
      // Future: Emit event with node data for detailed view
      console.log('Node clicked:', nodeElement);
      // TODO: Implement node detail modal or side panel
    }
  }

  /**
   * Clear the chart content
   */
  private clearChart(): void {
    if (this.mermaidChart?.nativeElement) {
      this.mermaidChart.nativeElement.innerHTML = '';
    }
  }

  /**
   * Handle rendering errors gracefully
   */
  private handleRenderError(error: Error): void {
    console.error('Mission path visualization error:', error);
    if (this.mermaidChart?.nativeElement) {
      this.mermaidChart.nativeElement.innerHTML = 
        '<div class="error"><div class="error-message">Failed to render mission path visualization</div></div>';
    }
  }
}
