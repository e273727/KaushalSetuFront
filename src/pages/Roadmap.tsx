import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { MOCK_COMPETENCIES, CompetencyItem, getUserGapCompetencies, fetchApi, UserProfile, MOCK_PROFILE, getUserStreak, setUserStreak } from "@/lib/api";
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
  RotateCcw,
  BookOpen,
  Lock,
  ExternalLink,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  Info,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import HexagonalStatsGraph from "@/components/HexagonalStatsGraph";
import { useAuth } from "@/contexts/AuthContext";

export interface SkillNode {
  id: string;
  name: string;
  domain: string;
  category: "root" | "competency" | "skill" | "topic" | "module";
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  status: "completed" | "in_progress" | "upcoming" | "backlog" | "locked";
  phase: number;
  whyRequired: string;
  isBacklogRecovery?: boolean;
  recommendedCourse: {
    title: string;
    provider: string;
    durationMinutes: number;
    courseUrl: string;
  };
  children?: SkillNode[];
}

export default function Roadmap() {
  const { user } = useAuth();

  // Unified Competencies from Assessment
  const [userCompetencies, setUserCompetencies] = useState<CompetencyItem[]>(() => getUserGapCompetencies(user));

  // Form & Onboarding Target Timeline State
  const [isGenerated, setIsGenerated] = useState(true);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [targetRole, setTargetRole] = useState("Data Scientist");
  const [currentSkillLevel, setCurrentSkillLevel] = useState("Intermediate");
  const [assessmentStatus, setAssessmentStatus] = useState("Assessment Completed");
  const [targetCompletion, setTargetCompletion] = useState("3 Months");
  const [learningTime, setLearningTime] = useState("1 hour/day");
  const [primaryGoal, setPrimaryGoal] = useState("Become Job Ready");

  // Streak & Backlog Recovery State (Per-user scoped)
  const [streakDays, setStreakDays] = useState(() => getUserStreak(user));
  const [isStreakBroken, setIsStreakBroken] = useState(() => {
    if (typeof window === "undefined") return false;
    const cleanEmail = (user?.email || "").toLowerCase().trim();
    const savedBroken =
      (user?.id && localStorage.getItem(`kaushalsetu_streak_broken_${user.id}`)) ||
      (cleanEmail && localStorage.getItem(`kaushalsetu_streak_broken_${cleanEmail}`));
    return savedBroken === "true";
  });
  const [missedDaysCount, setMissedDaysCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const cleanEmail = (user?.email || "").toLowerCase().trim();
    const savedMissed =
      (user?.id && localStorage.getItem(`kaushalsetu_missed_days_${user.id}`)) ||
      (cleanEmail && localStorage.getItem(`kaushalsetu_missed_days_${cleanEmail}`));
    return savedMissed ? parseInt(savedMissed) || 0 : 0;
  });
  const [isBacklogRecovered, setIsBacklogRecovered] = useState(false);
  const [recalculatedNotice, setRecalculatedNotice] = useState<string | null>(null);

  // Active Weekly Schedule Tab (Default Week 1)
  const [activeWeek, setActiveWeek] = useState(1);
  const [todayCompleted, setTodayCompleted] = useState(false);

  // Hydrate Initial Setup and Profile Data from Onboarding / LocalStorage
  useEffect(() => {
    setUserCompetencies(getUserGapCompetencies(user));
    setStreakDays(getUserStreak(user));

    const handleUpdate = () => setStreakDays(getUserStreak(user));
    window.addEventListener("kaushalsetu_streak_updated", handleUpdate);

    const cleanEmail = (user?.email || "").toLowerCase().trim();
    const savedProfile =
      (user?.id && localStorage.getItem(`kaushalsetu_profile_${user.id}`)) ||
      (cleanEmail && localStorage.getItem(`kaushalsetu_profile_${cleanEmail}`)) ||
      localStorage.getItem("kaushalsetu_profile_global");

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.currentJobRole || parsed.targetRole) {
          setTargetRole(parsed.currentJobRole || parsed.targetRole || "Data Scientist");
        }
        if (parsed.targetTimeline) {
          setTargetCompletion(parsed.targetTimeline);
        }
        if (parsed.dailyTime) {
          setLearningTime(parsed.dailyTime);
        }
      } catch {}
    }
    return () => window.removeEventListener("kaushalsetu_streak_updated", handleUpdate);
  }, [user]);

  // Dynamic Weekly Breakdown Calculation based on User's Onboarding Timeframe
  const getMonths = (timeframeStr: string) => {
    if (timeframeStr.includes("1 Month")) return 1;
    if (timeframeStr.includes("3 Months")) return 3;
    if (timeframeStr.includes("6 Months")) return 6;
    if (timeframeStr.includes("12 Months")) return 12;
    return 3;
  };

  const monthsNum = getMonths(targetCompletion);
  const totalDays = monthsNum * 30;
  const totalWeeks = Math.max(4, Math.round(totalDays / 7));

  // NotebookLM-Style Interactive Mind Map State (Pan & Zoom + Collapse)
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Interactive Side Drawer State
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom Controls
  const handleZoomIn = () => setZoomScale((z) => Math.min(1.8, z + 0.15));
  const handleZoomOut = () => setZoomScale((z) => Math.max(0.6, z - 0.15));
  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".interactive-node")) return;
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

  // Collapse / Expand Toggle
  const toggleNodeCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Derive Overall Target Readiness
  const totalRequired = userCompetencies.reduce((acc, curr) => acc + curr.requiredLevel, 0);
  const totalCurrent = userCompetencies.reduce((acc, curr) => acc + curr.currentLevel, 0);
  const overallReadiness = Math.min(100, Math.round((totalCurrent / Math.max(1, totalRequired)) * 100));

  // Compute estimated learning hours based on time target
  const hoursPerDay = learningTime.includes("30") ? 0.5 : learningTime.includes("2") ? 2 : 1;
  const totalHours = Math.round(totalDays * hoursPerDay * 0.7);

  // Helper to fetch competency data points
  const getCompetencyLevel = (namePattern: string, defaultCurrent = 2, defaultReq = 4) => {
    const found = userCompetencies.find((c) => c.name.toLowerCase().includes(namePattern.toLowerCase()));
    if (found) {
      return { current: found.currentLevel, required: found.requiredLevel, gap: found.gap };
    }
    return { current: defaultCurrent, required: defaultReq, gap: Math.max(0, defaultReq - defaultCurrent) };
  };

  const pythonData = getCompetencyLevel("Python", 2, 4);
  const statsData = getCompetencyLevel("Sampling", 3, 5);
  const sqlData = getCompetencyLevel("SQL", 3, 4);
  const mlData = getCompetencyLevel("AI", 1, 3);

  // Build Skill-Tree Mind Map Structure
  const skillTreeNodes: SkillNode[] = [
    {
      id: "root",
      name: targetRole.toUpperCase(),
      domain: "Target Career Role",
      category: "root",
      currentLevel: Math.round(overallReadiness / 20),
      requiredLevel: 5,
      gap: Math.max(0, 5 - Math.round(overallReadiness / 20)),
      status: overallReadiness >= 80 ? "completed" : "in_progress",
      phase: 1,
      whyRequired: `Core target role benchmark for ${targetRole} in government analytics and policy decision making.`,
      recommendedCourse: {
        title: `${targetRole} Professional Career Pathway`,
        provider: "iGOT Karmayogi",
        durationMinutes: totalHours * 60,
        courseUrl: "https://igotkarmayogi.gov.in/",
      },
      children: [
        {
          id: "node-python",
          name: "PYTHON FOR STATISTICS",
          domain: "Technical",
          category: "competency",
          currentLevel: pythonData.current,
          requiredLevel: pythonData.required,
          gap: pythonData.gap,
          status: pythonData.current >= pythonData.required ? "completed" : isStreakBroken && !isBacklogRecovered ? "backlog" : "in_progress",
          phase: 1,
          whyRequired: "Python is required for automated statistical data processing, Pandas dataframes, and survey computations.",
          recommendedCourse: {
            title: "Python for Statistical Data Analysis in Governance",
            provider: "iGOT Karmayogi",
            durationMinutes: 180,
            courseUrl: "https://igotkarmayogi.gov.in/courses/python",
          },
          children: [
            {
              id: "node-pandas",
              name: "Pandas & NumPy Dataframes",
              domain: "Technical",
              category: "skill",
              currentLevel: Math.min(5, pythonData.current + 1),
              requiredLevel: 4,
              gap: Math.max(0, 4 - (pythonData.current + 1)),
              status: pythonData.current >= 3 ? "completed" : "in_progress",
              phase: 1,
              whyRequired: "Essential for loading census CSV/Excel files and running fast matrix math.",
              recommendedCourse: {
                title: "Data Wrangling with Pandas & NumPy",
                provider: "iGOT Karmayogi",
                durationMinutes: 120,
                courseUrl: "https://igotkarmayogi.gov.in/courses/python",
              },
            },
            {
              id: "node-data-cleaning",
              name: "Data Cleaning & Imputation",
              domain: "Technical",
              category: "topic",
              currentLevel: pythonData.current,
              requiredLevel: 4,
              gap: pythonData.gap,
              status: isStreakBroken || isBacklogRecovered ? "backlog" : pythonData.current >= 4 ? "completed" : "in_progress",
              isBacklogRecovery: isStreakBroken || isBacklogRecovered,
              phase: 2,
              whyRequired: "Impute missing survey responses and sanitize government field returns. Rebalanced to cover missed learning days.",
              recommendedCourse: {
                title: "Statistical Cleaning & Imputation Pipelines (Accelerated Catch-Up)",
                provider: "NSSTA TPAC",
                durationMinutes: 150,
                courseUrl: "https://nssta.gov.in/courses/quality",
              },
            },
          ],
        },
        {
          id: "node-statistics",
          name: "STATISTICS & SAMPLING",
          domain: "Statistical",
          category: "competency",
          currentLevel: statsData.current,
          requiredLevel: statsData.required,
          gap: statsData.gap,
          status: statsData.current >= statsData.required ? "completed" : "in_progress",
          phase: 1,
          whyRequired: "Fundamental for national sample design, stratification, weighting, and confidence intervals.",
          recommendedCourse: {
            title: "Advanced Sampling Techniques for National Surveys",
            provider: "NSSTA TPAC",
            durationMinutes: 240,
            courseUrl: "https://nssta.gov.in/courses/sampling",
          },
          children: [
            {
              id: "node-probability",
              name: "Probability & Stratification",
              domain: "Statistical",
              category: "skill",
              currentLevel: statsData.current,
              requiredLevel: 5,
              gap: Math.max(0, 5 - statsData.current),
              status: statsData.current >= 4 ? "completed" : "in_progress",
              phase: 1,
              whyRequired: "Designing multi-stage stratified sample frames for NSSO socio-economic rounds.",
              recommendedCourse: {
                title: "Probability Sampling & Stratified Frames",
                provider: "NSSTA TPAC",
                durationMinutes: 180,
                courseUrl: "https://nssta.gov.in/courses/sampling",
              },
            },
            {
              id: "node-regression",
              name: "Regression & Policy Inference",
              domain: "Statistical",
              category: "topic",
              currentLevel: Math.max(1, statsData.current - 1),
              requiredLevel: 4,
              gap: Math.max(0, 4 - (statsData.current - 1)),
              status: isBacklogRecovered ? "backlog" : statsData.current >= 4 ? "completed" : "upcoming",
              isBacklogRecovery: isBacklogRecovered,
              phase: 3,
              whyRequired: "Estimating econometric policy impact and trend regression for ministry reports.",
              recommendedCourse: {
                title: "Applied Econometric Regression for Policy",
                provider: "iGOT Karmayogi",
                durationMinutes: 200,
                courseUrl: "https://igotkarmayogi.gov.in/",
              },
            },
          ],
        },
        {
          id: "node-sql",
          name: "SQL & DATABASE QUERYING",
          domain: "Technical",
          category: "competency",
          currentLevel: sqlData.current,
          requiredLevel: sqlData.required,
          gap: sqlData.gap,
          status: sqlData.current >= sqlData.required ? "completed" : "in_progress",
          phase: 2,
          whyRequired: "Querying relational microdata databases, joining multi-round survey tables, and CTE aggregations.",
          recommendedCourse: {
            title: "SQL Fundamentals for Government Data Systems",
            provider: "iGOT Karmayogi",
            durationMinutes: 120,
            courseUrl: "https://igotkarmayogi.gov.in/courses/sql",
          },
          children: [
            {
              id: "node-joins",
              name: "Complex Joins & Aggregation",
              domain: "Technical",
              category: "skill",
              currentLevel: sqlData.current,
              requiredLevel: 4,
              gap: sqlData.gap,
              status: sqlData.current >= 3 ? "completed" : "in_progress",
              phase: 2,
              whyRequired: "Joining household schedules with individual member rosters without duplication.",
              recommendedCourse: {
                title: "Advanced Relational SQL for Government Data",
                provider: "iGOT Karmayogi",
                durationMinutes: 150,
                courseUrl: "https://igotkarmayogi.gov.in/courses/sql",
              },
            },
          ],
        },
        {
          id: "node-ml",
          name: "MACHINE LEARNING & AI",
          domain: "Advanced AI",
          category: "competency",
          currentLevel: mlData.current,
          requiredLevel: mlData.required,
          gap: mlData.gap,
          status: mlData.current >= mlData.required ? "completed" : "upcoming",
          phase: 4,
          whyRequired: "Predictive policy modeling, anomaly detection in schemes, and AI-assisted data governance.",
          recommendedCourse: {
            title: "Applied AI & Machine Learning for Public Policy",
            provider: "iGOT Karmayogi",
            durationMinutes: 300,
            courseUrl: "https://igotkarmayogi.gov.in/courses/ai-policy",
          },
          children: [
            {
              id: "node-predictive",
              name: "Supervised ML Policy Models",
              domain: "Advanced AI",
              category: "topic",
              currentLevel: mlData.current,
              requiredLevel: 3,
              gap: mlData.gap,
              status: "upcoming",
              phase: 4,
              whyRequired: "Predicting beneficiary dropouts and target allocation using Random Forest and XGBoost.",
              recommendedCourse: {
                title: "Machine Learning Models for Scheme Targeting",
                provider: "NVIDIA AI Institute",
                durationMinutes: 240,
                courseUrl: "https://igotkarmayogi.gov.in/",
              },
            },
            {
              id: "node-nlp",
              name: "NLP & Document AI",
              domain: "Advanced AI",
              category: "topic",
              currentLevel: 1,
              requiredLevel: 3,
              gap: 2,
              status: "locked",
              phase: 5,
              whyRequired: "Extracting insights from unstructured public grievance logs and administrative text.",
              recommendedCourse: {
                title: "NLP for Administrative Intelligence",
                provider: "NVIDIA AI Institute",
                durationMinutes: 300,
                courseUrl: "https://igotkarmayogi.gov.in/",
              },
            },
          ],
        },
      ],
    },
  ];

  // Handle Form Submission
  const handleGenerateRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerated(true);
    setShowSetupForm(false);
    setRecalculatedNotice(`Roadmap generated for ${targetRole} (${targetCompletion} target, ${learningTime}).`);
  };

  // Daily Topic Completion Action
  const handleCompleteToday = () => {
    setTodayCompleted(true);
    const nextStreak = streakDays + 1;
    setStreakDays(nextStreak);
    setUserStreak(user, nextStreak);
    setRecalculatedNotice("Great job! Today's scheduled topic marked completed. Streak incremented!");
  };

  // Accelerated Backlog Catch-Up Recalculation
  const handleCoverBacklogASAP = () => {
    setIsStreakBroken(false);
    setIsBacklogRecovered(true);
    setMissedDaysCount(0);
    setRecalculatedNotice(
      "Roadmap recalculated! 4 missed topics consolidated into 2 accelerated catch-up micro-modules (+15 min/day) highlighted in distinct Amber/Orange so you catch up in 5 days without schedule overload."
    );
  };

  // Roadmap.sh Theme Checkmark Pill Badge Helper
  const renderPillBadge = (status: SkillNode["status"], isBacklogRecovery?: boolean) => {
    if (isBacklogRecovery || status === "backlog") {
      return (
        <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black tracking-wider flex items-center gap-1 border border-amber-300/40 shadow-xs shrink-0">
          <AlertTriangle className="h-3 w-3 text-amber-400" /> BACKLOG (+15m)
        </span>
      );
    }
    if (status === "completed") {
      return (
        <span className="h-5 w-5 rounded-full bg-indigo-700 text-white flex items-center justify-center text-[10px] font-bold shadow-xs shrink-0">
          ✓
        </span>
      );
    }
    if (status === "in_progress") {
      return (
        <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-ping inline-block shrink-0" />
      );
    }
    if (status === "locked") {
      return (
        <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      );
    }
    return (
      <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block shrink-0" />
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Banner with Streak Badge & Onboarding Target Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-900 border-blue-200 text-[10px] font-bold">
                Onboarding Target: {targetCompletion} ({totalWeeks} Weeks / {totalDays} Days)
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight flex items-center gap-2.5 mt-1">
              <Map className="h-7 w-7 text-blue-800" />
              Career Gap Analysis & Skill Roadmap
            </h1>
            <p className="text-slate-600 text-sm mt-1 font-medium">
              Personalized AI learning pathway adapted to your current test scores, target role, and daily commitment.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Daily Streak Counter */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl shadow-xs">
              <Flame className="h-4 w-4 text-amber-600 fill-amber-500/20" />
              <span className="text-xs font-bold text-amber-900">{streakDays} Day Streak</span>
            </div>

            {/* Natural Inactivity Status Indicator */}
            <button
              type="button"
              onClick={() => {
                setIsStreakBroken(!isStreakBroken);
                setIsBacklogRecovered(false);
              }}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-300 px-3.5 py-1.5 rounded-xl hover:bg-amber-100/60 transition-all"
              title="Click to toggle missed days state for testing"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
              <span className="text-xs font-extrabold text-amber-950">
                {isStreakBroken ? "⚡ 4 Missed Days Detected" : "⚡ Roadmap Adaptive Engine Active"}
              </span>
            </button>

            <Button
              onClick={() => setShowSetupForm(!showSetupForm)}
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5 text-blue-800" />
              {showSetupForm ? "Hide Setup Form" : "Reconfigure Settings"}
            </Button>
          </div>
        </div>

        {/* WELCOME BACK & INACTIVITY BACKLOG RECOVERY NOTIFICATION BANNER */}
        {isStreakBroken && !isBacklogRecovered && (
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm space-y-3 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-xs">
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                    👋 Welcome back! You missed {missedDaysCount || 4} days of learning.
                  </h3>
                  <p className="text-xs text-amber-900 font-medium mt-1 leading-relaxed max-w-3xl">
                    We noticed you logged back in after {missedDaysCount || 4} inactive days. To keep your learning on track without schedule overload, KaushalSetu has identified <strong className="text-amber-950 font-black">2 backlog catch-up modules</strong> highlighted in <strong className="text-amber-950 font-black">Glowing Amber/Orange</strong> in your roadmap graph below (+15 mins/day).
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCoverBacklogASAP}
                className="bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs shrink-0 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Rebalance Schedule & Catch Up
              </Button>
            </div>
          </div>
        )}

        {isBacklogRecovered && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 shadow-sm space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                <h3 className="text-sm font-extrabold text-amber-950">
                  ⚡ Backlog Catch-Up Activated & Integrated into Roadmap Graph
                </h3>
              </div>
              <Button
                onClick={() => setIsBacklogRecovered(false)}
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-amber-900 hover:bg-amber-100"
              >
                View Missed Days Alert
              </Button>
            </div>
            <p className="text-xs text-amber-900 font-medium">
              Your 4 missed learning days have been converted into 2 accelerated catch-up micro-modules (+15 min/day) highlighted in <strong className="text-amber-950 font-black">Glowing Amber/Orange</strong> in the graph below. Complete them to fully restore your streak momentum!
            </p>
          </div>
        )}

        {/* INLINE SETUP FORM ("Build Your Personalized Roadmap") */}
        {(!isGenerated || showSetupForm) && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 animate-in fade-in duration-300">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-800" />
                  Build Your Personalized Roadmap
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
                  Tell us where you are now and where you want to go. We'll create a learning roadmap based on your current skills, target role and available time.
                </p>
              </div>

              {isGenerated && (
                <button type="button" onClick={() => setShowSetupForm(false)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleGenerateRoadmap} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Target Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-semibold"
                  >
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Statistical Officer">Statistical Officer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Data Engineer">Data Engineer</option>
                    <option value="Survey Officer">Survey Officer</option>
                    <option value="Data Processing Officer">Data Processing Officer</option>
                  </select>
                </div>

                {/* Current Skill Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Current Skill Level</label>
                  <select
                    value={currentSkillLevel}
                    onChange={(e) => setCurrentSkillLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-semibold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Assessment Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Assessment Status</label>
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs p-3 font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    {assessmentStatus} (Verified)
                  </div>
                </div>

                {/* Target Completion */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Completion</label>
                  <select
                    value={targetCompletion}
                    onChange={(e) => setTargetCompletion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-semibold"
                  >
                    <option value="1 Month">1 Month (30 Days)</option>
                    <option value="3 Months">3 Months (90 Days)</option>
                    <option value="6 Months">6 Months (180 Days)</option>
                    <option value="12 Months">12 Months (365 Days)</option>
                  </select>
                </div>

                {/* Learning Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Learning Time</label>
                  <select
                    value={learningTime}
                    onChange={(e) => setLearningTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-semibold"
                  >
                    <option value="15 min/day">15 min/day</option>
                    <option value="30 min/day">30 min/day</option>
                    <option value="45 min/day">45 min/day</option>
                    <option value="1 hour/day">1 hour/day</option>
                    <option value="2 hours/day">2 hours/day</option>
                  </select>
                </div>

                {/* Primary Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Primary Goal</label>
                  <select
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-semibold"
                  >
                    <option value="Become Job Ready">Become Job Ready</option>
                    <option value="Mastery">Mastery</option>
                    <option value="Skill Upskilling">Skill Upskilling</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Target className="h-4 w-4" /> Generate My Roadmap
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* AFTER GENERATION SUMMARY BANNER */}
        {isGenerated && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-x divide-slate-200">
              <div className="px-3">
                <p className="text-[11px] text-slate-500 font-bold">Target Role</p>
                <p className="text-sm font-black text-[#0f172a] mt-0.5">{targetRole}</p>
              </div>

              <div className="px-3">
                <p className="text-[11px] text-slate-500 font-bold">Time Target</p>
                <p className="text-sm font-black text-blue-900 mt-0.5">{targetCompletion} ({totalWeeks} Weeks)</p>
              </div>

              <div className="px-3">
                <p className="text-[11px] text-slate-500 font-bold">Current Readiness</p>
                <p className="text-sm font-black text-emerald-700 mt-0.5">{overallReadiness}%</p>
              </div>

              <div className="px-3">
                <p className="text-[11px] text-slate-500 font-bold">Estimated Learning</p>
                <p className="text-sm font-black text-amber-900 mt-0.5">{totalHours} hours</p>
              </div>

              <div className="px-3">
                <p className="text-[11px] text-slate-500 font-bold">Daily Commitment</p>
                <p className="text-sm font-black text-indigo-900 mt-0.5">{learningTime}</p>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC WEEKLY PROGRESSION BREAKDOWN ({totalWeeks} WEEKS) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-800" />
                Weekly Schedule Breakdown ({totalWeeks} Weeks / {totalDays} Days)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Structured learning trajectory derived from your onboarding target timeline.
              </p>
            </div>

            <Button
              onClick={handleCompleteToday}
              disabled={todayCompleted}
              className={`${
                todayCompleted
                  ? "bg-emerald-700 text-white cursor-default"
                  : "bg-[#1e3a8a] hover:bg-blue-900 text-white"
              } font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs`}
            >
              <CheckSquare className="h-4 w-4" />
              {todayCompleted ? "Today's Topic Completed! ✓" : "Complete Today's Topic (Day 12)"}
            </Button>
          </div>

          {/* WEEKLY TABS SELECTOR */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {Array.from({ length: Math.min(12, totalWeeks) }).map((_, idx) => {
              const weekNum = idx + 1;
              const isActive = activeWeek === weekNum;
              return (
                <button
                  key={weekNum}
                  type="button"
                  onClick={() => setActiveWeek(weekNum)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
                    isActive
                      ? "bg-[#0f172a] border-slate-900 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Week {weekNum}
                </button>
              );
            })}
          </div>

          {/* ACTIVE WEEKLY FOCUS SUMMARY */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-blue-900 font-extrabold">Week {activeWeek} Focus:</span>
              <p className="text-slate-900 font-bold">
                {activeWeek === 1
                  ? "Python Foundations, Pandas CSV Dataframes & Matrix Ops"
                  : activeWeek === 2
                  ? "SQL Relational Queries, Multi-table Joins & CTE Aggregation"
                  : activeWeek === 3
                  ? "Probability Sampling, Stratification & Confidence Intervals"
                  : activeWeek === 4
                  ? "Applied Regression, Econometric Inference & Policy Reporting"
                  : `Advanced Module Phase ${activeWeek} — Model Evaluation & Governance`}
              </p>
            </div>

            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900 text-[10px] font-bold self-start sm:self-auto">
              Days {(activeWeek - 1) * 7 + 1}–{activeWeek * 7} Scheduled
            </Badge>
          </div>

          {/* REBALANCED BACKLOG CATCH-UP QUEUE IN WEEKLY SCHEDULE */}
          {(isBacklogRecovered || isStreakBroken) && (
            <div className="p-4.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>⚡ Rebalanced Backlog Catch-Up Queue ({missedDaysCount || 4} Missed Days)</span>
                </div>
                <Badge className="bg-amber-400 text-slate-950 font-black text-[10px]">
                  +15 Min / Day Pacing
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">Catch-Up Module #1</span>
                    <p className="text-xs font-extrabold text-[#0f172a]">Data Cleaning & Imputation</p>
                    <p className="text-[10px] text-slate-500 font-medium">Rebalanced from 4 missed learning days</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setRecalculatedNotice("Backlog Catch-Up Module 'Data Cleaning & Imputation' marked completed!");
                      setStreakDays((s) => s + 1);
                    }}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow-2xs shrink-0"
                  >
                    Catch Up ✓
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">Catch-Up Module #2</span>
                    <p className="text-xs font-extrabold text-[#0f172a]">Regression & Policy Inference</p>
                    <p className="text-[10px] text-slate-500 font-medium">Rebalanced from 4 missed learning days</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsBacklogRecovered(false);
                      setIsStreakBroken(false);
                      setRecalculatedNotice("All Backlog Catch-Up modules completed! Full streak momentum restored.");
                      setStreakDays((s) => s + 2);
                    }}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow-2xs shrink-0"
                  >
                    Catch Up ✓
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Adaptive Recalculation Notice Banner */}
        {recalculatedNotice && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-800 shrink-0" />
              <span>{recalculatedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setRecalculatedNotice(null)}
              className="text-blue-900 hover:underline text-[11px] font-black shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hexagonal Radar Graph View */}
        <HexagonalStatsGraph
          data={userCompetencies.map((c) => ({
            name: c.name,
            currentLevel: c.currentLevel,
            targetLevel: c.requiredLevel,
          }))}
          targetRole={targetRole}
        />

        {/* NOTEBOOKLM-STYLE INTERACTIVE MIND MAP CANVAS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-800" />
                Interactive Competency Mind Map ({targetRole})
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Drag to pan, scroll/click to zoom. <strong className="text-amber-800">Rebalanced Backlog Catch-Up nodes are distinctly highlighted in Glowing Amber/Orange</strong>.
              </p>
            </div>

            {/* FLOATING PAN & ZOOM CONTROLS */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs self-start sm:self-auto">
              <Button
                onClick={handleZoomIn}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-bold"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleZoomOut}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-bold"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleResetZoom}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[11px] font-bold text-blue-900 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                title="Fit to View"
              >
                <Maximize2 className="h-3.5 w-3.5" /> Fit
              </Button>
              <span className="text-[10px] font-extrabold text-slate-600 px-2 border-l border-slate-200">
                {Math.round(zoomScale * 100)}%
              </span>
            </div>
          </div>

          {/* NOTEBOOKLM INTERACTIVE MIND MAP CANVAS CONTAINER */}
          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`p-8 rounded-3xl bg-white border border-slate-200 min-h-[560px] overflow-hidden select-none shadow-xs relative cursor-grab ${
              isDragging ? "cursor-grabbing" : ""
            }`}
          >
            {/* TRANSFORM WRAPPER FOR PAN & ZOOM */}
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transformOrigin: "top center",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="space-y-12 min-w-[880px] relative z-10"
            >
              {skillTreeNodes.map((rootNode) => (
                <div key={rootNode.id} className="space-y-10 relative">
                  {/* 1. TOP PURPLE MILESTONE CONTAINER: TARGET ROLE */}
                  <div className="flex justify-center">
                    <div
                      onClick={() => setSelectedNode(rootNode)}
                      onMouseEnter={() => setHoveredNodeId(rootNode.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="interactive-node cursor-pointer p-4 rounded-2xl bg-[#1e1b4b] border-2 border-indigo-500 shadow-md text-center min-w-[300px] hover:bg-indigo-950 transition-all hover:scale-105"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Target className="h-5 w-5 text-white" />
                        <span className="font-black text-white text-lg tracking-wider">{rootNode.name}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="bg-indigo-950 text-indigo-200 border border-indigo-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                          {overallReadiness}% Role Readiness
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. SVG CONNECTING CURVES LAYER WITH ACTIVE PATH HIGHLIGHTING */}
                  <div className="relative h-12 w-full">
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                      <line
                        x1="50%"
                        y1="0"
                        x2="50%"
                        y2="24"
                        stroke={hoveredNodeId ? "#1e3a8a" : "#475569"}
                        strokeWidth={hoveredNodeId ? "3.5" : "2.5"}
                        className="transition-all"
                      />
                      <line x1="12.5%" y1="24" x2="87.5%" y2="24" stroke="#475569" strokeWidth="2.5" />
                      <line x1="12.5%" y1="24" x2="12.5%" y2="48" stroke="#475569" strokeWidth="2.5" />
                      <line x1="37.5%" y1="24" x2="37.5%" y2="48" stroke="#475569" strokeWidth="2.5" />
                      <line x1="62.5%" y1="24" x2="62.5%" y2="48" stroke="#475569" strokeWidth="2.5" />
                      <line x1="87.5%" y1="24" x2="87.5%" y2="48" stroke="#475569" strokeWidth="2.5" />
                    </svg>
                  </div>

                  {/* 3. 4-COLUMN ROADMAP.SH PILLARS WITH EXPAND/COLLAPSE */}
                  <div className="grid grid-cols-4 gap-6">
                    {rootNode.children?.map((compNode) => {
                      const isCollapsed = collapsedNodes.has(compNode.id);
                      return (
                        <div key={compNode.id} className="flex flex-col items-center space-y-4">
                          {/* PURPLE PILLAR TITLE BOX WITH EXPAND/COLLAPSE BADGE */}
                          <div
                            onClick={() => setSelectedNode(compNode)}
                            onMouseEnter={() => setHoveredNodeId(compNode.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                            className="interactive-node cursor-pointer w-full p-3 rounded-xl bg-indigo-900 border-2 border-indigo-600 shadow-xs hover:bg-indigo-800 transition-colors relative group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white text-xs tracking-wider uppercase block">
                                {compNode.name}
                              </span>

                              {/* COLLAPSE / EXPAND TOGGLE */}
                              <button
                                type="button"
                                onClick={(e) => toggleNodeCollapse(compNode.id, e)}
                                className="p-1 rounded-md bg-indigo-950 text-indigo-200 text-[10px] font-bold flex items-center gap-1 border border-indigo-400"
                                title={isCollapsed ? "Expand Branch" : "Collapse Branch"}
                              >
                                {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                              </button>
                            </div>

                            <span className="text-[10px] text-indigo-200 font-bold block mt-1">
                              Phase {compNode.phase} • Level {compNode.currentLevel}/{compNode.requiredLevel}
                            </span>
                          </div>

                          {/* SUB-TOPIC GROUP CONTAINER WITH YELLOW/GOLD AND DISTINCT AMBER/ORANGE BACKLOG PILLS */}
                          {!isCollapsed ? (
                            <div className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-inner animate-in fade-in zoom-in-95 duration-200">
                              {compNode.children?.map((subNode) => {
                                const isBacklogNode = subNode.isBacklogRecovery || subNode.status === "backlog";
                                return (
                                  <div
                                    key={subNode.id}
                                    onClick={() => setSelectedNode(subNode)}
                                    onMouseEnter={() => setHoveredNodeId(subNode.id)}
                                    onMouseLeave={() => setHoveredNodeId(null)}
                                    className={`interactive-node cursor-pointer p-3 rounded-xl border-2 transition-all shadow-xs flex items-center justify-between gap-2 hover:scale-[1.02] ${
                                      isBacklogNode
                                        ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 border-amber-500 text-slate-950 font-black shadow-md animate-pulse hover:from-amber-300 hover:to-orange-300"
                                        : subNode.status === "completed"
                                        ? "bg-amber-200 border-amber-400 text-slate-950 font-black hover:bg-amber-100"
                                        : subNode.status === "in_progress"
                                        ? "bg-blue-700 border-blue-900 text-white font-extrabold hover:bg-blue-600"
                                        : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
                                    }`}
                                  >
                                    <span className="font-extrabold text-xs tracking-tight line-clamp-1">
                                      {subNode.name}
                                    </span>
                                    {renderPillBadge(subNode.status, subNode.isBacklogRecovery)}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div
                              onClick={(e) => toggleNodeCollapse(compNode.id, e)}
                              className="interactive-node cursor-pointer p-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                            >
                              <span>+ {compNode.children?.length || 0} Topics Collapsed</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NODE CLICK INTERACTION SIDE DRAWER WITH BACKLOG ALERT CALLOUT */}
        {selectedNode && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl p-6 z-50 space-y-5 animate-in slide-in-from-right duration-250 overflow-y-auto text-[#0f172a]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="space-y-1">
                <Badge className="bg-slate-100 text-slate-700 text-[10px] font-bold">{selectedNode.domain}</Badge>
                <h3 className="font-extrabold text-[#0f172a] text-lg">{selectedNode.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* DISTINCT BACKLOG RECOVERY WARNING CALLOUT */}
            {(selectedNode.isBacklogRecovery || selectedNode.status === "backlog") && (
              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-xs text-amber-950 space-y-1 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>⚠ ACCELERATED BACKLOG CATCH-UP TASK</span>
                </div>
                <p className="text-[11px] text-amber-900 font-medium leading-snug">
                  This topic was rebalanced into your schedule to cover 4 missed learning days. Complete this module ASAP to restore your full streak momentum in 5 days!
                </p>
              </div>
            )}

            {/* Node Status & Level Specs */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold">Node Status</span>
                <Badge className={`${selectedNode.isBacklogRecovery || selectedNode.status === "backlog" ? "bg-amber-400 text-slate-950 font-black" : "bg-blue-100 text-blue-900 font-bold"} text-xs px-2.5 py-0.5`}>
                  {selectedNode.isBacklogRecovery ? "BACKLOG CATCH-UP" : selectedNode.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold">Current</p>
                  <p className="text-sm font-black text-[#0f172a]">{selectedNode.currentLevel} / 5</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold">Required</p>
                  <p className="text-sm font-black text-blue-900">{selectedNode.requiredLevel} / 5</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold">Gap</p>
                  <p className="text-sm font-black text-rose-700">-{selectedNode.gap}</p>
                </div>
              </div>
            </div>

            {/* Role Justification */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-800" /> Why this is required:
              </p>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                "{selectedNode.whyRequired}"
              </p>
            </div>

            {/* Recommended Learning Module */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
                  {selectedNode.recommendedCourse.provider}
                </Badge>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                  <Clock className="h-3 w-3" /> {selectedNode.recommendedCourse.durationMinutes} mins
                </span>
              </div>

              <h4 className="font-bold text-xs text-[#0f172a] leading-snug">
                {selectedNode.recommendedCourse.title}
              </h4>

              <a
                href={selectedNode.recommendedCourse.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow-xs"
              >
                Start Learning Module <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
