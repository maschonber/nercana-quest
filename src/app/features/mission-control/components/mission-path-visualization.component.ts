import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import mermaid from 'mermaid';
import {
  MissionPath,
  MissionNode,
  MissionNodeType,
  RiskLevel
} from '../models/mission-path.model';

@Component({
  selector: 'app-mission-path-visualization',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mission-path-container">
      <div class="path-header">
        <div class="path-legend">
          <span class="legend-item">
            <span class="legend-icon start">🚁</span>
            <span class="legend-text">Start</span>
          </span>
          <span class="legend-item">
            <span class="legend-icon encounter">⚔️</span>
            <span class="legend-text">Combat</span>
          </span>
          <span class="legend-item">
            <span class="legend-icon treasure">💎</span>
            <span class="legend-text">Treasure</span>
          </span>
          <span class="legend-item">
            <span class="legend-icon mining">⛏️</span>
            <span class="legend-text">Mining</span>
          </span>
          <span class="legend-item">
            <span class="legend-icon rest">🏕️</span>
            <span class="legend-text">Rest</span>
          </span>
          <span class="legend-item">
            <span class="legend-icon extraction">🏠</span>
            <span class="legend-text">Exit</span>
          </span>
        </div>
      </div>

      @if (missionPath) {
        <div class="mermaid-container">
          <div #mermaidChart class="mermaid-chart"></div>
        </div>

        <div class="path-stats">
          <span class="stat-item">
            <strong>Total Nodes:</strong> {{ missionPath.totalNodes }}
          </span>
          <span class="stat-item">
            <strong>Max Depth:</strong> {{ missionPath.maxDepth }}
          </span>
          <span class="stat-item">
            <strong>Branches:</strong> {{ missionPath.branchCount }}
          </span>
        </div>
      } @else {
        <div class="no-path">
          <p>No mission path available for this mission.</p>
        </div>
      }
    </div>
  `,
  styleUrls: ['./mission-path-visualization.component.scss']
})
export class MissionPathVisualizationComponent implements OnInit, OnDestroy {
  @Input() missionPath: MissionPath | null = null;
  @ViewChild('mermaidChart', { static: false }) mermaidChart!: ElementRef;

  private mermaidId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeMermaid();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngAfterViewInit(): void {
    if (this.missionPath) {
      this.renderMissionPath();
    }
  }

  ngOnChanges(): void {
    if (this.missionPath && this.mermaidChart) {
      setTimeout(() => this.renderMissionPath(), 0);
    }
  }
  private initializeMermaid(): void {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        // Subtle futuristic dark theme colors
        primaryColor: '#1f2937',
        primaryTextColor: '#e5e7eb',
        primaryBorderColor: '#374151',
        lineColor: '#4b5563',
        secondaryColor: '#111827',
        tertiaryColor: '#030712',
        background: '#111827',
        mainBkg: '#1f2937',
        secondBkg: '#111827',
        tertiaryBkg: '#030712',

        // Subtle text colors
        textColor: '#e5e7eb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',

        // Node styling with subtle appearance
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

  private async renderMissionPath(): Promise<void> {
    if (!this.missionPath || !this.mermaidChart) {
      return;
    }

    try {
      const graphDefinition = this.generateMermaidFlowchart(this.missionPath);

      // Clear previous content
      this.mermaidChart.nativeElement.innerHTML = '';

      // Render the chart
      const { svg } = await mermaid.render(this.mermaidId, graphDefinition);
      this.mermaidChart.nativeElement.innerHTML = svg;

      // Add click handlers for interactivity
      this.addNodeClickHandlers();
    } catch (error) {
      console.error('Error rendering mission path:', error);
      this.mermaidChart.nativeElement.innerHTML =
        '<p class="error">Error rendering mission path visualization</p>';
    }
  }
  private generateMermaidFlowchart(missionPath: MissionPath): string {
    let flowchart = 'flowchart TD\n';

    // Add styling classes with subtle, futuristic dark theme colors
    flowchart +=
      '  classDef startNode fill:#1f2937,stroke:#10b981,stroke-width:2px,color:#10b981\n';
    flowchart +=
      '  classDef encounterNode fill:#1f2937,stroke:#ef4444,stroke-width:2px,color:#ef4444\n';
    flowchart +=
      '  classDef treasureNode fill:#1f2937,stroke:#f59e0b,stroke-width:2px,color:#f59e0b\n';
    flowchart +=
      '  classDef miningNode fill:#1f2937,stroke:#3b82f6,stroke-width:2px,color:#3b82f6\n';
    flowchart +=
      '  classDef restNode fill:#1f2937,stroke:#8b5cf6,stroke-width:2px,color:#8b5cf6\n';
    flowchart +=
      '  classDef decisionNode fill:#1f2937,stroke:#6b7280,stroke-width:2px,color:#9ca3af\n';
    flowchart +=
      '  classDef extractionNode fill:#1f2937,stroke:#10b981,stroke-width:2px,color:#10b981\n';

    // Add nodes with shorter, cleaner labels
    for (const [nodeId, node] of missionPath.nodes) {
      const icon = this.getNodeIcon(node.type);
      const riskIndicator = this.getRiskIndicator(node);
      const label = `${icon} ${node.title}${riskIndicator}`;

      flowchart += `  ${nodeId}["${label}"]\n`;
    }

    // Add connections with shorter choice labels
    for (const [nodeId, node] of missionPath.nodes) {
      for (const choice of node.choices) {
        flowchart += `  ${nodeId} -->|"${choice.label}"| ${choice.targetNodeId}\n`;
      }
    }

    // Apply CSS classes to nodes
    for (const [nodeId, node] of missionPath.nodes) {
      const cssClass = this.getNodeCssClass(node.type);
      flowchart += `  class ${nodeId} ${cssClass}\n`;
    }

    return flowchart;
  }

  private getNodeIcon(nodeType: MissionNodeType): string {
    switch (nodeType) {
      case MissionNodeType.LANDING_SITE:
        return '🚁';
      case MissionNodeType.ENCOUNTER:
        return '⚔️';
      case MissionNodeType.TREASURE:
        return '💎';
      case MissionNodeType.MINING:
        return '⛏️';
      case MissionNodeType.REST:
        return '🏕️';
      case MissionNodeType.DECISION:
        return '🤔';
      case MissionNodeType.EXTRACTION:
        return '🏠';
      default:
        return '❓';
    }
  }

  private getRiskIndicator(node: MissionNode): string {
    // Find the highest risk level among choices
    const maxRisk = node.choices.reduce((max, choice) => {
      if (choice.riskLevel === RiskLevel.HIGH) return RiskLevel.HIGH;
      if (choice.riskLevel === RiskLevel.MEDIUM && max !== RiskLevel.HIGH)
        return RiskLevel.MEDIUM;
      return max;
    }, RiskLevel.LOW);

    switch (maxRisk) {
      case RiskLevel.HIGH:
        return ' ⚠️';
      case RiskLevel.MEDIUM:
        return ' ⚡';
      case RiskLevel.LOW:
      default:
        return '';
    }
  }

  private getNodeCssClass(nodeType: MissionNodeType): string {
    switch (nodeType) {
      case MissionNodeType.LANDING_SITE:
        return 'startNode';
      case MissionNodeType.ENCOUNTER:
        return 'encounterNode';
      case MissionNodeType.TREASURE:
        return 'treasureNode';
      case MissionNodeType.MINING:
        return 'miningNode';
      case MissionNodeType.REST:
        return 'restNode';
      case MissionNodeType.DECISION:
        return 'decisionNode';
      case MissionNodeType.EXTRACTION:
        return 'extractionNode';
      default:
        return 'decisionNode';
    }
  }

  private addNodeClickHandlers(): void {
    if (!this.mermaidChart?.nativeElement) return;

    const nodes = this.mermaidChart.nativeElement.querySelectorAll('.node');
    nodes.forEach((node: Element) => {
      node.addEventListener('click', (event: Event) => {
        const target = event.target as Element;
        const nodeElement = target.closest('.node') as HTMLElement;
        if (nodeElement) {
          this.onNodeClick(nodeElement);
        }
      });
    });
  }

  private onNodeClick(nodeElement: HTMLElement): void {
    // Future: Emit event with node data for detailed view
    console.log('Node clicked:', nodeElement);
  }
}
