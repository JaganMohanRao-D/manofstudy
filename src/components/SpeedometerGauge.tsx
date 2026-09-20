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
    if (status === 'safe') return '#10b981'; // Emerald-500
    if (status === 'warning') return '#f59e0b'; // Amber-500
    return '#f43f5e'; // Rose-500
  };

  const statusColor = getStatusColor();

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      <svg
        viewBox="0 0 200 115"
        className="w-56 sm:w-64 h-auto overflow-visible"
        aria-label={`Attendance Gauge: ${clampedPercent.toFixed(1)}%`}
      >
        <defs>
          {/* Arc Gradient */}
          <linearGradient id="gaugeCleanGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Outer track background (Dark theme surface) */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tickVal) => {
          const angleRad = ((-180 + (tickVal / 100) * 180) * Math.PI) / 180;
          const x1 = cx + (radius - 9) * Math.cos(angleRad);
          const y1 = cy + (radius - 9) * Math.sin(angleRad);
          const x2 = cx + (radius - 2) * Math.cos(angleRad);
          const y2 = cy + (radius - 2) * Math.sin(angleRad);
          return (
            <line
              key={tickVal}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#475569"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Active progress arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#gaugeCleanGradDark)"
          strokeWidth={strokeWidth}
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Required Threshold Pin */}
        {(() => {
          const targetRad = ((targetAngle - 90) * Math.PI) / 180;
          const targetX = cx + (radius + 9) * Math.cos(targetRad);
          const targetY = cy + (radius + 9) * Math.sin(targetRad);
          return (
            <g className="transition-all duration-300">
              <circle
                cx={targetX}
                cy={targetY}
                r="3.5"
                fill="#38bdf8"
                stroke="#0f172a"
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
            points={`${cx - 2.5},${cy} ${cx + 2.5},${cy} ${cx},${cy - radius + 10}`}
            fill={statusColor}
          />
          <circle cx={cx} cy={cy} r="6" fill="#0f172a" stroke={statusColor} strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="2.5" fill={statusColor} />
        </g>

        {/* Min, Mid and Max Labels */}
        <text x="18" y="104" fill="#94a3b8" className="text-[10px] font-mono font-medium" textAnchor="start">
          0%
        </text>
        <text x="100" y="30" fill="#94a3b8" className="text-[10px] font-mono font-medium" textAnchor="middle">
          50%
        </text>
        <text x="182" y="104" fill="#94a3b8" className="text-[10px] font-mono font-medium" textAnchor="end">
          100%
        </text>
      </svg>

      {/* Hero Numerical Readout Display */}
      <div className="-mt-1 flex flex-col items-center gap-1.5">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
            {clampedPercent.toFixed(1)}
          </span>
          <span className="text-2xl font-bold text-slate-400 font-mono">%</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Target:</span>
            <span className="font-bold text-cyan-400 font-mono">{minRequired}%</span>
          </div>
          
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              status === 'safe'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : status === 'warning'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {status === 'safe' ? 'SAFE' : status === 'warning' ? 'WARNING' : 'SHORTAGE'}
          </span>
        </div>
      </div>
    </div>
  );
};

