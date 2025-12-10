'use client';

import { marked } from 'marked';
import { Card, CardContent } from '@/components/ui/card';

type NoteSection = {
  title: string;
  content: string | string[];
};

type NoteViewerProps = {
  notes: NoteSection[];
};

type MindmapData = {
  type: 'mindmap';
  central: string;
  branches: Array<{
    topic: string;
    subs?: string[];
  }>;
};

type FlowchartData = {
  type: 'flowchart';
  nodes: Array<{
    id: string;
    label: string;
    type: 'start' | 'process' | 'decision' | 'end';
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
};

type TimelineData = {
  type: 'timeline';
  events: Array<{
    date: string;
    title: string;
    description: string;
  }>;
};

type ChartData = {
  type: 'chart';
  chartType: 'bar' | 'pie';
  data: {
    labels: string[];
    values: number[];
  };
};

type VennDiagramData = {
  type: 'venndiagram';
  sets: Array<{
    label: string;
    items: string[];
  }>;
};

type ConceptMapData = {
  type: 'conceptmap';
  nodes: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
};

type FishboneData = {
  type: 'fishbone';
  problem: string;
  categories: Array<{
    name: string;
    causes: string[];
  }>;
};

type DecisionTreeData = {
  type: 'decisiontree';
  root: {
    question: string;
    yes?: any;
    no?: any;
    outcome?: string;
  };
};

type SWOTData = {
  type: 'swot';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

type PESTELData = {
  type: 'pestel';
  political: string[];
  economic: string[];
  social: string[];
  technological: string[];
  environmental: string[];
  legal: string[];
};

type KanbanData = {
  type: 'kanban';
  columns: Array<{
    name: string;
    cards: string[];
  }>;
};

// Parser functions for structured markdown
function parseMindmapMarkdown(content: string): MindmapData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const branches: Array<{ topic: string; subs?: string[] }> = [];
  let central = '';

  for (const line of lines) {
    if (line.startsWith('**Main Subject:**')) {
      central = line.replace('**Main Subject:**', '').trim();
    } else if (line.startsWith('**Branch') && !line.includes('-')) {
      const branchMatch = line.match(/\*\*Branch (\d+):\*\*\s*(.+)/);
      if (branchMatch) {
        branches.push({ topic: branchMatch[2] });
      }
    } else if (line.startsWith('- Branch') && branches.length > 0) {
      const subMatch = line.match(/- Branch \d+-(\d+):\s*(.+)/);
      if (subMatch && branches[branches.length - 1]) {
        if (!branches[branches.length - 1].subs) {
          branches[branches.length - 1].subs = [];
        }
        branches[branches.length - 1].subs!.push(subMatch[2]);
      }
    }
  }

  return { type: 'mindmap', central, branches };
}

function parseFlowchartMarkdown(content: string): FlowchartData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const nodes: Array<{ id: string; label: string; type: 'start' | 'process' | 'decision' | 'end' }> = [];
  const connections: Array<{ from: string; to: string; label?: string }> = [];

  for (const line of lines) {
    if (line.startsWith('**Start:**')) {
      nodes.push({ id: 'start', label: line.replace('**Start:**', '').trim(), type: 'start' });
    } else if (line.startsWith('**Step')) {
      const stepMatch = line.match(/\*\*Step (\d+):\*\*\s*(.+)/);
      if (stepMatch) {
        nodes.push({ id: `step${stepMatch[1]}`, label: stepMatch[2], type: 'process' });
      }
    } else if (line.startsWith('**Decision:**')) {
      nodes.push({ id: 'decision', label: line.replace('**Decision:**', '').trim(), type: 'decision' });
    } else if (line.startsWith('**End:**')) {
      nodes.push({ id: 'end', label: line.replace('**End:**', '').trim(), type: 'end' });
    } else if (line.includes('→')) {
      const [from, to] = line.split('→').map(s => s.trim());
      connections.push({ from, to });
    } else if (line.startsWith('- Yes →') || line.startsWith('- No →')) {
      const label = line.startsWith('- Yes →') ? 'Yes' : 'No';
      const connection = line.replace(`- ${label} →`, '').trim();
      connections.push({ from: 'decision', to: connection, label });
    }
  }

  return { type: 'flowchart', nodes, connections };
}

