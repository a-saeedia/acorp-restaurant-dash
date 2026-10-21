import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../lib/cn';
import { faMoneyCompact, faNumber } from '../lib/fa';
import { PersianText } from './primitives';

/* Recharts hands values back as a union; keeping this alias local stops the
 * formatter signature from leaking into every call site. */
type ChartValue = number | string | readonly (string | number)[];

const moneyFormatter = (value?: ChartValue): string => faMoneyCompact(Number(value ?? 0));

const TOOLTIP_STYLE = {
  background: '#14171c',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  fontFamily: 'Vazirmatn, system-ui, sans-serif',
  fontSize: 12,
  color: '#f2eee7',
  direction: 'rtl' as const,
  padding: '8px 10px',
};

/* -------------------------------------------------------------------------- */
/* RevenueChart                                                              */
/* -------------------------------------------------------------------------- */

export interface RevenuePoint {
  labelFa: string;
  netSales: number;
  orderCount?: number;
}

export interface RevenueChartProps {
  points: RevenuePoint[];
  width: number;
  height: number;
  /** Draw the order-count line on a second axis. */
  showOrders?: boolean;
  className?: string;
}

export function RevenueChart({
  points,
  width,
  height,
  showOrders = false,
  className,
}: RevenueChartProps) {
  return (
    <div className={cn('chart', className)} style={{ width, height }}>
      <AreaChart
        width={width}
        height={height}
        data={points}
        margin={{ top: 8, right: 4, bottom: 0, left: 8 }}
      >
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e3a854" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#e3a854" stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6f8fb5" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#6f8fb5" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
        <XAxis
          dataKey="labelFa"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6f7480', fontSize: 9.5, fontFamily: 'Vazirmatn' }}
          interval="preserveStartEnd"
          minTickGap={18}
        />
        <YAxis
          orientation="right"
          tickLine={false}
          axisLine={false}
          width={54}
          tick={{ fill: '#6f7480', fontSize: 9.5, fontFamily: 'Vazirmatn' }}
          tickFormatter={moneyFormatter}
        />
        {showOrders ? (
          <YAxis
            yAxisId="orders"
            orientation="left"
            tickLine={false}
            axisLine={false}
            width={34}
            tick={{ fill: '#5f6b7c', fontSize: 9, fontFamily: 'Vazirmatn' }}
            tickFormatter={(value: ChartValue) => faNumber(Number(value))}
          />
        ) : null}

        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: 'rgba(227,168,84,0.35)', strokeWidth: 1 }}
          formatter={moneyFormatter}
        />
        <Area
          type="monotone"
          dataKey="netSales"
          name="فروش خالص"
          stroke="#e3a854"
          strokeWidth={1.8}
          fill="url(#revenueFill)"
          isAnimationActive={false}
          activeDot={{ r: 3, fill: '#e3a854', stroke: '#0b0d10', strokeWidth: 2 }}
        />
        {showOrders ? (
          <Area
            yAxisId="orders"
            type="monotone"
            dataKey="orderCount"
            name="تعداد سفارش"
            stroke="rgba(111,143,181,0.7)"
            strokeWidth={1.1}
            strokeDasharray="3 3"
            fill="url(#ordersFill)"
            isAnimationActive={false}
            dot={false}
          />
        ) : null}
      </AreaChart>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CostDonut                                                                 */
/* -------------------------------------------------------------------------- */

export interface DonutSlice {
  key: string;
  nameFa: string;
  value: number;
  color: string;
}

export interface CostDonutProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function CostDonut({
  slices,
  size = 148,
  thickness = 14,
  centerLabel = 'هزینهٔ کل',
  centerValue,
}: CostDonutProps) {
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="nameFa"
          innerRadius={size / 2 - thickness - 6}
          outerRadius={size / 2 - 6}
          paddingAngle={2}
          stroke="none"
          isAnimationActive={false}
        >
          {slices.map((slice) => (
            <Cell key={slice.key} fill={slice.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={moneyFormatter} />
      </PieChart>
      <div className="donut__center">
        <span className="donut__label">{centerLabel}</span>
        {centerValue ? <span className="donut__value">{centerValue}</span> : null}
      </div>
    </div>
  );
}

export function DonutLegend({ slices }: { slices: DonutSlice[] }) {
  return (
    <div className="donut-legend">
      {slices.map((slice) => (
        <div key={slice.key} className="donut-legend__row">
          <span className="donut-legend__swatch" style={{ background: slice.color }} />
          <PersianText size={11.5} className="donut-legend__name">
            {slice.nameFa}
          </PersianText>
          <span className="donut-legend__value">{faMoneyCompact(slice.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HorizontalBars                                                            */
/* -------------------------------------------------------------------------- */

export interface BarItem {
  key: string;
  labelFa: string;
  value: number;
  metaFa?: string;
  color?: string;
}

export interface HorizontalBarsProps {
  items: BarItem[];
  max?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * Hand-rolled bars rather than a chart library: no measurement, no layout
 * thrash, and identical pixels in the dashboard and in a rendered frame.
 */
export function HorizontalBars({
  items,
  max,
  formatValue = faMoneyCompact,
  className,
}: HorizontalBarsProps) {
  const ceiling = max ?? Math.max(1, ...items.map((item) => item.value));

  return (
    <div className={cn('bars', className)}>
      {items.map((item) => (
        <div key={item.key} className="bars__row">
          <div className="bars__head">
            <PersianText size={12} className="bars__label">
              {item.labelFa}
            </PersianText>
            <span className="bars__value">{formatValue(item.value)}</span>
          </div>
          <div className="bars__track">
            <div
              className="bars__fill"
              style={{
                width: `${Math.max(3, (item.value / ceiling) * 100)}%`,
                background: item.color ?? 'linear-gradient(90deg, #b9812f, #e3a854)',
              }}
            />
          </div>
          {item.metaFa ? <div className="bars__meta">{item.metaFa}</div> : null}
        </div>
      ))}
    </div>
  );
}
