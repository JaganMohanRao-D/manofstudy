import React from 'react';

interface SpeedometerGaugeProps {
  percentage: number;
  minRequired: number;
  status: 'safe' | 'warning' | 'danger';
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  percentage,
  minRequired,
  status,
}) => {
  // Clamp display between 0 and 100
  const clampedPercent = Math.max(0, Math.min(100, percentage));
  
  // Needle angle from -90 deg (0%) to +90 deg (100%)
  const needleAngle = -90 + (clampedPercent / 100) * 180;
  const targetAngle = -90 + (minRequired / 100) * 180;

  // Gauge Geometry
  const radius = 76;
  const strokeWidth = 10;
  const cx = 100;
  const cy = 90;

  const arcLength = Math.PI * radius; // ~238.76
  const strokeDashoffset = arcLength - (clampedPercent / 100) * arcLength;

  const getStatusColor = () => {
    if (status === 'safe') return '#0284C7'; // Sky-600
    if (status === 'warning') return '#D97706'; // Amber-600
    return '#E11D48'; // Rose-600
  };

  const statusColor = getStatusColor();

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-1">
      <svg
        viewBox="0 0 200 120"
        className="w-52 sm:w-60 h-auto overflow-visible"
        aria-label={`Attendance Gauge: ${clampedPercent.toFixed(1)}%`}
      >
        <defs>
          {/* Arc Gradient */}
          <linearGradient id="gaugeCleanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="75%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Outer track background */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          className="stroke-slate-200"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tickVal) => {
          const angleRad = ((-180 + (tickVal / 100) * 180) * Math.PI) / 180;
          const x1 = cx + (radius - 8) * Math.cos(angleRad);
          const y1 = cy + (radius - 8) * Math.sin(angleRad);
          const x2 = cx + (radius - 2) * Math.cos(angleRad);
          const y2 = cy + (radius - 2) * Math.sin(angleRad);
          return (
            <line
              key={tickVal}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-slate-300"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Active progress arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#gaugeCleanGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Required Threshold Pin */}
        {(() => {
          const targetRad = ((targetAngle - 90) * Math.PI) / 180;
          const targetX = cx + (radius + 8) * Math.cos(targetRad);
          const targetY = cy + (radius + 8) * Math.sin(targetRad);
          return (
            <g className="transition-all duration-300">
              <circle
                cx={targetX}
                cy={targetY}
                r="3"
                className="fill-sky-600 stroke-white"
                strokeWidth="1.5"
              />
            </g>
          );
        })()}

        {/* Speedometer Needle */}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <polygon
            points={`${cx - 2},${cy} ${cx + 2},${cy} ${cx},${cy - radius + 12}`}
            fill={statusColor}
          />
          <circle cx={cx} cy={cy} r="5" className="fill-white" stroke={statusColor} strokeWidth="2" />
          <circle cx={cx} cy={cy} r="2" fill={statusColor} />
        </g>

        {/* Min and Max Labels */}
        <text x="20" y="106" className="fill-slate-400 text-[9px] font-medium" textAnchor="start">
          0%
        </text>
        <text x="100" y="32" className="fill-slate-400 text-[9px] font-medium" textAnchor="middle">
          50%
        </text>
        <text x="180" y="106" className="fill-slate-400 text-[9px] font-medium" textAnchor="end">
          100%
        </text>
      </svg>

      {/* Numerical readout display card */}
      <div className="-mt-2 flex flex-col items-center">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-slate-900">
            {clampedPercent.toFixed(1)}
          </span>
          <span className="text-xl font-semibold text-slate-400">%</span>
        </div>

        <div className="flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px]">
          <span className="text-slate-500">Target:</span>
          <span className="font-semibold text-sky-600">{minRequired}%</span>
        </div>
      </div>
    </div>
  );
};