function parseTimelineMarkdown(content: string): TimelineData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const events: Array<{ date: string; title: string; description: string }> = [];

  for (const line of lines) {
    const eventMatch = line.match(/\*\*([^:]+):\*\*\s*(.+)\s*-\s*(.+)/);
    if (eventMatch) {
      events.push({
        date: eventMatch[1],
        title: eventMatch[2],
        description: eventMatch[3]
      });
    }
  }

  return { type: 'timeline', events };
}

function parseChartMarkdown(content: string): ChartData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  let chartType: 'bar' | 'pie' = 'bar';
  const labels: string[] = [];
  const values: number[] = [];

  for (const line of lines) {
    if (line.startsWith('**Chart Type:**')) {
      chartType = line.replace('**Chart Type:**', '').trim() as 'bar' | 'pie';
    } else if (line.startsWith('**Data:**')) {
      // Data section starts
    } else if (line.startsWith('- ') && !line.startsWith('- Branch')) {
      const dataMatch = line.match(/- ([^:]+):\s*(\d+)/);
      if (dataMatch) {
        labels.push(dataMatch[1]);
        values.push(parseInt(dataMatch[2]));
      }
    }
  }

  return { type: 'chart', chartType, data: { labels, values } };
}

function parseVennDiagramMarkdown(content: string): VennDiagramData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const sets: Array<{ label: string; items: string[] }> = [];
  let currentSet: { label: string; items: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith('**Set ') && line.includes(':**')) {
      if (currentSet) sets.push(currentSet);
      const label = line.replace(/\*\*Set [^:]+:\*\*/, '').replace('**', '').trim();
      currentSet = { label, items: [] };
    } else if (line.startsWith('**Overlap:**')) {
      if (currentSet) sets.push(currentSet);
      currentSet = { label: 'Overlap', items: [] };
    } else if (line.startsWith('- ') && currentSet) {
      currentSet.items.push(line.substring(2));
    }
  }

  if (currentSet) sets.push(currentSet);

  return { type: 'venndiagram', sets };
}

function parseConceptMapMarkdown(content: string): ConceptMapData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const nodes: Array<{ id: string; label: string; x: number; y: number }> = [];
  const connections: Array<{ from: string; to: string; label?: string }> = [];

  let nodeCount = 0;
  for (const line of lines) {
    if (line.startsWith('**Node ')) {
      const nodeMatch = line.match(/\*\*Node \d+:\*\*\s*(.+)/);
      if (nodeMatch) {
        nodes.push({
          id: `node${nodeCount + 1}`,
          label: nodeMatch[1],
          x: 100 + (nodeCount % 3) * 200,
          y: 100 + Math.floor(nodeCount / 3) * 150
        });
        nodeCount++;
      }
    } else if (line.startsWith('**Connection ')) {
      const connMatch = line.match(/\*\*Connection (\d+)-(\d+):\*\*\s*(.+)/);
      if (connMatch) {
        connections.push({
          from: `node${connMatch[1]}`,
          to: `node${connMatch[2]}`,
          label: connMatch[3]
        });
      }
    }
  }

  return { type: 'conceptmap', nodes, connections };
}

function parseFishboneMarkdown(content: string): FishboneData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  let problem = '';
  const categories: Array<{ name: string; causes: string[] }> = [];
  let currentCategory: { name: string; causes: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith('**Main Problem:**')) {
      problem = line.replace('**Main Problem:**', '').trim();
    } else if (line.startsWith('**Category ') && line.includes(':**')) {
      if (currentCategory) categories.push(currentCategory);
      const name = line.replace(/\*\*Category \d+:\*\*/, '').replace('**', '').trim();
      currentCategory = { name, causes: [] };
    } else if (line.startsWith('- ') && currentCategory && !line.startsWith('- Branch')) {
      currentCategory.causes.push(line.substring(2));
    }
  }

  if (currentCategory) categories.push(currentCategory);

  return { type: 'fishbone', problem, categories };
}

