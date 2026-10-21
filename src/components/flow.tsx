import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/* -------------------------------------------------------------------------- */
/* DataFlowConnector                                                        */
/* -------------------------------------------------------------------------- */

export interface DataFlowConnectorProps {
  /** 0…1 — how much of the connector is energised. */
  progress?: number;
  /** Horizontal length in px. */
  length?: number;
  horizontal?: boolean;
  className?: string;
}

/**
 * A hairline connector with a travelling pulse. Purely prop-driven: the video
 * and the dashboard pass explicit progress, so no animation loop is involved.
 */
export function DataFlowConnector({
  progress = 0,
  length = 26,
  horizontal = true,
  className,
}: DataFlowConnectorProps) {
  const p = Math.max(0, Math.min(1, progress));
  const width = horizontal ? length : 2;
  const height = horizontal ? 2 : length;

  return (
    <svg
      className={cn('flowline', className)}
      width={width}
      height={height}
      viewBox={horizontal ? `0 0 ${length} 2` : `0 0 2 ${length}`}
      aria-hidden
    >
      <line
        className="flowline__track"
        x1={horizontal ? 0 : 1}
        y1={horizontal ? 1 : 0}
        x2={horizontal ? length : 1}
        y2={horizontal ? 1 : length}
      />
      {p > 0 ? (
        <line
          className="flowline__pulse"
          x1={horizontal ? 0 : 1}
          y1={horizontal ? 1 : 0}
          x2={horizontal ? length * p : 1}
          y2={horizontal ? 1 : length * p}
        />
      ) : null}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* WorkflowNode                                                              */
/* -------------------------------------------------------------------------- */

export interface WorkflowNodeProps {
  label: string;
  count: number;
  icon: ReactNode;
  state?: 'idle' | 'active' | 'done';
  compact?: boolean;
}

export function WorkflowNode({ label, count, icon, state = 'idle' }: WorkflowNodeProps) {
  return (
    <div
      className={cn(
        'workflow__step',
        state === 'active' && 'workflow__step--active',
        state === 'done' && 'workflow__step--done',
      )}
    >
      <span className="workflow__icon">{icon}</span>
      <span className="workflow__text">
        <span className="workflow__label">{label}</span>
        <span className="workflow__count">{count}</span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PipelineStrip                                                             */
/* -------------------------------------------------------------------------- */

export interface PipelineStage {
  key: string;
  label: string;
  count: number;
  icon: ReactNode;
  state?: 'idle' | 'active' | 'done';
}

export interface PipelineStripProps {
  stages: PipelineStage[];
  /** 0…1 flow energy, used to drive the connectors. */
  progress?: number;
}

export function PipelineStrip({ stages, progress = 0 }: PipelineStripProps) {
  return (
    <div className="workflow">
      {stages.map((stage, index) => (
        <div key={stage.key} className="row" style={{ flex: '1 1 0', minWidth: 0, gap: 0 }}>
          <WorkflowNode
            label={stage.label}
            count={stage.count}
            icon={stage.icon}
            state={stage.state ?? (stage.count > 0 ? 'active' : 'idle')}
          />
          {index < stages.length - 1 ? (
            <span className="workflow__connector">
              <DataFlowConnector
                progress={Math.max(0, Math.min(1, progress * stages.length - index))}
                length={26}
              />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
