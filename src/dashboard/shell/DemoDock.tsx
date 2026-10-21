import { Pause, Play, Plus, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { SimulationEventIndicator } from '../../components/events';
import { STATUS_FA, formatSpeed } from './dock-copy';
import { cn } from '../../lib/cn';
import { useSimulation } from '../state/SimulationProvider';

const SPEEDS = [1, 2, 4];

export function DemoDock() {
  const {
    state,
    playing,
    speed,
    events,
    pendingCount,
    appliedCount,
    recentEvents,
    submitOrder,
    advance,
    togglePlay,
    reset,
    setSpeed,
  } = useSimulation();

  const latest = recentEvents[0] ?? state.lastEvent;

  return (
    <div className="dock">
      <div className="dock__badge">
        <Sparkles size={14} style={{ color: 'var(--amber)' }} />
        <div>
          <div className="dock__title">شبیه‌سازی زندهٔ کسب‌وکار</div>
          <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>
            {STATUS_FA[playing ? 'playing' : pendingCount > 0 ? 'paused' : 'idle']}
          </div>
        </div>
      </div>

      <div className="dock__status">
        <SimulationEventIndicator
          event={latest ?? null}
          appliedEventCount={appliedCount}
          totalEvents={events.length}
        />
      </div>

      <div className="dock__controls">
        <button className="btn btn--sm btn--ghost" onClick={reset} title="بازنشانی شبیه‌سازی">
          <RotateCcw size={12} />
          بازنشانی
        </button>
        <button className="btn btn--sm btn--primary" onClick={submitOrder}>
          <Plus size={12} />
          ثبت سفارش نمونه
        </button>
        <button
          className="btn btn--sm"
          onClick={togglePlay}
          disabled={pendingCount === 0 && !playing}
          title="پخش/توقف رویدادها"
        >
          {playing ? <Pause size={12} /> : <Play size={12} />}
          {playing ? 'توقف' : 'پخش'}
        </button>
        <button
          className="btn btn--sm"
          onClick={advance}
          disabled={pendingCount === 0}
          title="اعمال رویداد بعدی"
        >
          <SkipForward size={12} />
          رویداد بعدی
        </button>
      </div>

      <div className="dock__speed">
        <span className="toolbar__label">سرعت</span>
        <div className="segmented">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              className={cn('segmented__item', value === speed && 'segmented__item--active')}
              onClick={() => setSpeed(value)}
            >
              {formatSpeed(value)}
            </button>
          ))}
        </div>
      </div>

      <div className="dock__disclaimer">
        شبیه‌سازی قطعی است؛ هیچ سفارش یا خریدی به سیستم واقعی ارسال نمی‌شود.
      </div>
    </div>
  );
}