function parseDecisionTreeMarkdown(content: string): DecisionTreeData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  const root: any = { question: '', yes: null, no: null };

  for (const line of lines) {
    if (line.startsWith('**Decision:**')) {
      root.question = line.replace('**Decision:**', '').trim();
    } else if (line.includes('├── Yes →')) {
      root.yes = { outcome: line.replace('├── Yes →', '').trim() };
    } else if (line.includes('└── No →')) {
      root.no = { outcome: line.replace('└── No →', '').trim() };
    }
  }

  return { type: 'decisiontree', root };
}

function parseSWOTMarkdown(content: string): SWOTData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const result: SWOTData = {
    type: 'swot',
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };

  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('**Strengths:**')) {
      currentSection = 'strengths';
    } else if (line.startsWith('**Weaknesses:**')) {
      currentSection = 'weaknesses';
    } else if (line.startsWith('**Opportunities:**')) {
      currentSection = 'opportunities';
    } else if (line.startsWith('**Threats:**')) {
      currentSection = 'threats';
    } else if (line.startsWith('- ') && currentSection) {
      (result as any)[currentSection].push(line.substring(2));
    }
  }

  return result;
}

function parsePESTELMarkdown(content: string): PESTELData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const result: PESTELData = {
    type: 'pestel',
    political: [],
    economic: [],
    social: [],
    technological: [],
    environmental: [],
    legal: []
  };

  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('**Political:**')) {
      currentSection = 'political';
    } else if (line.startsWith('**Economic:**')) {
      currentSection = 'economic';
    } else if (line.startsWith('**Social:**')) {
      currentSection = 'social';
    } else if (line.startsWith('**Technological:**')) {
      currentSection = 'technological';
    } else if (line.startsWith('**Environmental:**')) {
      currentSection = 'environmental';
    } else if (line.startsWith('**Legal:**')) {
      currentSection = 'legal';
    } else if (line.startsWith('- ') && currentSection) {
      (result as any)[currentSection].push(line.substring(2));
    }
  }

  return result;
}

function parseKanbanMarkdown(content: string): KanbanData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const columns: Array<{ name: string; cards: string[] }> = [];
  let currentColumn: { name: string; cards: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith('**') && line.endsWith(':**')) {
      if (currentColumn) columns.push(currentColumn);
      const name = line.slice(2, -2);
      currentColumn = { name, cards: [] };
    } else if (line.startsWith('- ') && currentColumn) {
      currentColumn.cards.push(line.substring(2));
    }
  }

  if (currentColumn) columns.push(currentColumn);

  return { type: 'kanban', columns };
}

function detectVisualStyle(content: string): string | null {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  // Check for specific patterns
  if (lines.some(line => line.startsWith('**Main Subject:**'))) return 'mindmap';
  if (lines.some(line => line.startsWith('**Start:**'))) return 'flowchart';
  if (lines.some(line => /^\*\*\d{4}-\d{2}-\d{2}:\*\*/.test(line))) return 'timeline';
  if (lines.some(line => line.startsWith('**Chart Type:**'))) return 'chart';
  if (lines.some(line => line.startsWith('**Set '))) return 'venndiagram';
  if (lines.some(line => line.startsWith('**Node '))) return 'conceptmap';
  if (lines.some(line => line.startsWith('**Main Problem:**'))) return 'fishbone';
  if (lines.some(line => line.startsWith('**Decision:**'))) return 'decisiontree';
  if (lines.some(line => line.startsWith('**Strengths:**'))) return 'swot';
  if (lines.some(line => line.startsWith('**Political:**'))) return 'pestel';
  if (lines.some(line => line.startsWith('**To Do:**'))) return 'kanban';

  return null;
}

