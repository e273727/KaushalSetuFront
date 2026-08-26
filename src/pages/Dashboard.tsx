import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import {
  MOCK_PROFILE,
  MOCK_COMPETENCIES,
  MOCK_COURSES,
  fetchApi,
  UserProfile,
  CompetencyItem,
  CourseItem,
  getUserGapCompetencies
} from "@/lib/api";
import {
  Award,
  Flame,
  Target,
  BookOpen,
  HelpCircle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  User,
  Building2,
  Briefcase,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import HexagonalStatsGraph from "@/components/HexagonalStatsGraph";

import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [competencies, setCompetencies] = useState<CompetencyItem[]>(() => getUserGapCompetencies(user));
  const [courses, setCourses] = useState<CourseItem[]>(MOCK_COURSES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const userProf = await fetchApi<UserProfile>("/profile", MOCK_PROFILE);
      const crses = await fetchApi<CourseItem[]>("/courses", MOCK_COURSES);

      // Hydrate with user's actual onboarding diagnostic assessment gap matrix
      const userComps = getUserGapCompetencies(user);
      setCompetencies(userComps);

      if (userProf) setProfile(userProf);
      if (crses) setCourses(crses);
      setLoading(false);
    }
    loadData();
  }, [user]);

  // Calculate overall readiness score
  const totalRequired = competencies.reduce((acc, curr) => acc + curr.requiredLevel, 0);
  const totalCurrent = competencies.reduce((acc, curr) => acc + curr.currentLevel, 0);
  const overallReadiness = Math.round((totalCurrent / totalRequired) * 100);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Officer Profile Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/20 shrink-0">
                {profile.fullName.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{profile.fullName}</h1>
                  <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-400 font-semibold">
                    {profile.currentJobRole}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {profile.department}
                </p>
                <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-400" /> {profile.highestQualification}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" /> {profile.yearsOfExperience} Yrs Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Competency Progress Card */}
            <div className="w-full md:w-auto bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Target Role Readiness</span>
                <span className="text-blue-400 font-bold text-sm">{overallReadiness}%</span>
              </div>
              <Progress value={overallReadiness} className="h-2.5 bg-slate-800" />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Current: {totalCurrent} pts</span>
                <span>Target: {totalRequired} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Dashboard Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Active Daily Streak</p>
              <p className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                <Flame className="h-6 w-6 text-amber-400 fill-amber-400/20" />
                {profile.currentStreak} Days
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Tracked Competencies</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{competencies.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Target className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Skill Gaps Identified</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {competencies.filter(c => c.gap > 0).length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Mapped iGOT Courses</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{courses.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Competencies Breakdown & Gap Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Competency Gap Breakdown & Hexagonal Comparison Radar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Competency Gap Breakdown & Radar Analysis
                </h2>
                <p className="text-xs text-slate-400">Diagnostic test-verified levels vs target standard for {profile.currentJobRole}</p>
              </div>
              <Link href="/roadmap">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-xs">
                  Full Gap Analysis <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Visual Competency Comparison Hexagonal Radar Graph */}
            <HexagonalStatsGraph
              data={competencies.map((c) => ({
                name: c.name,
                currentLevel: c.currentLevel,
                targetLevel: c.requiredLevel,
              }))}
              targetRole={profile.currentJobRole}
            />

            {/* Detailed Itemized Competency Gap Matrix List */}
            <div className="space-y-3">
              {competencies.map((item) => {
                const percent = Math.round((item.currentLevel / item.requiredLevel) * 100);
                return (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{item.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {item.domain}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white">
                          Level {item.currentLevel} <span className="text-slate-500">/ {item.requiredLevel}</span>
                        </span>
                        {item.gap > 0 ? (
                          <p className="text-[11px] text-rose-400 font-semibold">Gap: -{item.gap} Level</p>
                        ) : (
                          <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Met
                          </p>
                        )}
                      </div>
                    </div>
                    <Progress value={percent} className="h-2 bg-slate-800" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Recommended iGOT Courses & AI Quiz Generator */}
          <div className="space-y-6">
            {/* Recommended iGOT Courses Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  Recommended iGOT Courses
                </h3>
                <Link href="/learning" className="text-xs text-emerald-400 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-1.5 hover:bg-slate-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-300 text-[10px] border-none">
                        {course.provider}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{course.durationMinutes} mins</span>
                    </div>
                    <h4 className="font-semibold text-xs text-white line-clamp-1">{course.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{course.description}</p>
                    <a
                      href={course.courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium pt-1"
                    >
                      Start Course <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick AI Quiz Generator Widget */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3 relative overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base">Generate AI Practice Quiz</h3>
              <p className="text-xs text-slate-300">
                Target your specific skill gaps with customized AI generated practice questions.
              </p>
              <Link href="/quiz-generator">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
                  Launch Quiz Builder <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
