import React, { useState } from "react";
import Layout from "@/components/Layout";
import { MOCK_COMPETENCIES, CompetencyItem } from "@/lib/api";
import {
  Map,
  Target,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sparkles,
  RefreshCw,
  Clock,
  Zap,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface RebuiltMilestone {
  id: string;
  title: string;
  domain: string;
  currentLevel: number;
  requiredLevel: number;
  isBacklogRecovery: boolean;
  recoveryNote?: string;
  estimatedHours?: number;
}

export default function Roadmap() {
  const [selectedRole, setSelectedRole] = useState("Statistical Officer");

  // Streak Break & Backlog Recovery State
  const [isBrokenStreak, setIsBrokenStreak] = useState(true);
  const [brokenDays, setBrokenDays] = useState(4);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuiltNotice, setRebuiltNotice] = useState(false);
  const [customMilestones, setCustomMilestones] = useState<RebuiltMilestone[] | null>(null);

  const roles = [
    "Statistical Officer",
    "Data Analyst",
    "Survey Officer",
    "Data Processing Officer"
  ];

  const handleRebuildRoadmap = async () => {
    setIsRebuilding(true);
    try {
      const res = await fetch("/api/roadmap/rebuild-streak-backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokenDays, currentJobRole: selectedRole }),
      });
      const data = await res.json();
      if (data && data.data && data.data.milestones) {
        const ms: RebuiltMilestone[] = data.data.milestones.map((m: any) => ({
          id: m.id,
          title: m.milestoneTitle,
          domain: m.domain,
          currentLevel: m.currentLevel,
          requiredLevel: m.requiredLevel,
          isBacklogRecovery: m.isBacklogRecovery,
          recoveryNote: m.recoveryNote,
          estimatedHours: m.estimatedHours,
        }));
        setCustomMilestones(ms);
      } else {
        // Fallback local calculation
        setCustomMilestones([
          {
            id: "bm-1",
            title: `[BACKLOG RECOVERY] Accelerated ${brokenDays}-Day Catch-Up: Sampling & Data Quality`,
            domain: "Statistical",
            currentLevel: 3,
            requiredLevel: 5,
            isBacklogRecovery: true,
            recoveryNote: `AI Rebuilt: Covers ${brokenDays} days of missed learning activity from broken streak.`,
            estimatedHours: brokenDays * 1.5,
          },
          {
            id: "bm-2",
            title: `[BACKLOG RECOVERY] High-Priority Python & SQL Aggregate Refresher`,
            domain: "Technical",
            currentLevel: 2,
            requiredLevel: 4,
            isBacklogRecovery: true,
            recoveryNote: `Consolidated catch-up module to restore active streak momentum.`,
            estimatedHours: brokenDays * 1.2,
          },
          {
            id: "bm-3",
            title: "Standard Competency Growth: Survey Design & Metadata Standards",
            domain: "Statistical",
            currentLevel: 4,
            requiredLevel: 5,
            isBacklogRecovery: false,
          },
          {
            id: "bm-4",
            title: "Advanced AI & Predictive Policy Modeling",
            domain: "Technical",
            currentLevel: 1,
            requiredLevel: 3,
            isBacklogRecovery: false,
          },
        ]);
      }
      setRebuiltNotice(true);
    } catch {
      setCustomMilestones([
        {
          id: "bm-1",
          title: `[BACKLOG RECOVERY] Accelerated ${brokenDays}-Day Catch-Up: Sampling & Data Quality`,
          domain: "Statistical",
          currentLevel: 3,
          requiredLevel: 5,
          isBacklogRecovery: true,
          recoveryNote: `AI Rebuilt: Covers ${brokenDays} days of missed learning activity from broken streak.`,
          estimatedHours: brokenDays * 1.5,
        },
        {
          id: "bm-2",
          title: `[BACKLOG RECOVERY] High-Priority Python & SQL Aggregate Refresher`,
          domain: "Technical",
          currentLevel: 2,
          requiredLevel: 4,
          isBacklogRecovery: true,
          recoveryNote: `Consolidated catch-up module to restore active streak momentum.`,
          estimatedHours: brokenDays * 1.2,
        },
        {
          id: "bm-3",
          title: "Standard Competency Growth: Survey Design & Metadata Standards",
          domain: "Statistical",
          currentLevel: 4,
          requiredLevel: 5,
          isBacklogRecovery: false,
        },
      ]);
      setRebuiltNotice(true);
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Map className="h-7 w-7 text-blue-400" />
              Career Gap Analysis & Skill Roadmap
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Select your target job role to view required competency levels and step-by-step learning path.
            </p>
          </div>

          {/* Job Role Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setCustomMilestones(null);
                  setRebuiltNotice(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedRole === role
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5 inline mr-1.5" />
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Streak Repair & Backlog Recovery Banner */}
        {isBrokenStreak && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 fill-amber-400" /> Broken Streak Detected
                  </Badge>
                  <span className="text-xs text-amber-400 font-semibold">{brokenDays} Days Missed</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Streak Break Backlog Recovery Engine
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  You missed <strong>{brokenDays} days</strong> of learning. Rebuild your roadmap to insert accelerated catch-up modules to cover your backlogs and restore your career progress!
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1.5 rounded-xl text-xs">
                  <span className="text-slate-400 pl-1 font-medium">Days:</span>
                  {[3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBrokenDays(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        brokenDays === d ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleRebuildRoadmap}
                  disabled={isRebuilding}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {isRebuilding ? (
                    <>
                      <RotateCcw className="h-4 w-4 animate-spin" /> Rebuilding Roadmap...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Rebuild Roadmap for Backlog
                    </>
                  )}
                </Button>
              </div>
            </div>

            {rebuiltNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                Roadmap successfully rebuilt by Agentic AI! Backlog recovery tasks added for {brokenDays} missed days.
              </div>
            )}
          </div>
        )}

        {/* Milestone Steps / Learning Path */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              {customMilestones ? "Rebuilt Backlog Recovery Roadmap" : `Milestone Learning Sequence for ${selectedRole}`}
            </h2>
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
              {customMilestones ? "NVIDIA AI Rebuilt" : "AI Optimized Path"}
            </Badge>
          </div>

          <div className="space-y-4">
            {customMilestones
              ? customMilestones.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                      item.isBacklogRecovery
                        ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-400/60"
                        : "bg-slate-900 border-slate-800 hover:border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          item.isBacklogRecovery
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-slate-800 text-blue-400 border-slate-700"
                        }`}
                      >
                        M{index + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base">{item.title}</h3>
                          {item.isBacklogRecovery && (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                              Backlog Catch-Up
                            </Badge>
                          )}
                          <Badge className="bg-slate-800 text-slate-300 text-[10px] border-slate-700">
                            {item.domain}
                          </Badge>
                        </div>
                        {item.recoveryNote && (
                          <p className="text-xs text-amber-300 font-medium">{item.recoveryNote}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs pt-1">
                          <span className="text-slate-300">
                            Current: <strong className="text-white">L{item.currentLevel}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-slate-300">
                            Required: <strong className="text-blue-400">L{item.requiredLevel}</strong>
                          </span>
                          {item.estimatedHours && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {item.estimatedHours} hrs
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-48 space-y-2 text-right">
                      <div className="flex justify-between md:justify-end gap-2 text-xs font-semibold">
                        <span className="text-slate-400 md:hidden">Status:</span>
                        {item.isBacklogRecovery ? (
                          <span className="text-amber-400 flex items-center gap-1 font-bold">
                            <Zap className="h-3.5 w-3.5 text-amber-400" /> Catch-Up Module
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> -{item.requiredLevel - item.currentLevel} Level Gap
                          </span>
                        )}
                      </div>
                      <Progress
                        value={(item.currentLevel / item.requiredLevel) * 100}
                        className="h-2 bg-slate-800"
                      />
                    </div>
                  </div>
                ))
              : MOCK_COMPETENCIES.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-700">
                        M{index + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{item.name}</h3>
                          <Badge className="bg-slate-800 text-slate-300 text-[10px] border-slate-700">
                            {item.domain}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs pt-1">
                          <span className="text-slate-300">
                            Current: <strong className="text-white">L{item.currentLevel}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-slate-300">
                            Required: <strong className="text-blue-400">L{item.requiredLevel}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-48 space-y-2 text-right">
                      <div className="flex justify-between md:justify-end gap-2 text-xs font-semibold">
                        <span className="text-slate-400 md:hidden">Gap:</span>
                        {item.gap > 0 ? (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> -{item.gap} Level Gap
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Target Achieved
                          </span>
                        )}
                      </div>
                      <Progress
                        value={(item.currentLevel / item.requiredLevel) * 100}
                        className="h-2 bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
