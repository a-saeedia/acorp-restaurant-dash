import { Activity, CircleCheck, Clock3 } from 'lucide-react';
import { cn } from '../lib/cn';
import { faTime } from '../lib/fa';
import type { SimulationEvent } from '../simulation/types';
import { PersianText } from './primitives';

/* -------------------------------------------------------------------------- */
/* SimulationEventIndicator                                                  */
/* -------------------------------------------------------------------------- */

export interface SimulationEventIndicatorProps {
  event: SimulationEvent | null;
  appliedEventCount: number;
  /** Total events in the queued workflow, for the progress bar. */
  totalEvents?: number;
}

/**
 * The spine of the demo: every business screen is downstream of an event, and
 * this strip makes that visible instead of implied.
 */
export function SimulationEventIndicator({
  event,
  appliedEventCount,
  totalEvents,
}: SimulationEventIndicatorProps) {
  const progress =
    totalEvents && totalEvents > 0 ? Math.min(1, appliedEventCount / totalEvents) : null;

  return (
    <div className={cn('sim-ev', event ? 'sim-ev--live' : 'sim-ev--idle')}>
      <span className="sim-ev__dot" />
      <div className="sim-ev__body">
        <div className="sim-ev__row">
          <PersianText size={11.5} weight={600} tone={event ? 'default' : 'dim'}>
            {event ? event.titleFa : 'در انتظار رویداد'}
          </PersianText>
          {event ? <span className="sim-ev__type t-code">{event.type}</span> : null}
        </div>
        <PersianText size={10.5} tone="dim" className="t-clip">
          {event ? event.detailFa : 'شبیه‌سازی متوقف است — برای شروع، دمو را اجرا کنید.'}
        </PersianText>
      </div>

      <div className="sim-ev__meta">
        {event ? <span className="sim-ev__time t-num">{faTime(event.atIso)}</span> : null}
        <span className="sim-ev__count">{appliedEventCount.toLocaleString('fa-IR')}</span>
      </div>

      {progress !== null ? (
        <span className="sim-ev__progress" aria-hidden>
          <span className="sim-ev__progress-fill" style={{ width: `${progress * 100}%` }} />
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EventLog                                                                  */
/* -------------------------------------------------------------------------- */

export interface EventLogProps {
  events: SimulationEvent[];
  limit?: number;
  className?: string;
}

export function EventLog({ events, limit = 8, className }: EventLogProps) {
  const visible = events.slice(0, limit);

  return (
    <ol className={cn('evt', className)}>
      {visible.map((event, index) => {
        const isLatest = index === 0;
        return (
          <li key={event.id} className={cn('evt__row', isLatest && 'evt__row--latest')}>
            <span className="evt__rail">
              <span className="evt__node">
                {isLatest ? <Activity size={9} strokeWidth={3} /> : <CircleCheck size={9} strokeWidth={2.5} />}
              </span>
            </span>
            <div className="evt__body">
              <div className="evt__title">{event.titleFa}</div>
              <PersianText size={10.5} tone="dim" className="evt__detail">
                {event.detailFa}
              </PersianText>
            </div>
            <span className="evt__time">
              <Clock3 size={10} />
              {faTime(event.atIso)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
