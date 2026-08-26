import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ZoomIn, ZoomOut, Maximize2, Target, CheckCircle2, ArrowRight, Info, Layers, Flame } from "lucide-react";
import { Link } from "wouter";

export interface RadarDataPoint {
  name: string;
  currentLevel: number; // 1 - 5
  targetLevel: number;  // 1 - 5
}

export type CompetencyDataPoint = RadarDataPoint;

interface HexagonalStatsGraphProps {
  data: RadarDataPoint[];
  targetRole?: string;
}

export default function HexagonalStatsGraph({ data, targetRole = "Data Scientist" }: HexagonalStatsGraphProps) {
  if (!data || data.length === 0) return null;

  // Canvas Geometry & Expanded Coordinates to prevent text clipping
  const numPoints = data.length;
  const maxVal = 5;
  const center = 270;
  const radius = 120;
  const labelRadius = 165;

  // NotebookLM Pan & Zoom State
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Interactive Hover & Click Focus State
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom Handler Controls
  const handleZoomIn = () => setZoomScale((z) => Math.min(1.8, z + 0.15));
  const handleZoomOut = () => setZoomScale((z) => Math.max(0.6, z - 0.15));
  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".interactive-vertex")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Coordinate Calculations
  const getCoordinates = (index: number, value: number) => {
    const safeVal = isNaN(value) ? 0 : Math.min(maxVal, Math.max(0, value));
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = (safeVal / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y };
  };

  const targetPoints = data.map((d, i) => {
    const { x, y } = getCoordinates(i, d.targetLevel);
    return `${x},${y}`;
  }).join(" ");

  const currentPoints = data.map((d, i) => {
    const { x, y } = getCoordinates(i, d.currentLevel);
    return `${x},${y}`;
  }).join(" ");

  const activeItem = selectedIdx !== null ? data[selectedIdx] : null;

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm overflow-hidden w-full text-[#0f172a]">
      {/* Header & Floating NotebookLM Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-900 text-[10px] font-bold uppercase tracking-wider">
                Interactive Radar Matrix
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                NotebookLM View Active
              </Badge>
            </div>
            <h2 className="text-base md:text-lg font-bold text-[#0f172a] tracking-tight mt-1">
              Competency Skill-Gap Radar ({targetRole})
            </h2>
          </div>

          {/* Floating NotebookLM Toolbar Controls */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-xs self-start sm:self-auto">
            <Button
              onClick={handleZoomIn}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200 rounded-lg"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={handleZoomOut}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-700 hover:bg-slate-200 rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={handleResetZoom}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] font-bold text-blue-900 hover:bg-blue-50 rounded-lg flex items-center gap-1"
              title="Reset Zoom"
            >
              <Maximize2 className="h-3 w-3" /> Fit
            </Button>
            <span className="text-[10px] font-extrabold text-slate-600 px-2 border-l border-slate-200">
              {Math.round(zoomScale * 100)}%
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold w-fit">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#1e3a8a] inline-block border border-blue-900" />
            <span className="text-[#1e3a8a]">Target Benchmark</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600 inline-block border border-emerald-700" />
            <span className="text-emerald-700">Current Level</span>
          </div>
        </div>
      </div>

      {/* NOTEBOOKLM INTERACTIVE CANVAS (Pan, Drag & Click Node Inspection) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex justify-center items-center py-4 bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden relative select-none cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="w-full max-w-[540px]"
        >
          <svg viewBox="0 0 540 420" className="w-full h-auto overflow-visible select-none">
            {/* Concentric Background Hexagonal Grids */}
            {[1, 2, 3, 4, 5].map((level) => {
              const levelPoints = data.map((_, i) => {
                const { x, y } = getCoordinates(i, level);
                return `${x},${y}`;
              }).join(" ");
              return (
                <polygon
                  key={level}
                  points={levelPoints}
                  fill="none"
                  stroke={level === 5 ? "#cbd5e1" : "#e2e8f0"}
                  strokeWidth={level === 5 ? "1.5" : "1"}
                  strokeDasharray={level % 2 === 0 ? "3 3" : undefined}
                />
              );
            })}

            {/* Radial Axis Rays */}
            {data.map((_, i) => {
              const outer = getCoordinates(i, maxVal);
              const isFocused = hoveredIdx === i || selectedIdx === i;
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={isFocused ? "#1e3a8a" : "#cbd5e1"}
                  strokeWidth={isFocused ? "2" : "1"}
                />
              );
            })}

            {/* Target Benchmark Polygon */}
            <polygon
              points={targetPoints}
              fill="rgba(30, 58, 138, 0.08)"
              stroke="#1e3a8a"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Current Level Polygon */}
            <polygon
              points={currentPoints}
              fill="rgba(16, 185, 129, 0.18)"
              stroke="#059669"
              strokeWidth="2.5"
            />

            {/* Target Benchmark Vertices */}
            {data.map((d, i) => {
              const { x, y } = getCoordinates(i, d.targetLevel);
              const isFocused = hoveredIdx === i || selectedIdx === i;
              return (
                <circle
                  key={`target-${i}`}
                  cx={x}
                  cy={y}
                  r={isFocused ? "5" : "3.5"}
                  fill="#1e3a8a"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Interactive Current Level Vertices (Clickable & Hoverable) */}
            {data.map((d, i) => {
              const { x, y } = getCoordinates(i, d.currentLevel);
              const isHovered = hoveredIdx === i;
              const isSelected = selectedIdx === i;
              return (
                <g
                  key={`current-${i}`}
                  onClick={() => setSelectedIdx(i)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="interactive-vertex cursor-pointer"
                >
                  {/* Focus Halo Ring on Hover/Selection */}
                  {(isHovered || isSelected) && (
                    <circle
                      cx={x}
                      cy={y}
                      r="11"
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="#059669"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "6.5" : isHovered ? "5.5" : "4.5"}
                    fill={isSelected ? "#047857" : "#059669"}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* Axis Labels & Values (Expanded Padding - Never Cut Off) */}
            {data.map((d, i) => {
              const { x, y } = getLabelCoordinates(i);
              const isHovered = hoveredIdx === i;
              const isSelected = selectedIdx === i;
              const isFocus = isHovered || isSelected;

              // Text Anchoring based on angle position
              const textAnchor = x < center - 20 ? "end" : x > center + 20 ? "start" : "middle";

              return (
                <g
                  key={`label-${i}`}
                  onClick={() => setSelectedIdx(i)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="interactive-vertex cursor-pointer"
                >
                  <text
                    x={x}
                    y={y - 2}
                    textAnchor={textAnchor}
                    fill={isFocus ? "#1e3a8a" : "#0f172a"}
                    fontSize="10"
                    fontWeight={isFocus ? "900" : "700"}
                    className="font-sans tracking-tight"
                  >
                    {d.name}
                  </text>
                  <text
                    x={x}
                    y={y + 11}
                    textAnchor={textAnchor}
                    fill={isFocus ? "#047857" : "#64748b"}
                    fontSize="9"
                    fontWeight="700"
                  >
                    L{d.currentLevel} / L{d.targetLevel} (Gap: {Math.max(0, d.targetLevel - d.currentLevel)})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* NOTEBOOKLM INSPECTOR DRAWER / CARD (Active Selected Competency Domain) */}
      {activeItem && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">
                Competency Inspector (NotebookLM)
              </span>
              <h3 className="font-bold text-sm text-[#0f172a]">{activeItem.name}</h3>
            </div>

            {activeItem.currentLevel >= activeItem.targetLevel ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold">
                Benchmark Met ✓
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-bold">
                -{activeItem.targetLevel - activeItem.currentLevel} Level Gap
              </Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Proficiency Score</span>
              <span>L{activeItem.currentLevel} / L{activeItem.targetLevel} ({Math.round((activeItem.currentLevel / activeItem.targetLevel) * 100)}%)</span>
            </div>
            <Progress value={Math.round((activeItem.currentLevel / activeItem.targetLevel) * 100)} className="h-2 bg-slate-200" />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-medium">
              Click any vertex above to inspect another competency domain.
            </p>
            <Link href="/learning">
              <Button size="sm" className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5">
                Launch {activeItem.name} Module <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
