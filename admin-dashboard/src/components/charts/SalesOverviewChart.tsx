import React, { useState } from 'react';

export interface SalesDataPoint {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
}

interface SalesOverviewChartProps {
  data: SalesDataPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SalesOverviewChart: React.FC<SalesOverviewChartProps> = ({
  data,
  title = 'Sales & Revenue Velocity',
  subtitle = 'Daily revenue and self-checkout volume across 7 days',
  className = '',
}) => {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No sales data available for this timeframe
      </div>
    );
  }

  const values = data.map((d) => (metric === 'revenue' ? d.revenue : d.orderCount));
  const maxVal = Math.max(...values, metric === 'revenue' ? 500 : 10);
  const minVal = 0;

  // Chart dimensions
  const width = 650;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const val = metric === 'revenue' ? d.revenue : d.orderCount;
    const x = paddingX + (i / (data.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - ((val - minVal) / (maxVal - minVal || 1)) * chartHeight;
    return { x, y, val, ...d };
  });

  // Construct SVG Area and Line Paths
  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // Simple smooth curve control points
    const prev = points[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = minVal + pct * (maxVal - minVal);
    const y = height - paddingY - pct * chartHeight;
    return { val, y };
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Title and Metric Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              metric === 'revenue'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue (₹)
          </button>
          <button
            type="button"
            onClick={() => setMetric('orders')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              metric === 'orders'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orders Count
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/20 to-transparent rounded-xl p-2 border border-slate-100">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
              <stop offset="85%" stopColor="#3B82F6" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
            <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingX}
                y1={tick.y}
                x2={width - paddingX}
                y2={tick.y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {metric === 'revenue' ? `₹${Math.round(tick.val)}` : Math.round(tick.val)}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#salesAreaGradient)" />

          {/* Smooth Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#chartGlow)"
          />

          {/* Data Points and Interactivity */}
          {points.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={i}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vertical Guideline on hover */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={height - paddingY}
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Outer Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4.5}
                  className={`transition-all ${
                    isHovered ? 'fill-blue-600 stroke-white stroke-[3]' : 'fill-white stroke-blue-600 stroke-2'
                  }`}
                />

                {/* X-Axis Labels */}
                <text
                  x={pt.x}
                  y={height - paddingY + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-all ${
                    isHovered ? 'fill-blue-700 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100}%`,
              marginTop: '-12px',
            }}
          >
            <p className="font-bold text-blue-300">{points[hoveredIdx].date} ({points[hoveredIdx].label})</p>
            <p className="font-mono text-sm font-extrabold mt-0.5">
              ₹{points[hoveredIdx].revenue.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-300">
              {points[hoveredIdx].orderCount} self-checkout orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
