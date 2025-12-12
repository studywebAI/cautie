'use client';
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  color?: string;
};

type MindmapConnection = {
  id: string;
  from: string;
  to: string;
  color?: string;
};

type MindmapData = {
  type: 'mindmap';
  central: string;
  branches: Array<{
    topic: string;
    subs?: string[];
  }>;
  customNodes?: MindmapNode[];
  customConnections?: MindmapConnection[];
};

type ProfessionalMindmapRendererProps = {
  data: MindmapData;
  title?: string;
};

const CONNECTION_COLORS = [
  '#374151', // gray-700
  '#dc2626', // red-600
  '#ea580c', // orange-600
  '#ca8a04', // yellow-600
  '#16a34a', // green-600
  '#0891b2', // cyan-600
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#c026d3', // fuchsia-600
];

const NODE_COLORS = [
  '#e5e7eb', // gray-200
  '#fef3c7', // yellow-100
  '#dbeafe', // blue-100
  '#dcfce7', // green-100
  '#fce7f3', // pink-100
  '#fed7aa', // orange-200
  '#ddd6fe', // violet-200
  '#cffafe', // cyan-100
];

export function ProfessionalMindmapRenderer({ data, title }: ProfessionalMindmapRendererProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [editingNode, setEditingNode] = useState<MindmapNode | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');
  const [expandedNode, setExpandedNode] = useState<MindmapNode | null>(null);
  const [mindmapData, setMindmapData] = useState<MindmapData>({
    ...data,
    customNodes: data.customNodes || [],
    customConnections: data.customConnections || []
  });

  // Node dragging state
  const [draggingNode, setDraggingNode] = useState<MindmapNode | null>(null);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });

  // Connection creation state
  const [creatingConnection, setCreatingConnection] = useState<MindmapNode | null>(null);
  const [connectionColor, setConnectionColor] = useState(CONNECTION_COLORS[0]);

  // Add node dialog
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeColor, setNewNodeColor] = useState(NODE_COLORS[0]);

  const svgRef = useRef<SVGSVGElement>(null);

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
      level: 0,
      color: '#e5e7eb'
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
        parentId: 'central',
        color: '#e5e7eb'
      });

      connections.push({
        id: `conn-central-branch-${index}`,
        from: 'central',
        to: `branch-${index}`,
        color: CONNECTION_COLORS[0]
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
          parentId: `branch-${index}`,
          color: '#e5e7eb'
        });

        connections.push({
          id: `conn-branch-${index}-sub-${index}-${subIndex}`,
          from: `branch-${index}`,
          to: `sub-${index}-${subIndex}`,
          color: CONNECTION_COLORS[0]
        });
      });
    });

    // Add custom nodes
    mindmapData.customNodes?.forEach(node => {
      nodes.push(node);
    });

    // Add custom connections
    mindmapData.customConnections?.forEach(conn => {
      connections.push(conn);
    });

    return { nodes, connections };
  };

  const { nodes, connections } = buildNodes();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      // Handle node dragging
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const svgX = (e.clientX - rect.left - pan.x) / zoom;
        const svgY = (e.clientY - rect.top - pan.y) / zoom;
        const deltaX = svgX - nodeDragStart.x;
        const deltaY = svgY - nodeDragStart.y;

        setMindmapData(prev => ({
          ...prev,
          customNodes: prev.customNodes?.map(node =>
            node.id === draggingNode.id
              ? { ...node, x: node.x + deltaX, y: node.y + deltaY }
              : node
          ) || []
        }));

        setNodeDragStart({ x: svgX, y: svgY });
      }
    } else if (isDragging) {
      // Handle canvas panning
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingNode(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * zoomFactor)));
  };

  const handleNodeClick = (node: MindmapNode, e: React.MouseEvent) => {
    e.stopPropagation();

    if (creatingConnection) {
      // Create connection between nodes
      if (creatingConnection.id !== node.id) {
        const newConnection: MindmapConnection = {
          id: `conn-${creatingConnection.id}-${node.id}-${Date.now()}`,
          from: creatingConnection.id,
          to: node.id,
          color: connectionColor
        };

        setMindmapData(prev => ({
          ...prev,
          customConnections: [...(prev.customConnections || []), newConnection]
        }));
      }
      setCreatingConnection(null);
    } else {
      // Toggle expanded state for detailed view
      setExpandedNode(expandedNode?.id === node.id ? null : node);
    }
  };

  const handleNodeContextMenu = (node: MindmapNode, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingNode(node);
    setEditTitle(node.title);
    setEditDescription(node.description);
    setEditColor(node.color || NODE_COLORS[0]);
  };

  const handleNodeDoubleClick = (node: MindmapNode, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingNode(node);
    setEditTitle(node.title);
    setEditDescription(node.description);
    setEditColor(node.color || NODE_COLORS[0]);
  };

  const handleNodeMouseDown = (node: MindmapNode, e: React.MouseEvent) => {
    if (e.button === 0 && node.level === -1) { // Only custom nodes are draggable
      e.stopPropagation();
      setDraggingNode(node);
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setNodeDragStart({
          x: (e.clientX - rect.left - pan.x) / zoom,
          y: (e.clientY - rect.top - pan.y) / zoom
        });
      }
    }
  };

  const saveNodeEdit = () => {
    if (editingNode) {
      if (editingNode.level === -1) {
        // Custom node
        setMindmapData(prev => ({
          ...prev,
          customNodes: prev.customNodes?.map(node =>
            node.id === editingNode.id
              ? { ...node, title: editTitle, description: editDescription, color: editColor }
              : node
          ) || []
        }));
      } else {
        // Built-in node - update the original data structure
        setMindmapData(prevData => {
          const newData = { ...prevData };

          if (editingNode.id === 'central') {
            newData.central = editTitle;
          } else if (editingNode.id.startsWith('branch-')) {
            const branchIndex = parseInt(editingNode.id.split('-')[1]);
            if (newData.branches[branchIndex]) {
              newData.branches[branchIndex].topic = editTitle;
            }
          } else if (editingNode.id.startsWith('sub-')) {
            const parts = editingNode.id.split('-');
            const branchIndex = parseInt(parts[1]);
            const subIndex = parseInt(parts[2]);
            if (newData.branches[branchIndex]?.subs?.[subIndex]) {
              newData.branches[branchIndex].subs![subIndex] = editTitle;
            }
          }

          return newData;
        });
      }
      setEditingNode(null);
    }
  };

  const addNewNode = () => {
    if (newNodeTitle.trim()) {
      const newNode: MindmapNode = {
        id: `custom-${Date.now()}`,
        title: newNodeTitle,
        description: `Custom node: ${newNodeTitle}`,
        x: centerX + Math.random() * 200 - 100,
        y: centerY + Math.random() * 200 - 100,
        width: Math.max(100, newNodeTitle.length * 8),
        height: 50,
        level: -1, // Custom nodes have level -1
        color: newNodeColor
      };

      setMindmapData(prev => ({
        ...prev,
        customNodes: [...(prev.customNodes || []), newNode]
      }));

      setNewNodeTitle('');
      setNewNodeColor(NODE_COLORS[0]);
      setShowAddNodeDialog(false);
    }
  };

  const deleteNode = (nodeId: string) => {
    setMindmapData(prev => ({
      ...prev,
      customNodes: prev.customNodes?.filter(node => node.id !== nodeId) || [],
      customConnections: prev.customConnections?.filter(conn =>
        conn.from !== nodeId && conn.to !== nodeId
      ) || []
    }));
  };

  const deleteConnection = (connectionId: string) => {
    setMindmapData(prev => ({
      ...prev,
      customConnections: prev.customConnections?.filter(conn => conn.id !== connectionId) || []
    }));
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
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <Button
          size="sm"
          onClick={() => setShowAddNodeDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Node
        </Button>
        {creatingConnection ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Click a node to connect</span>
            <Select value={connectionColor} onValueChange={setConnectionColor}>
              <SelectTrigger className="w-20">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: connectionColor }}
                />
              </SelectTrigger>
              <SelectContent>
                {CONNECTION_COLORS.map(color => (
                  <SelectItem key={color} value={color}>
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreatingConnection(null)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCreatingConnection(nodes.find(n => n.level === -1) || null)}
          >
            Connect Nodes
          </Button>
        )}
      </div>

      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          touchAction: 'none'
        }}
      >
        <g
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center'
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
          {connections.map((conn) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const fromCenterX = fromNode.x + fromNode.width / 2;
            const fromCenterY = fromNode.y + fromNode.height / 2;
            const toCenterX = toNode.x + toNode.width / 2;
            const toCenterY = toNode.y + toNode.height / 2;

            // Calculate connection points on the edge of nodes
            const angle = Math.atan2(toCenterY - fromCenterY, toCenterX - fromCenterX);
            const fromRadius = Math.min(fromNode.width, fromNode.height) / 2 + 10;
            const toRadius = Math.min(toNode.width, toNode.height) / 2 + 10;

            const fromX = fromCenterX + Math.cos(angle) * fromRadius;
            const fromY = fromCenterY + Math.sin(angle) * toRadius;
            const toX = toCenterX - Math.cos(angle) * fromRadius;
            const toY = toCenterY - Math.sin(angle) * toRadius;

            return (
              <g key={conn.id}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={conn.color || CONNECTION_COLORS[0]}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                  className="drop-shadow-sm"
                />
                {/* Delete connection button for custom connections */}
                {conn.id.startsWith('conn-') && conn.id.includes('-custom-') && (
                  <circle
                    cx={(fromX + toX) / 2}
                    cy={(fromY + toY) / 2}
                    r="8"
                    fill="red"
                    className="cursor-pointer opacity-0 hover:opacity-100"
                    onClick={() => deleteConnection(conn.id)}
                  />
                )}
              </g>
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
                fill={node.color || '#e5e7eb'}
                stroke="#cccccc"
                strokeWidth="2"
                className={`cursor-pointer hover:stroke-gray-400 ${
                  node.level === -1 ? 'cursor-move' : ''
                }`}
                onClick={(e) => handleNodeClick(node, e)}
                onContextMenu={(e) => handleNodeContextMenu(node, e)}
                onDoubleClick={(e) => handleNodeDoubleClick(node, e)}
                onMouseDown={(e) => handleNodeMouseDown(node, e)}
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

              {/* Delete button for custom nodes */}
              {node.level === -1 && (
                <circle
                  cx={node.x + node.width - 8}
                  cy={node.y + 8}
                  r="6"
                  fill="red"
                  className="cursor-pointer opacity-0 hover:opacity-100"
                  onClick={() => deleteNode(node.id)}
                />
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* Add Node Dialog */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newNodeTitle}
                onChange={(e) => setNewNodeTitle(e.target.value)}
                placeholder="Node title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Select value={newNodeColor} onValueChange={setNewNodeColor}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: newNodeColor }}
                    />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {NODE_COLORS.map(color => (
                    <SelectItem key={color} value={color}>
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddNodeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addNewNode}>
                Add Node
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            {editingNode?.level === -1 && (
              <div>
                <label className="text-sm font-medium">Color</label>
                <Select value={editColor} onValueChange={setEditColor}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: editColor }}
                      />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {NODE_COLORS.map(color => (
                      <SelectItem key={color} value={color}>
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color }}
                        />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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