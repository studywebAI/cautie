'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pen, Eraser } from 'lucide-react';

type MindmapNode = {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
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

const DRAWING_COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#FFFF00', // Yellow
  '#0000FF', // Blue
  '#00FF00', // Green
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
];

const NODE_COLORS = [
  '#e5e7eb', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3',
  '#fed7aa', '#ddd6fe', '#cffafe'
];

export function ProfessionalMindmapRenderer({ data, title }: ProfessionalMindmapRendererProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [mindmapData, setMindmapData] = useState<MindmapData>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`mindmap-${title || data.central}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load saved mindmap:', e);
        }
      }
    }
    return {
      ...data,
      customNodes: data.customNodes || [],
      customConnections: data.customConnections || []
    };
  });

  // Save to localStorage whenever mindmapData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`mindmap-${title || data.central}`, JSON.stringify(mindmapData));
    }
  }, [mindmapData, title, data.central]);

  // Node editing state
  const [editingNode, setEditingNode] = useState<MindmapNode | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');

  // Node dragging state
  const [draggingNode, setDraggingNode] = useState<MindmapNode | null>(null);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });

  // Connection creation state
  const [connectionMode, setConnectionMode] = useState(false);
  const [firstSelectedNode, setFirstSelectedNode] = useState<MindmapNode | null>(null);
  const [connectionColor, setConnectionColor] = useState('#374151');

  // Add node dialog
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeColor, setNewNodeColor] = useState(NODE_COLORS[0]);

  // Drawing state - only activated on right-click
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingPath, setDrawingPath] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [eraserMode, setEraserMode] = useState(false);
  const [circleEraserMode, setCircleEraserMode] = useState(false);
  const [circleStart, setCircleStart] = useState<{x: number, y: number} | null>(null);
  const [allDrawingPaths, setAllDrawingPaths] = useState<Array<{path: string[], color: string, id: string}>>(() => {
    // Load saved drawings
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`mindmap-drawings-${title || data.central}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load saved drawings:', e);
        }
      }
    }
    return [];
  });

  // Save drawings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`mindmap-drawings-${title || data.central}`, JSON.stringify(allDrawingPaths));
    }
  }, [allDrawingPaths, title, data.central]);

  const svgRef = useRef<SVGSVGElement>(null);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (touch.clientX - rect.left - pan.x) / zoom;
      const y = (touch.clientY - rect.top - pan.y) / zoom;
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      setIsDragging(true);
    }
  }, [pan, zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [dragStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Calculate dimensions
  const sidebarWidth = 280;
  const containerPadding = 40;
  const availableWidth = typeof window !== 'undefined' ? window.innerWidth - sidebarWidth - containerPadding * 2 : 800;
  const availableHeight = typeof window !== 'undefined' ? window.innerHeight - 300 : 600;
  const size = Math.min(availableWidth, availableHeight);
  const svgWidth = size;
  const svgHeight = size;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Build nodes from data - now includes branches and subs
  const nodes = React.useMemo(() => {
    const allNodes: MindmapNode[] = [];

    // Central node
    const centralText = title || data.central;
    const centralWidth = Math.max(140, Math.min(220, centralText.length * 10));
    const centralHeight = 70;

    allNodes.push({
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

    // Add branch nodes
    if (data.branches && data.branches.length > 0) {
      const branchCount = data.branches.length;
      const radius = 200;
      const angleStep = (2 * Math.PI) / branchCount;

      data.branches.forEach((branch, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const width = Math.max(100, branch.topic.length * 8);
        const height = 50;

        allNodes.push({
          id: `branch-${index}`,
          title: branch.topic,
          description: `Branch: ${branch.topic}`,
          x: x - width / 2,
          y: y - height / 2,
          width,
          height,
          level: 1,
          color: NODE_COLORS[index % NODE_COLORS.length]
        });

        // Add sub-nodes
        if (branch.subs && branch.subs.length > 0) {
          const subRadius = 120;
          const subAngleStep = Math.PI / 6; // Spread subs around the branch
          const baseAngle = angle;

          branch.subs.forEach((sub, subIndex) => {
            const subAngle = baseAngle + (subIndex - (branch.subs!.length - 1) / 2) * subAngleStep;
            const subX = x + Math.cos(subAngle) * subRadius;
            const subY = y + Math.sin(subAngle) * subRadius;
            const subWidth = Math.max(80, sub.length * 6);
            const subHeight = 40;

            allNodes.push({
              id: `sub-${index}-${subIndex}`,
              title: sub,
              description: `Sub-topic: ${sub}`,
              x: subX - subWidth / 2,
              y: subY - subHeight / 2,
              width: subWidth,
              height: subHeight,
              level: 2,
              color: NODE_COLORS[(index + subIndex) % NODE_COLORS.length]
            });
          });
        }
      });
    }

    // Add custom nodes
    mindmapData.customNodes?.forEach(node => {
      allNodes.push(node);
    });

    return allNodes;
  }, [mindmapData, data, title, centerX, centerY]);

  const connections = React.useMemo(() => {
    const allConnections: MindmapConnection[] = [];

    // Add connections from branches to center
    if (data.branches) {
      data.branches.forEach((branch, index) => {
        allConnections.push({
          id: `conn-central-branch-${index}`,
          from: 'central',
          to: `branch-${index}`,
          color: '#6b7280'
        });

        // Add connections from subs to branches
        if (branch.subs) {
          branch.subs.forEach((sub, subIndex) => {
            allConnections.push({
              id: `conn-branch-${index}-sub-${subIndex}`,
              from: `branch-${index}`,
              to: `sub-${index}-${subIndex}`,
              color: '#9ca3af'
            });
          });
        }
      });
    }

    // Add custom connections
    if (mindmapData.customConnections) {
      allConnections.push(...mindmapData.customConnections);
    }

    return allConnections;
  }, [mindmapData.customConnections, data.branches]);

  // Event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drawing on right-click when drawing mode is active
    if (drawingMode && e.button === 2 && e.target === svgRef.current) {
      e.preventDefault();
      setIsDrawing(true);
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setDrawingPath([`M ${x} ${y}`]);
      }
    } else if (e.target === svgRef.current && e.button === 0) {
      // Left click for panning
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [drawingMode, pan, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDrawing && drawingMode) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setDrawingPath(prev => [...prev, `L ${x} ${y}`]);
      }
    } else if (draggingNode) {
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
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDrawing, drawingMode, draggingNode, isDragging, pan, zoom, dragStart, nodeDragStart]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && drawingPath.length > 1) {
      // Save the completed drawing path
      const newPath = {
        path: drawingPath,
        color: eraserMode ? '#ffffff' : drawingColor,
        id: `drawing-${Date.now()}`
      };
      setAllDrawingPaths(prev => [...prev, newPath]);
      setDrawingPath([]);
    }
    setIsDragging(false);
    setDraggingNode(null);
    setIsDrawing(false);
  }, [isDrawing, drawingPath, drawingColor, eraserMode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * zoomFactor)));
  }, []);

  const handleNodeDoubleClick = useCallback((node: MindmapNode, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    e.stopPropagation();

    // Start editing the node title
    setEditingNode(node);
    setEditTitle(node.title);
    setEditDescription(node.description);
    setEditColor(node.color || NODE_COLORS[0]);
  }, []);

  const handleNodeClick = useCallback((node: MindmapNode, e: React.MouseEvent) => {
    e.stopPropagation();

    if (connectionMode) {
      if (!firstSelectedNode) {
        setFirstSelectedNode(node);
      } else if (firstSelectedNode.id !== node.id) {
        // Create connection
        const newConnection: MindmapConnection = {
          id: `conn-${firstSelectedNode.id}-${node.id}-${Date.now()}`,
          from: firstSelectedNode.id,
          to: node.id,
          color: connectionColor
        };

        setMindmapData(prev => ({
          ...prev,
          customConnections: [...(prev.customConnections || []), newConnection]
        }));

        setFirstSelectedNode(null);
        setConnectionMode(false);
      }
    }
  }, [connectionMode, firstSelectedNode, connectionColor]);

  const handleNodeContextMenu = useCallback((node: MindmapNode, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node
    });
  }, []);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY
      });
    }
  }, []);

  const handleNodeMouseDown = useCallback((node: MindmapNode, e: React.MouseEvent) => {
    if (e.button === 0) { // Left click for dragging
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
  }, [pan, zoom]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node?: MindmapNode;
  } | null>(null);

  // Context menu actions
  const editNode = useCallback((node: MindmapNode) => {
    setEditingNode(node);
    setEditTitle(node.title);
    setEditDescription(node.description);
    setEditColor(node.color || NODE_COLORS[0]);
    setContextMenu(null);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setMindmapData(prev => ({
      ...prev,
      customNodes: prev.customNodes?.filter(node => node.id !== nodeId) || [],
      customConnections: prev.customConnections?.filter(conn =>
        conn.from !== nodeId && conn.to !== nodeId
      ) || []
    }));
    setContextMenu(null);
  }, []);

  const deleteConnection = useCallback((connectionId: string) => {
    setMindmapData(prev => ({
      ...prev,
      customConnections: prev.customConnections?.filter(conn => conn.id !== connectionId) || []
    }));
    setContextMenu(null);
  }, []);

  const addConnection = useCallback((node: MindmapNode) => {
    setFirstSelectedNode(node);
    setConnectionMode(true);
    setContextMenu(null);
  }, []);

  const saveNodeEdit = useCallback(() => {
    if (editingNode) {
      setMindmapData(prev => ({
        ...prev,
        customNodes: prev.customNodes?.map(node =>
          node.id === editingNode.id
            ? { ...node, title: editTitle, description: editDescription, color: editColor }
            : node
        ) || []
      }));
      setEditingNode(null);
    }
  }, [editingNode, editTitle, editDescription, editColor]);

  const addNewNode = useCallback(() => {
    if (newNodeTitle.trim()) {
      const newNode: MindmapNode = {
        id: `custom-${Date.now()}`,
        title: newNodeTitle,
        description: `Custom node: ${newNodeTitle}`,
        x: centerX + Math.random() * 200 - 100,
        y: centerY + Math.random() * 200 - 100,
        width: Math.max(100, newNodeTitle.length * 8),
        height: 50,
        level: -1,
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
  }, [newNodeTitle, newNodeColor, centerX, centerY]);

  const wrapText = useCallback((text: string, maxWidth: number, fontSize: number = 12) => {
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
  }, []);

  return (
    <div className="relative w-full h-full border rounded overflow-hidden bg-background select-none">
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={() => setShowAddNodeDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Node
        </Button>

        {connectionMode ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {firstSelectedNode ? 'Click second node' : 'Click first node'}
            </span>
            <Select value={connectionColor} onValueChange={setConnectionColor}>
              <SelectTrigger className="w-20">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: connectionColor }}
                />
              </SelectTrigger>
              <SelectContent>
                {['#374151', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#c026d3'].map(color => (
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
              onClick={() => {
                setConnectionMode(false);
                setFirstSelectedNode(null);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConnectionMode(true)}
          >
            Connect Nodes
          </Button>
        )}

        {/* Drawing controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={drawingMode ? "default" : "outline"}
            onClick={() => setDrawingMode(!drawingMode)}
          >
            <Pen className="h-4 w-4" />
          </Button>

          {drawingMode && (
            <>
              <Select value={drawingColor} onValueChange={setDrawingColor}>
                <SelectTrigger className="w-16">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: drawingColor }}
                  />
                </SelectTrigger>
                <SelectContent>
                  {DRAWING_COLORS.map(color => (
                    <SelectItem key={color} value={color}>
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant={eraserMode ? "default" : "outline"}
                onClick={() => setEraserMode(!eraserMode)}
              >
                <Eraser className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setAllDrawingPaths([])}
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className={drawingMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onContextMenu={handleCanvasContextMenu}
        style={{ touchAction: 'none' }}
      >
        <g
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center'
          }}
        >
          {/* Drawing paths */}
          {allDrawingPaths.map((drawing) => (
            <path
              key={drawing.id}
              d={drawing.path.join(' ')}
              stroke={drawing.color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Current drawing path */}
          {drawingPath.length > 0 && (
            <path
              d={drawingPath.join(' ')}
              stroke={eraserMode ? '#ffffff' : drawingColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

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
              <polygon points="0 0, 10 3.5, 0 7" fill="#000000" />
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

            return (
              <line
                key={conn.id}
                x1={fromCenterX}
                y1={fromCenterY}
                x2={toCenterX}
                y2={toCenterY}
                stroke={conn.color || '#6b7280'}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                className="drop-shadow-sm"
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
                fill={node.color || '#e5e7eb'}
                stroke={firstSelectedNode?.id === node.id ? '#2563eb' : '#cccccc'}
                strokeWidth={firstSelectedNode?.id === node.id ? '3' : '2'}
                className="cursor-move hover:stroke-gray-400"
                onClick={(e) => handleNodeClick(node, e)}
                onDoubleClick={(e) => handleNodeDoubleClick(node, e)}
                onContextMenu={(e) => handleNodeContextMenu(node, e)}
                onMouseDown={(e) => handleNodeMouseDown(node, e)}
              />

              {/* Node text */}
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2}
                textAnchor="middle"
                dy="0.35em"
                fill="#000000"
                fontSize={node.level === 0 ? "14" : node.level === 1 ? "12" : "11"}
                fontWeight="600"
                className="pointer-events-none select-none"
                style={{ userSelect: 'none' }}
              >
                {wrapText(node.title, node.width - 16, parseInt(node.level === 0 ? "14" : node.level === 1 ? "12" : "11")).map((line, i) => (
                  <tspan key={i} x={node.x + node.width / 2} dy={i === 0 ? 0 : '1.1em'}>{line}</tspan>
                ))}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="absolute z-50 bg-white border rounded shadow-lg py-1 min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          {contextMenu.node ? (
            <>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => editNode(contextMenu.node!)}
              >
                Edit Node
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => addConnection(contextMenu.node!)}
              >
                Add Connection
              </button>
              {contextMenu.node.level === -1 && (
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                  onClick={() => deleteNode(contextMenu.node!.id)}
                >
                  Delete Node
                </button>
              )}
            </>
          ) : (
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => setShowAddNodeDialog(true)}
            >

            </button>
          )}
        </div>
      )}

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