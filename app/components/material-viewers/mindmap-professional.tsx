'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  '#374151', '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
  '#0891b2', '#2563eb', '#7c3aed', '#c026d3'
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

  const [mindmapData, setMindmapData] = useState<MindmapData>({
    ...data,
    customNodes: data.customNodes || [],
    customConnections: data.customConnections || []
  });

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
  const [connectionColor, setConnectionColor] = useState(CONNECTION_COLORS[0]);

  // Add node dialog
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeColor, setNewNodeColor] = useState(NODE_COLORS[0]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node?: MindmapNode;
    connection?: MindmapConnection;
  } | null>(null);

  // Drawing state
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingPath, setDrawingPath] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

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

  // Build nodes from data
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

    // Add custom nodes
    mindmapData.customNodes?.forEach(node => {
      allNodes.push(node);
    });

    return allNodes;
  }, [mindmapData, data, title, centerX, centerY]);

  const connections = React.useMemo(() => {
    return mindmapData.customConnections || [];
  }, [mindmapData.customConnections]);

  // Event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (drawingMode && e.target === svgRef.current) {
      setIsDrawing(true);
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setDrawingPath([`M ${x} ${y}`]);
      }
    } else if (e.target === svgRef.current) {
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
    setIsDragging(false);
    setDraggingNode(null);
    setIsDrawing(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * zoomFactor)));
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
    <div className="relative w-full h-full border rounded overflow-hidden bg-gray-50">
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
            <span className="text-sm text-gray-600">
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

        <Button
          size="sm"
          variant={drawingMode ? "default" : "outline"}
          onClick={() => setDrawingMode(!drawingMode)}
        >
          {drawingMode ? 'Stop Drawing' : 'Draw'}
        </Button>
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
          {drawingPath.length > 0 && (
            <path
              d={drawingPath.join(' ')}
              stroke="#000000"
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
              <g key={conn.id}>
                <line
                  x1={fromCenterX}
                  y1={fromCenterY}
                  x2={toCenterX}
                  y2={toCenterY}
                  stroke={conn.color || CONNECTION_COLORS[0]}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                  className="drop-shadow-sm"
                />
                {/* Delete button */}
                <circle
                  cx={(fromCenterX + toCenterX) / 2}
                  cy={(fromCenterY + toCenterY) / 2}
                  r="8"
                  fill="red"
                  className="cursor-pointer hover:opacity-100 opacity-70"
                  onClick={() => deleteConnection(conn.id)}
                />
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
                stroke={firstSelectedNode?.id === node.id ? '#2563eb' : '#cccccc'}
                strokeWidth={firstSelectedNode?.id === node.id ? '3' : '2'}
                className="cursor-move hover:stroke-gray-400"
                onClick={(e) => handleNodeClick(node, e)}
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
                fontSize={node.level === 0 ? "14" : "12"}
                fontWeight="600"
                className="pointer-events-none"
              >
                {wrapText(node.title, node.width - 16, parseInt(node.level === 0 ? "14" : "12")).map((line, i) => (
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
                  className="cursor-pointer hover:opacity-100 opacity-70"
                  onClick={() => deleteNode(node.id)}
                />
              )}
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
              Add Node Here
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