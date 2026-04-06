// ============================================================
// AGENT NETWORK GRAPH
// Visualizes agents as nodes and their interactions as edges.
//
// What it shows:
//   - Every agent as a node (color = their current status)
//   - Every handoff as a directed edge (source → target)
//   - In-transit handoffs animate along the edge
//   - Parent/child agent relationships as dashed edges
//   - Workflow assignment shown inside each node
//   - Clicking a node opens a detail drawer
//
// Data sources:
//   - snapshot.agents   → nodes
//   - snapshot.handoffs → edges (handoff.initiated/received/completed)
//   - parent/child links from agent.parentAgentId
// ============================================================

import React, { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Agent, Handoff, ProjectStateSnapshot } from '@dashboard/core';

// ---- Status → color mapping ----
function agentStatusColor(status: string) {
  switch (status) {
    case 'running':  return { bg: '#22c55e18', border: '#22c55e', dot: '#22c55e' };
    case 'waiting':  return { bg: '#eab30818', border: '#eab308', dot: '#eab308' };
    case 'blocked':  return { bg: '#ef444418', border: '#ef4444', dot: '#ef4444' };
    case 'error':    return { bg: '#ef444430', border: '#ef4444', dot: '#ef4444' };
    case 'idle':     return { bg: '#ffffff08', border: '#2a3347',  dot: '#ffffff30' };
    case 'offline':  return { bg: '#ffffff05', border: '#1e2535',  dot: '#ffffff15' };
    default:         return { bg: '#ffffff08', border: '#2a3347',  dot: '#ffffff30' };
  }
}

