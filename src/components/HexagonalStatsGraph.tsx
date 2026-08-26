import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export interface CompetencyDataPoint {
  name: string;
  currentLevel: number; // Level 1 to 5
  targetLevel: number;  // Level 1 to 5
}

interface HexagonalStatsGraphProps {
  data?: CompetencyDataPoint[];
  targetRole?: string;
  className?: string;
}

const DEFAULT_DATA: CompetencyDataPoint[] = [
  { name: "Sampling Techniques", currentLevel: 3, targetLevel: 5 },
  { name: "Python Statistics", currentLevel: 2, targetLevel: 4 },
  { name: "SQL Querying", currentLevel: 3, targetLevel: 4 },
  { name: "Data Quality & Audit", currentLevel: 3, targetLevel: 4 },
  { name: "Digital Governance", currentLevel: 4, targetLevel: 4 },
  { name: "Data Visualization", currentLevel: 2, targetLevel: 4 },
];

export default function HexagonalStatsGraph({
  data = DEFAULT_DATA,
  targetRole = "Statistical Officer",
  className = "",
}: HexagonalStatsGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Clean and validate incoming data
  const validData = (data && data.length > 0 ? data : DEFAULT_DATA)
    .slice(0, 6)
    .map((d) => ({
      name: d.name || "Competency",
      currentLevel: Math.max(1, Math.min(5, Number(d.currentLevel) || 2)),
      targetLevel: Math.max(1, Math.min(5, Number(d.targetLevel) || 4)),
    }));

  // SVG Geometry Dimensions with extra margin for axis labels
  const svgWidth = 380;
  const svgHeight = 340;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;
  const maxRadius = 110;
  const numLevels = 5;
  const numVertices = validData.length;

  // Compute angle for each vertex starting at top (-pi/2)
  const getAngle = (index: number) => {
    return (Math.PI * 2 * index) / numVertices - Math.PI / 2;
  };

  // Convert (radius, vertexIndex) to SVG coordinates (x, y)
  const getPoint = (radius: number, index: number) => {
    const angle = getAngle(index);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Generate SVG polygon points string from radius values array
  const getPolygonPoints = (levels: number[]) => {
    return levels
      .map((lvl, idx) => {
        const safeLvl = Math.min(5, Math.max(0, Number(lvl) || 1));
        const r = (safeLvl / numLevels) * maxRadius;
        const pt = getPoint(r, idx);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(" ");
  };

  const currentLevels = validData.map((d) => d.currentLevel);
  const targetLevels = validData.map((d) => d.targetLevel);

  const currentPolyPoints = getPolygonPoints(currentLevels);
  const targetPolyPoints = getPolygonPoints(targetLevels);

  // Overall readiness percentage calculation
  const totalCurrent = currentLevels.reduce((acc, curr) => acc + curr, 0);
  const totalTarget = targetLevels.reduce((acc, curr) => acc + curr, 0);
  const readinessPercent = Math.min(100, Math.round((totalCurrent / Math.max(1, totalTarget)) * 100));

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 ${className}`}>
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Competency Comparison Radar</h3>
          </div>
          <p className="text-xs text-slate-400">
            Overlaid analysis: Current Baseline vs <strong className="text-purple-400">{targetRole}</strong> Standard
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-1">
            {readinessPercent}% Role Readiness
          </Badge>
        </div>
      </div>

      {/* Main Comparative Graph */}
      <div className="relative flex flex-col items-center justify-center min-h-[320px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[380px] h-auto overflow-visible select-none"
        >
          <defs>
            {/* Emerald Fill Gradient */}
            <radialGradient id="currentGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
            </radialGradient>
            {/* Purple Fill Gradient */}
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
            </radialGradient>

            {/* Glowing Drop Shadows */}
            <filter id="emeraldShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.6" />
            </filter>
            <filter id="purpleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Concentric Hexagonal Level Grid Lines (Levels 1 to 5) */}
          {[1, 2, 3, 4, 5].map((lvl) => {
            const gridRadius = (lvl / numLevels) * maxRadius;
            const gridPoints = Array.from({ length: numVertices })
              .map((_, idx) => {
                const pt = getPoint(gridRadius, idx);
                return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
              })
              .join(" ");

            return (
              <polygon
                key={lvl}
                points={gridPoints}
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray={lvl === 5 ? "none" : "2,2"}
                opacity={0.6}
              />
            );
          })}

          {/* Radial Axis Lines from Center to Outer Vertices */}
          {Array.from({ length: numVertices }).map((_, idx) => {
            const outerPt = getPoint(maxRadius, idx);
            return (
              <line
                key={idx}
                x1={cx}
                y1={cy}
                x2={outerPt.x}
                y2={outerPt.y}
                stroke="#334155"
                strokeWidth="1"
                opacity={0.5}
              />
            );
          })}

          {/* POLYGON LAYER 1: Target Level Standard (Indigo/Purple Layer) */}
          <polygon
            points={targetPolyPoints}
            fill="url(#targetGlow)"
            stroke="#818cf8"
            strokeWidth="2"
            strokeDasharray="4,4"
            filter="url(#purpleShadow)"
            className="transition-all duration-500"
          />

          {/* POLYGON LAYER 2: Current Verified User Level (Emerald/Cyan Layer) */}
          <polygon
            points={currentPolyPoints}
            fill="url(#currentGlow)"
            stroke="#10b981"
            strokeWidth="2.5"
            filter="url(#emeraldShadow)"
            className="transition-all duration-500"
          />

          {/* Vertex Dots & Interactive Hover Regions */}
          {validData.map((d, idx) => {
            const currentR = (d.currentLevel / numLevels) * maxRadius;
            const targetR = (d.targetLevel / numLevels) * maxRadius;

            const currPt = getPoint(currentR, idx);
            const targPt = getPoint(targetR, idx);
            const labelPt = getPoint(maxRadius + 18, idx);

            const angle = getAngle(idx);
            const cosVal = Math.cos(angle);
            const textAnchor = cosVal < -0.2 ? "end" : cosVal > 0.2 ? "start" : "middle";

            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={d.name + idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Target Level Dot */}
                <circle
                  cx={targPt.x}
                  cy={targPt.y}
                  r={isHovered ? 6 : 4}
                  fill="#818cf8"
                  stroke="#1e1b4b"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Current Level Dot */}
                <circle
                  cx={currPt.x}
                  cy={currPt.y}
                  r={isHovered ? 7 : 5}
                  fill="#10b981"
                  stroke="#022c22"
                  strokeWidth="2"
                  className="transition-all shadow-lg"
                />

                {/* Outer Axis Domain Labels with Dynamic Alignment */}
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className={`text-[11px] font-bold transition-all ${
                    isHovered ? "fill-emerald-300 text-xs" : "fill-slate-300"
                  }`}
                >
                  {d.name.length > 18 ? `${d.name.slice(0, 16)}...` : d.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && validData[hoveredIndex] && (
          <div className="absolute bottom-2 bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-xl text-xs shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150 pointer-events-none z-20">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{validData[hoveredIndex].name}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Current: Level {validData[hoveredIndex].currentLevel}
              </span>
              <span className="text-purple-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" />
                Target: Level {validData[hoveredIndex].targetLevel}
              </span>
            </div>
            {validData[hoveredIndex].targetLevel > validData[hoveredIndex].currentLevel && (
              <p className="text-[10px] text-rose-300 font-medium">
                Gap: {validData[hoveredIndex].targetLevel - validData[hoveredIndex].currentLevel} Level(s) to reach standard
              </p>
            )}
          </div>
        )}
      </div>

      {/* Legend & Summary Key */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-around gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-emerald-500 border border-emerald-400 shadow-sm" />
          <span className="font-bold text-slate-200">Current Verified Level</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-indigo-500 border border-indigo-400 border-dashed" />
          <span className="font-bold text-slate-200">Target Role Standard ({targetRole})</span>
        </div>
      </div>
    </div>
  );
}
