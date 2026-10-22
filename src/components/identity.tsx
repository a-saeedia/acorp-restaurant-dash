import { cn } from '../lib/cn';
import { faDateShort, faTime, faWeekday } from '../lib/fa';
import type { RestaurantProfile } from '../simulation/types';
import { PersianText } from './primitives';

/* -------------------------------------------------------------------------- */
/* BrandMark                                                                 */
/* -------------------------------------------------------------------------- */

export interface BrandMarkProps {
  size?: number;
  className?: string;
  /** Muted variant for the sidebar footer. */
  muted?: boolean;
}

/**
 * Geometric monogram: an "A" cut from a rounded triangle with a bar through it.
 * Drawn as SVG rather than a font glyph so it rasterises identically in a
 * browser and in a rendered video frame.
 */
export function BrandMark({ size = 34, className, muted = false }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn('brand-mark', className)}
      aria-hidden
    >
      <path
        d="M24 5.5 42.5 40.5H5.5L24 5.5Z"
        stroke={muted ? 'rgba(255,255,255,0.28)' : '#e3a854'}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 30.5h17"
        stroke={muted ? 'rgba(255,255,255,0.18)' : 'rgba(227,168,84,0.55)'}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="21.5" r="3.1" fill={muted ? 'rgba(255,255,255,0.3)' : '#e3a854'} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* RestaurantHeader                                                         */
/* -------------------------------------------------------------------------- */

export interface RestaurantHeaderProps {
  profile: RestaurantProfile;
  clockIso: string;
  open?: boolean;
  compact?: boolean;
  /** Right-hand slot: clock, pills, actions. */
  trailing?: React.ReactNode;
}

export function RestaurantHeader({
  profile,
  clockIso,
  open = true,
  compact = false,
  trailing,
}: RestaurantHeaderProps) {
  return (
    <header className={cn('restaurant-head', compact && 'restaurant-head--compact')}>
      <div className="row" style={{ gap: 12 }}>
        <BrandMark size={compact ? 30 : 38} />
        <div className="stack-1">
          <div className="restaurant-head__name">{profile.nameFa}</div>
          <div className="restaurant-head__meta">
            <PersianText size={11} tone="muted">
              {profile.branchFa}
            </PersianText>
            <span aria-hidden style={{ opacity: 0.35 }}>
              ·
            </span>
            <PersianText size={11} tone="dim">
              {profile.cityFa}
            </PersianText>
          </div>
        </div>
      </div>

      <div className="restaurant-head__clock">
        <span className="restaurant-head__time t-num">{faTime(clockIso)}</span>
        <PersianText size={10.5} tone="dim" className="restaurant-head__date">
          {faWeekday(clockIso)} {faDateShort(clockIso)}
        </PersianText>
      </div>

      <div className="row" style={{ gap: 8 }}>
        <span className={cn('live-dot', open ? 'live-dot--on' : 'live-dot--off')}>
          <span className="live-dot__core" />
          <PersianText size={10.5} tone={open ? 'green' : 'dim'}>
            {open ? 'سرویس باز' : 'خارج از سرویس'}
          </PersianText>
        </span>
        {trailing}
      </div>
    </header>
  );
}