// ---- Custom Agent Node ----
// We use a custom node so we can show status dot, name, role, and current task clearly.
interface AgentNodeData {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

function AgentNode({ data }: { data: AgentNodeData }) {
  const { agent, onSelect } = data;
  const colors = agentStatusColor(agent.status);
  const isPulsing = agent.status === 'running' || agent.status === 'waiting';

  return (
    // The node div itself — clicking opens the detail drawer
    <div
      onClick={() => onSelect(agent)}
      style={{
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 10,
        padding: '8px 12px',
        minWidth: 160,
        maxWidth: 190,
        cursor: 'pointer',
        fontFamily: 'monospace',
        userSelect: 'none',
      }}
    >
      {/* React Flow connection handles — invisible but required */}
      <Handle type="target" position={Position.Left}  style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      {/* Header: status dot + agent name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {/* Pulsing status dot */}
        <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
          {isPulsing && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: colors.dot, opacity: 0.4,
              animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            }} />
          )}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: colors.dot,
          }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffffcc' }}>
          {agent.name}
        </span>
      </div>

      {/* Agent type */}
      <div style={{ fontSize: 9, color: '#ffffff40', marginBottom: 3 }}>
        {agent.type}
      </div>

      {/* Status badge */}
      <div style={{
        display: 'inline-block',
        fontSize: 8,
        fontWeight: 600,
        letterSpacing: '0.05em',
        color: colors.dot,
        background: `${colors.dot}18`,
        border: `1px solid ${colors.dot}40`,
        borderRadius: 3,
        padding: '1px 5px',
        marginBottom: 4,
        textTransform: 'uppercase',
      }}>
        {agent.status}
      </div>

      {/* Current task (truncated) */}
      {agent.currentTaskId && (
        <div style={{ fontSize: 9, color: '#3b82f680', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ◆ {agent.currentTaskId}
        </div>
      )}

      {/* Current workflow stage */}
      {agent.currentStageId && (
        <div style={{ fontSize: 9, color: '#a855f760', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ⬡ {agent.currentStageId}
        </div>
      )}
    </div>
  );
}

// Register the custom node type
const NODE_TYPES: NodeTypes = {
  agentNode: AgentNode as any,
};

// ---- Detail Drawer ----
function AgentDetailDrawer({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const colors = agentStatusColor(agent.status);
  const startedAt = new Date(agent.startedAt).toLocaleTimeString();
  const lastSeen = new Date(agent.lastSeenAt).toLocaleTimeString();

  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0,
      width: 280, background: '#161b27',
      borderLeft: '1px solid #2a3347',
      padding: 16, overflowY: 'auto', zIndex: 10,
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffffcc' }}>{agent.name}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#ffffff40', cursor: 'pointer', fontSize: 14 }}
        >
          ✕
        </button>
      </div>

      {[
        ['ID',       agent.id],
        ['Type',     agent.type],
        ['Status',   agent.status],
        ['Session',  agent.sessionId],
        ['Started',  startedAt],
        ['Last seen', lastSeen],
        ['Parent',   agent.parentAgentId ?? '—'],
        ['Workflow', agent.currentWorkflowId ?? '—'],
        ['Stage',    agent.currentStageId ?? '—'],
        ['Task',     agent.currentTaskId ?? '—'],
      ].map(([label, value]) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9, color: '#ffffff30', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            {label}
          </div>
          <div style={{ fontSize: 10, color: '#ffffff70', wordBreak: 'break-all' }}>
            {value}
          </div>
        </div>
      ))}

      {agent.capabilities.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9, color: '#ffffff30', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Capabilities
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {agent.capabilities.map(cap => (
              <span key={cap.name} style={{
                fontSize: 9, color: '#06b6d480',
                background: '#06b6d410', border: '1px solid #06b6d430',
                borderRadius: 3, padding: '2px 6px',
              }}>
                {cap.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {agent.errorMessage && (
        <div style={{ marginTop: 8, padding: 8, background: '#ef444415', border: '1px solid #ef444430', borderRadius: 6 }}>
          <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>ERROR</div>
          <div style={{ fontSize: 10, color: '#ef444490' }}>{agent.errorMessage}</div>
        </div>
      )}
    </div>
  );
}

// ---- Layout helper ----
// Positions agents so they never overlap and always fit in view.
// Roots sit in a row at y=0, centred over their children.
// Children are spread evenly below their parent.
function layoutAgents(agents: Agent[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const NODE_W = 190;
  const NODE_H = 110;
  const COL_GAP = 80;   // horizontal gap between sibling nodes
  const ROW_GAP = 100;  // vertical gap between parent and children rows

  const roots    = agents.filter(a => !a.parentAgentId);
  const children = agents.filter(a =>  a.parentAgentId);

  // Group children by parent
  const childrenByParent = new Map<string, Agent[]>();
  children.forEach(agent => {
    const pid = agent.parentAgentId!;
    const group = childrenByParent.get(pid) ?? [];
    group.push(agent);
    childrenByParent.set(pid, group);
  });

  // Calculate total width needed for children of a parent
  // so we can centre the parent over them
  function childrenWidth(parentId: string): number {
    const kids = childrenByParent.get(parentId) ?? [];
    if (kids.length === 0) return NODE_W;
    return kids.length * NODE_W + (kids.length - 1) * COL_GAP;
  }

  // Total width of all roots (each root spans its children)
  let cursor = 0;
  roots.forEach(root => {
    const spanW = childrenWidth(root.id);
    const rootX = cursor + (spanW - NODE_W) / 2;
    positions.set(root.id, { x: rootX, y: 0 });

    // Place children in a row below, centred under parent
    const kids = childrenByParent.get(root.id) ?? [];
    kids.forEach((child, i) => {
      positions.set(child.id, {
        x: cursor + i * (NODE_W + COL_GAP),
        y: NODE_H + ROW_GAP,
      });
    });

    cursor += spanW + COL_GAP;
  });

  // Handle orphan roots that have no children — just place them in sequence
  // (already handled above since childrenWidth returns NODE_W when no kids)

  return positions;
}

// ---- Main component ----
interface AgentNetworkGraphProps {
  snapshot: ProjectStateSnapshot;
  height?: number;
}

export function AgentNetworkGraph({ snapshot, height = 420 }: AgentNetworkGraphProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Build nodes and edges from snapshot
  const { initialNodes, initialEdges } = useMemo(() => {
    const { agents, handoffs } = snapshot;
    const positions = layoutAgents(agents);

    // ---- Nodes: one per agent ----
    const initialNodes: Node[] = agents.map(agent => {
      const pos = positions.get(agent.id) ?? { x: 0, y: 0 };
      return {
        id: agent.id,
        type: 'agentNode',
        position: pos,
        data: {
          agent,
          onSelect: (a: Agent) => setSelectedAgent(prev => prev?.id === a.id ? null : a),
        },
      };
    });

    // ---- Edges: one per handoff + parent/child links ----
    const initialEdges: Edge[] = [];

    // Handoff edges
    handoffs.forEach(handoff => {
      const fromId = handoff.fromAgentId;
      const toId = handoff.toAgentId;
      if (!fromId || !toId) return;
      if (!agents.find(a => a.id === fromId)) return;
      if (!agents.find(a => a.id === toId)) return;

      const isActive = handoff.status === 'in-transit';
      const isComplete = handoff.status === 'completed';

      initialEdges.push({
        id: `handoff_${handoff.id}`,
        source: fromId,
        target: toId,
        label: handoff.status === 'in-transit' ? 'handoff' : undefined,
        labelStyle: { fontSize: 9, fontFamily: 'monospace', fill: '#eab30890' },
        labelBgStyle: { fill: '#0f1117', fillOpacity: 0.9 },
        labelBgPadding: [4, 6] as [number, number],
        animated: isActive,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? '#eab308' : isComplete ? '#3b82f6' : '#2a3347',
          width: 14,
          height: 14,
        },
        style: {
          stroke: isActive ? '#eab308' : isComplete ? '#3b82f660' : '#2a334760',
          strokeWidth: isActive ? 2 : 1.5,
          strokeDasharray: isActive ? undefined : '4 3',
        },
      });
    });

    // Parent → child edges (spawn relationship)
    agents.forEach(agent => {
      if (!agent.parentAgentId) return;
      if (!agents.find(a => a.id === agent.parentAgentId)) return;
      // Don't duplicate if there's already a handoff edge between these two
      const alreadyHasHandoff = initialEdges.some(
        e => e.source === agent.parentAgentId && e.target === agent.id
      );
      if (alreadyHasHandoff) return;

      initialEdges.push({
        id: `spawn_${agent.parentAgentId}_${agent.id}`,
        source: agent.parentAgentId,
        target: agent.id,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ffffff20', width: 10, height: 10 },
        style: { stroke: '#ffffff15', strokeWidth: 1, strokeDasharray: '3 4' },
        label: 'spawned',
        labelStyle: { fontSize: 8, fontFamily: 'monospace', fill: '#ffffff25' },
        labelBgStyle: { fill: '#0f1117', fillOpacity: 0.7 },
      });
    });

    return { initialNodes, initialEdges };
  }, [snapshot.agents, snapshot.handoffs]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (snapshot.agents.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f1117', borderRadius: 8, border: '1px solid #2a3347',
        color: '#ffffff20', fontSize: 12, fontFamily: 'monospace',
      }}>
        No agents yet — start a workflow to see the network
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height, background: '#0f1117', borderRadius: 8, border: '1px solid #2a3347', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        nodesDraggable
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0f1117' }}
      >
        <Background color="#1e2535" gap={28} size={1} />
        <Controls
          style={{ background: '#161b27', border: '1px solid #2a3347' }}
          showInteractive={false}
        />
        <MiniMap
          position="bottom-left"
          style={{ background: '#161b27', border: '1px solid #2a3347' }}
          nodeColor={(node) => {
            const agent = (node.data as any)?.agent as Agent | undefined;
            return agent ? agentStatusColor(agent.status).dot : '#2a3347';
          }}
          maskColor="#0f111760"
        />
      </ReactFlow>

      {/* Legend */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 5,
        background: '#161b27cc', border: '1px solid #2a3347',
        borderRadius: 6, padding: '6px 10px',
        fontFamily: 'monospace', fontSize: 9,
      }}>
        {[
          { color: '#22c55e', label: 'running' },
          { color: '#eab308', label: 'waiting / in-transit handoff' },
          { color: '#ef4444', label: 'blocked / error' },
          { color: '#ffffff30', label: 'idle / spawned link' },
          { color: '#3b82f660', label: 'completed handoff' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ color: '#ffffff50' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Detail drawer slides in from the right when an agent is selected */}
      {selectedAgent && (
        <AgentDetailDrawer
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