function MindmapRenderer({ data }: { data: MindmapData }) {
  const centerX = 300;
  const centerY = 200;
  const radius = 80;
  const branchRadius = 150;

  return (
    <svg width="600" height="400" className="border rounded">
      {/* Central node */}
      <circle cx={centerX} cy={centerY} r={radius} fill="#3b82f6" />
      <text x={centerX} y={centerY} textAnchor="middle" dy="0.35em" fill="white" fontSize="14" fontWeight="bold">
        {data.central}
      </text>

      {/* Branches */}
      {data.branches.map((branch, index) => {
        const angle = (index / data.branches.length) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + Math.cos(angle) * branchRadius;
        const y = centerY + Math.sin(angle) * branchRadius;

        return (
          <g key={index}>
            {/* Line from center */}
            <line
              x1={centerX + Math.cos(angle) * radius}
              y1={centerY + Math.sin(angle) * radius}
              x2={x}
              y2={y}
              stroke="#6b7280"
              strokeWidth="2"
            />
            {/* Branch circle */}
            <circle cx={x} cy={y} r="40" fill="#10b981" />
            <text x={x} y={y} textAnchor="middle" dy="0.35em" fill="white" fontSize="12" fontWeight="bold">
              {branch.topic}
            </text>

            {/* Subtopics */}
            {branch.subs?.map((sub, subIndex) => {
              const subAngle = angle + (subIndex - (branch.subs!.length - 1) / 2) * 0.5;
              const subX = x + Math.cos(subAngle) * 80;
              const subY = y + Math.sin(subAngle) * 80;

              return (
                <g key={subIndex}>
                  <line x1={x} y1={y} x2={subX} y2={subY} stroke="#6b7280" strokeWidth="1" />
                  <circle cx={subX} cy={subY} r="25" fill="#f59e0b" />
                  <text x={subX} y={subY} textAnchor="middle" dy="0.35em" fill="white" fontSize="10">
                    {sub}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function FlowchartRenderer({ data }: { data: FlowchartData }) {
  const nodeSpacing = 120;
  const startY = 50;

  return (
    <svg width="600" height={data.nodes.length * nodeSpacing + 100} className="border rounded">
      {data.nodes.map((node, index) => {
        const y = startY + index * nodeSpacing;
        const x = 300;
        let fillColor = '#e5e7eb';
        let shape = null;

        switch (node.type) {
          case 'start':
          case 'end':
            shape = <ellipse cx={x} cy={y} rx="60" ry="30" fill={fillColor} stroke="#374151" />;
            break;
          case 'decision':
            shape = <polygon points={`${x-40},${y} ${x},${y-40} ${x+40},${y} ${x},${y+40}`} fill={fillColor} stroke="#374151" />;
            break;
          default:
            shape = <rect x={x-60} y={y-20} width="120" height="40" fill={fillColor} stroke="#374151" rx="5" />;
        }

        return (
          <g key={node.id}>
            {shape}
            <text x={x} y={y} textAnchor="middle" dy="0.35em" fontSize="12" fontWeight="bold">
              {node.label}
            </text>
          </g>
        );
      })}

      {/* Connections */}
      {data.connections.map((conn, index) => {
        const fromIndex = data.nodes.findIndex(n => n.id === conn.from);
        const toIndex = data.nodes.findIndex(n => n.id === conn.to);
        const fromY = startY + fromIndex * nodeSpacing;
        const toY = startY + toIndex * nodeSpacing;

        return (
          <g key={index}>
            <line x1="300" y1={fromY + 20} x2="300" y2={toY - 20} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {conn.label && (
              <text x="320" y={(fromY + toY) / 2} fontSize="10" fill="#6b7280">
                {conn.label}
              </text>
            )}
          </g>
        );
      })}

      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
        </marker>
      </defs>
    </svg>
  );
}

function TimelineRenderer({ data }: { data: TimelineData }) {
  const startX = 50;
  const endX = 550;
  const lineY = 100;

  return (
    <svg width="600" height="300" className="border rounded">
      {/* Timeline line */}
      <line x1={startX} y1={lineY} x2={endX} y2={lineY} stroke="#374151" strokeWidth="3" />

      {data.events.map((event, index) => {
        const x = startX + (index / (data.events.length - 1 || 1)) * (endX - startX);

        return (
          <g key={index}>
            {/* Event dot */}
            <circle cx={x} cy={lineY} r="8" fill="#3b82f6" />
            <circle cx={x} cy={lineY} r="12" fill="none" stroke="#3b82f6" strokeWidth="2" />

            {/* Date */}
            <text x={x} y={lineY - 25} textAnchor="middle" fontSize="10" fill="#6b7280">
              {new Date(event.date).toLocaleDateString()}
            </text>

            {/* Title */}
            <text x={x} y={lineY + 35} textAnchor="middle" fontSize="12" fontWeight="bold">
              {event.title}
            </text>

            {/* Description */}
            <text x={x} y={lineY + 55} textAnchor="middle" fontSize="10" fill="#6b7280">
              {event.description}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ChartRenderer({ data }: { data: ChartData }) {
  if (data.chartType === 'bar') {
    const barWidth = 40;
    const spacing = 60;
    const startX = 50;
    const bottomY = 250;
    const maxValue = Math.max(...data.data.values);

    return (
      <svg width="600" height="300" className="border rounded">
        {data.data.labels.map((label, index) => {
          const x = startX + index * spacing;
          const height = (data.data.values[index] / maxValue) * 180;
          const y = bottomY - height;

          return (
            <g key={index}>
              {/* Bar */}
              <rect x={x} y={y} width={barWidth} height={height} fill="#3b82f6" />

              {/* Value label */}
              <text x={x + barWidth/2} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="bold">
                {data.data.values[index]}
              </text>

              {/* X-axis label */}
              <text x={x + barWidth/2} y={bottomY + 20} textAnchor="middle" fontSize="10">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Fallback for pie chart (simplified)
  return <div className="text-center p-4">Pie chart visualization coming soon...</div>;
}

function VennDiagramRenderer({ data }: { data: VennDiagramData }) {
  if (data.sets.length !== 2) {
    return <div className="text-center p-4">Venn diagrams with 2 sets supported only</div>;
  }

  return (
    <svg width="600" height="400" className="border rounded">
      {/* Set A */}
      <circle cx="200" cy="200" r="120" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="2" />
      <text x="200" y="160" textAnchor="middle" fontSize="14" fontWeight="bold">Set A: {data.sets[0].label}</text>
      {data.sets[0].items.map((item, index) => (
        <text key={index} x="200" y={200 + index * 15} textAnchor="middle" fontSize="12">{item}</text>
      ))}

      {/* Set B */}
      <circle cx="400" cy="200" r="120" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="2" />
      <text x="400" y="160" textAnchor="middle" fontSize="14" fontWeight="bold">Set B: {data.sets[1].label}</text>
      {data.sets[1].items.map((item, index) => (
        <text key={index} x="400" y={200 + index * 15} textAnchor="middle" fontSize="12">{item}</text>
      ))}

      {/* Overlap */}
      <circle cx="300" cy="200" r="80" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2" />
      <text x="300" y="180" textAnchor="middle" fontSize="12" fontWeight="bold">Overlap</text>
      {[...new Set(data.sets[0].items.filter(item => data.sets[1].items.includes(item)))].map((item, index) => (
        <text key={index} x="300" y={200 + index * 15} textAnchor="middle" fontSize="12">{item}</text>
      ))}
    </svg>
  );
}

function ConceptMapRenderer({ data }: { data: ConceptMapData }) {
  return (
    <svg width="600" height="400" className="border rounded">
      {data.nodes.map((node) => (
        <g key={node.id}>
          <rect x={node.x - 50} y={node.y - 20} width="100" height="40" fill="#e5e7eb" stroke="#374151" rx="5" />
          <text x={node.x} y={node.y} textAnchor="middle" dy="0.35em" fontSize="12" fontWeight="bold">
            {node.label}
          </text>
        </g>
      ))}

      {data.connections.map((conn, index) => {
        const fromNode = data.nodes.find(n => n.id === conn.from);
        const toNode = data.nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return null;

        return (
          <g key={index}>
            <line x1={fromNode.x} y1={fromNode.y + 20} x2={toNode.x} y2={toNode.y - 20} stroke="#374151" strokeWidth="2" markerEnd="url(#arrow)" />
            {conn.label && (
              <text x={(fromNode.x + toNode.x) / 2} y={(fromNode.y + toNode.y) / 2 - 5} textAnchor="middle" fontSize="10" fill="#6b7280">
                {conn.label}
              </text>
            )}
          </g>
        );
      })}

      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
        </marker>
      </defs>
    </svg>
  );
}

function FishboneRenderer({ data }: { data: FishboneData }) {
  const centerX = 400;
  const centerY = 200;
  const mainBoneLength = 300;
  const categoryLength = 100;

  return (
    <svg width="800" height="400" className="border rounded">
      {/* Main spine */}
      <line x1={centerX - mainBoneLength/2} y1={centerY} x2={centerX + mainBoneLength/2} y2={centerY} stroke="#374151" strokeWidth="4" />
      <text x={centerX} y={centerY - 10} textAnchor="middle" fontSize="14" fontWeight="bold">{data.problem}</text>

      {/* Categories */}
      {data.categories.map((category, index) => {
        const isTop = index < data.categories.length / 2;
        const yOffset = (index % (data.categories.length / 2)) * 60 + 50;
        const y = isTop ? centerY - yOffset : centerY + yOffset;
        const x = isTop ? centerX - 150 : centerX + 150;

        return (
          <g key={index}>
            {/* Category bone */}
            <line x1={isTop ? centerX - 50 : centerX + 50} y1={centerY} x2={x} y2={y} stroke="#374151" strokeWidth="3" />

            {/* Category label */}
            <text x={x + (isTop ? -10 : 10)} y={y - 5} textAnchor={isTop ? "end" : "start"} fontSize="12" fontWeight="bold">
              {category.name}
            </text>

            {/* Causes */}
            {category.causes.map((cause, causeIndex) => (
              <g key={causeIndex}>
                <line x1={x} y1={y} x2={x + (isTop ? -40 : 40)} y2={y + causeIndex * 20 - (category.causes.length - 1) * 10} stroke="#6b7280" strokeWidth="2" />
                <text x={x + (isTop ? -50 : 50)} y={y + causeIndex * 20 - (category.causes.length - 1) * 10 + 3} textAnchor={isTop ? "end" : "start"} fontSize="10">
                  {cause}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function DecisionTreeRenderer({ data }: { data: DecisionTreeData }) {
  const renderNode = (node: any, x: number, y: number, level: number = 0): JSX.Element => {
    const spacing = 150 / (level + 1);

    return (
      <g>
        {/* Node */}
        <rect x={x - 60} y={y - 15} width="120" height="30" fill="#e5e7eb" stroke="#374151" rx="5" />
        <text x={x} y={y} textAnchor="middle" dy="0.35em" fontSize="12">
          {node.question || node.outcome}
        </text>

        {/* Branches */}
        {node.yes && (
          <>
            <line x1={x} y1={y + 15} x2={x - spacing} y2={y + 60} stroke="#374151" strokeWidth="2" />
            <text x={x - spacing/2} y={y + 35} textAnchor="middle" fontSize="10" fill="#6b7280">Yes</text>
            {renderNode(node.yes, x - spacing, y + 75, level + 1)}
          </>
        )}

        {node.no && (
          <>
            <line x1={x} y1={y + 15} x2={x + spacing} y2={y + 60} stroke="#374151" strokeWidth="2" />
            <text x={x + spacing/2} y={y + 35} textAnchor="middle" fontSize="10" fill="#6b7280">No</text>
            {renderNode(node.no, x + spacing, y + 75, level + 1)}
          </>
        )}
      </g>
    );
  };

  return (
    <svg width="600" height="300" className="border rounded">
      {renderNode(data.root, 300, 50)}
    </svg>
  );
}

function SWOTRenderer({ data }: { data: SWOTData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border-2 border-green-500 p-4 rounded">
        <h3 className="text-green-700 font-bold text-center mb-2">Strengths</h3>
        <ul className="list-disc list-inside">
          {data.strengths.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>

      <div className="border-2 border-red-500 p-4 rounded">
        <h3 className="text-red-700 font-bold text-center mb-2">Weaknesses</h3>
        <ul className="list-disc list-inside">
          {data.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>

      <div className="border-2 border-blue-500 p-4 rounded">
        <h3 className="text-blue-700 font-bold text-center mb-2">Opportunities</h3>
        <ul className="list-disc list-inside">
          {data.opportunities.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>

      <div className="border-2 border-yellow-500 p-4 rounded">
        <h3 className="text-yellow-700 font-bold text-center mb-2">Threats</h3>
        <ul className="list-disc list-inside">
          {data.threats.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}

function PESTELRenderer({ data }: { data: PESTELData }) {
  const categories = [
    { name: 'Political', items: data.political, color: 'blue' },
    { name: 'Economic', items: data.economic, color: 'green' },
    { name: 'Social', items: data.social, color: 'purple' },
    { name: 'Technological', items: data.technological, color: 'orange' },
    { name: 'Environmental', items: data.environmental, color: 'teal' },
    { name: 'Legal', items: data.legal, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category, index) => (
        <div key={index} className={`border-2 border-${category.color}-500 p-4 rounded`}>
          <h3 className={`text-${category.color}-700 font-bold text-center mb-2`}>{category.name}</h3>
          <ul className="list-disc list-inside">
            {category.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function KanbanRenderer({ data }: { data: KanbanData }) {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {data.columns.map((column, index) => (
        <div key={index} className="min-w-64 bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold text-center mb-3">{column.name}</h3>
          <div className="space-y-2">
            {column.cards.map((card, cardIndex) => (
              <div key={cardIndex} className="bg-white p-3 rounded shadow-sm border">
                {card}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NoteViewer({ notes }: NoteViewerProps) {
  if (!notes || notes.length === 0) {
    return <p>No content available for this note.</p>;
  }

  return (
    <Card>
        <CardContent className="p-6">
            <div className="prose dark:prose-invert max-w-none">
                {notes.map((note, index) => (
                    <div key={index} className="mb-8">
                        <h2>{note.title}</h2>
                        {(() => {
                          const content = Array.isArray(note.content) ? note.content.join('\n') : note.content;
                          const visualStyle = detectVisualStyle(content);

                          if (visualStyle) {
                            try {
                              let data;
                              switch (visualStyle) {
                                case 'mindmap':
                                  data = parseMindmapMarkdown(content);
                                  return <MindmapRenderer data={data} />;
                                case 'flowchart':
                                  data = parseFlowchartMarkdown(content);
                                  return <FlowchartRenderer data={data} />;
                                case 'timeline':
                                  data = parseTimelineMarkdown(content);
                                  return <TimelineRenderer data={data} />;
                                case 'chart':
                                  data = parseChartMarkdown(content);
                                  return <ChartRenderer data={data} />;
                                case 'venndiagram':
                                  data = parseVennDiagramMarkdown(content);
                                  return <VennDiagramRenderer data={data} />;
                                case 'conceptmap':
                                  data = parseConceptMapMarkdown(content);
                                  return <ConceptMapRenderer data={data} />;
                                case 'fishbone':
                                  data = parseFishboneMarkdown(content);
                                  return <FishboneRenderer data={data} />;
                                case 'decisiontree':
                                  data = parseDecisionTreeMarkdown(content);
                                  return <DecisionTreeRenderer data={data} />;
                                case 'swot':
                                  data = parseSWOTMarkdown(content);
                                  return <SWOTRenderer data={data} />;
                                case 'pestel':
                                  data = parsePESTELMarkdown(content);
                                  return <PESTELRenderer data={data} />;
                                case 'kanban':
                                  data = parseKanbanMarkdown(content);
                                  return <KanbanRenderer data={data} />;
                                default:
                                  return <div dangerouslySetInnerHTML={{ __html: marked(content) as string }} />;
                              }
                            } catch (error) {
                              console.error('Error parsing visual content:', error);
                              return <div dangerouslySetInnerHTML={{ __html: marked(content) as string }} />;
                            }
                          } else {
                            return <div dangerouslySetInnerHTML={{ __html: marked(content) as string }} />;
                          }
                        })()}
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
