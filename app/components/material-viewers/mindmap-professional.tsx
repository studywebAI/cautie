'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type MindmapNode = {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  parentId?: string;
};

type MindmapConnection = {
  from: string;
  to: string;
};

type MindmapData = {
  type: 'mindmap';
  central: string;
  branches: Array<{
    topic: string;
    subs?: string[];
  }>;
};

type ProfessionalMindmapRendererProps = {
  data: MindmapData;
  title?: string;
};

export function ProfessionalMindmapRenderer({ data, title }: ProfessionalMindmapRendererProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [editingNode, setEditingNode] = useState<MindmapNode | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [expandedNode, setExpandedNode] = useState<MindmapNode | null>(null);

  // Calculate dimensions to fit without scrolling with equal whitespace
  const sidebarWidth = 280;
  const containerPadding = 40;
  const availableWidth = typeof window !== 'undefined' ? window.innerWidth - sidebarWidth - containerPadding * 2 : 800;
  const availableHeight = typeof window !== 'undefined' ? window.innerHeight - 300 : 600;
  // Use the smaller dimension to ensure equal whitespace on all sides
  const size = Math.min(availableWidth, availableHeight);
  const svgWidth = size;
  const svgHeight = size;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Convert mindmap data to node structure
  const buildNodes = (): { nodes: MindmapNode[]; connections: MindmapConnection[] } => {
    const nodes: MindmapNode[] = [];
    const connections: MindmapConnection[] = [];

    // Central node
    const centralText = title || data.central;
    const centralWidth = Math.max(140, Math.min(220, centralText.length * 10));
    const centralHeight = 70;

    nodes.push({
      id: 'central',
      title: centralText,
      description: `Main topic: ${centralText}`,
      x: centerX - centralWidth / 2,
      y: centerY - centralHeight / 2,
      width: centralWidth,
      height: centralHeight,
      level: 0
    });

    // Branch nodes
    data.branches.forEach((branch, index) => {
      const angle = (index / data.branches.length) * 2 * Math.PI - Math.PI / 2;
      const distance = Math.min(svgWidth, svgHeight) * 0.25;
      const branchWidth = Math.max(100, Math.min(160, branch.topic.length * 6));
      const branchHeight = 50;
      const x = centerX + Math.cos(angle) * distance - branchWidth / 2;
      const y = centerY + Math.sin(angle) * distance - branchHeight / 2;

      nodes.push({
        id: `branch-${index}`,
        title: branch.topic,
        description: `Branch topic: ${branch.topic}`,
        x,
        y,
        width: branchWidth,
        height: branchHeight,
        level: 1,
        parentId: 'central'
      });

      connections.push({
        from: 'central',
        to: `branch-${index}`
      });

      // Sub-branch nodes
      branch.subs?.forEach((sub, subIndex) => {
        const subAngle = angle + (subIndex - (branch.subs!.length - 1) / 2) * 0.6;
        const subDistance = distance + Math.min(svgWidth, svgHeight) * 0.15;
        const subWidth = Math.max(80, Math.min(120, sub.length * 5));
        const subHeight = 40;
        const subX = centerX + Math.cos(subAngle) * subDistance - subWidth / 2;
        const subY = centerY + Math.sin(subAngle) * subDistance - subHeight / 2;

        nodes.push({
          id: `sub-${index}-${subIndex}`,
          title: sub,
          description: `Sub-topic: ${sub}`,
          x: subX,
          y: subY,
          width: subWidth,
          height: subHeight,
          level: 2,
          parentId: `branch-${index}`
        });

        connections.push({
          from: `branch-${index}`,
          to: `sub-${index}-${subIndex}`
        });
      });
    });

    return { nodes, connections };
  };

  const { nodes, connections } = buildNodes();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * zoomFactor)));
  };

  const handleNodeClick = (node: MindmapNode, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle expanded state for detailed view
    setExpandedNode(expandedNode?.id === node.id ? null : node);
  };

  const handleNodeContextMenu = (node: MindmapNode, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingNode(node);
    setEditTitle(node.title);
    setEditDescription(node.description);
  };

  const handleNodeDoubleClick = (node: MindmapNode, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingNode(node);
    setEditTitle(node.title);
    setEditDescription(node.description);
  };

  const saveNodeEdit = () => {
    if (editingNode) {
      // In a real app, this would update the data
      console.log('Saving node edit:', editingNode.id, editTitle, editDescription);
      setEditingNode(null);
    }
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number = 12) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = testLine.length * (fontSize * 0.6);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  return (
    <div className="relative w-full h-full border rounded overflow-hidden bg-gray-50">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center',
          touchAction: 'none'
        }}
      >
        {/* Arrow markers */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#000000"
            />
          </marker>
        </defs>

        {/* Connections */}
        {connections.map((conn, index) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          const fromCenterX = fromNode.x + fromNode.width / 2;
          const fromCenterY = fromNode.y + fromNode.height / 2;
          const toCenterX = toNode.x + toNode.width / 2;
          const toCenterY = toNode.y + toNode.height / 2;

          return (
            <line
              key={index}
              x1={fromCenterX}
              y1={fromCenterY}
              x2={toCenterX}
              y2={toCenterY}
              stroke="#000000"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Node rectangle */}
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill="#e5e7eb"
              stroke="#cccccc"
              strokeWidth="2"

              className="cursor-pointer hover:fill-gray-100"
              onClick={(e) => handleNodeClick(node, e)}
              onContextMenu={(e) => handleNodeContextMenu(node, e)}
              onDoubleClick={(e) => handleNodeDoubleClick(node, e)}
            />

            {/* Node text */}
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height / 2}
              textAnchor="middle"
              dy="0.35em"
              fill="#000000"
              fontSize={node.level === 0 ? "14" : node.level === 1 ? "12" : "10"}
              fontWeight="600"
              className="pointer-events-none"
            >
              {wrapText(node.title, node.width - 16, parseInt(node.level === 0 ? "14" : node.level === 1 ? "12" : "10")).map((line, i) => (
                <tspan key={i} x={node.x + node.width / 2} dy={i === 0 ? 0 : '1.2em'}>{line}</tspan>
              ))}
            </text>
          </g>
        ))}
      </svg>

      {/* Edit Dialog */}
      <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Node title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Detailed description"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNode(null)}>
                Cancel
              </Button>
              <Button onClick={saveNodeEdit}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}