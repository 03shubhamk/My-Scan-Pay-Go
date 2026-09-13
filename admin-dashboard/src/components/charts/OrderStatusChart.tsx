import React, { useState } from 'react';

export interface OrderStatusStat {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

interface OrderStatusChartProps {
  data: OrderStatusStat[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
  data,
  title = 'Order Status Distribution',
  subtitle = 'Breakdown of turnstile & payment states',
  className = '',
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  if (!data || data.length === 0 || totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
        <p>No order distribution data</p>
      </div>
    );
  }

  // SVG Donut dimensions
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;
  const slices = data.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((currentAngle / 100) * circumference);
    currentAngle += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredStatus ? data.find((d) => d.status === hoveredStatus) : null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-around pt-2">
        {/* SVG Donut */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredStatus === slice.status;
              return (
                <circle
                  key={slice.status}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredStatus(slice.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeItem ? (
              <>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {activeItem.status}
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {activeItem.percentage}%
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeItem.count} orders
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Orders
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {totalCount}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  100% Tracked
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend Breakdown */}
        <div className="flex-1 space-y-2 w-full max-w-xs">
          {data.map((item) => {
            const isHovered = hoveredStatus === item.status;
            return (
              <div
                key={item.status}
                onMouseEnter={() => setHoveredStatus(item.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                  isHovered ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-700">{item.status.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-slate-900 font-bold">{item.count}</span>
                  <span className="font-mono text-slate-500 w-8 text-right">{item.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
