// ============================================================
// WORKFLOW GRAPH
// Visual stage-by-stage workflow view using React Flow.
// Shows progress, current stage, completed/failed stages.
// ============================================================

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Workflow } from '@dashboard/core';

// Color per stage status
function stageColors(status: string) {
  switch (status) {
    case 'active':    return { bg: '#22c55e20', border: '#22c55e', text: '#22c55e' };
    case 'completed': return { bg: '#3b82f620', border: '#3b82f6', text: '#3b82f6' };
    case 'failed':    return { bg: '#ef444420', border: '#ef4444', text: '#ef4444' };
    case 'skipped':   return { bg: '#ffffff10', border: '#ffffff30', text: '#ffffff40' };
    default:          return { bg: '#ffffff08', border: '#2a3347', text: '#ffffff50' };
  }
}

interface WorkflowGraphProps {
  workflow: Workflow;
}

export function WorkflowGraph({ workflow }: WorkflowGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const NODE_W = 160;
    const NODE_H = 70;
    const GAP = 40;

    const nodes: Node[] = workflow.stages.map((stage, i) => {
      const colors = stageColors(stage.status);
      return {
        id: stage.id,
        position: { x: i * (NODE_W + GAP), y: 0 },
        data: {
          label: (
            <div style={{ textAlign: 'center', padding: '6px 8px' }}>
              <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', fontWeight: 600, marginBottom: 2 }}>
                {stage.status.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: '#ffffff90', fontFamily: 'monospace', lineHeight: 1.3 }}>
                {stage.name}
              </div>
              {stage.assignedAgentId && (
                <div style={{ fontSize: 9, color: '#ffffff40', fontFamily: 'monospace', marginTop: 3 }}>
                  {stage.assignedAgentId}
                </div>
              )}
            </div>
          ),
        },
        style: {
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          width: NODE_W,
          height: NODE_H,
        },
        type: 'default',
      };
    });

    const edges: Edge[] = [];
    for (const stage of workflow.stages) {
      for (const depId of stage.dependsOnStageIds) {
        edges.push({
          id: `${depId}->${stage.id}`,
          source: depId,
          target: stage.id,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#2a3347' },
          style: { stroke: '#2a3347', strokeWidth: 1.5 },
          animated: workflow.currentStageId === stage.id,
        });
      }
    }

    return { nodes, edges };
  }, [workflow]);

  return (
    <div style={{ height: 200, background: '#0f1117', borderRadius: 8, border: '1px solid #2a3347' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
        panOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2a3347" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}
