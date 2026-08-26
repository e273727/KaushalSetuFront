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
  getUserGapCompetencies,
  getDisplayName,
  getUserStreak
} from "@/lib/api";
import {
  Award,
  Flame,
  Target,
  BookOpen,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import HexagonalStatsGraph from "@/components/HexagonalStatsGraph";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...MOCK_PROFILE,
    fullName: getDisplayName(user),
    email: user?.email || MOCK_PROFILE.email,
  }));
  const [competencies, setCompetencies] = useState<CompetencyItem[]>(() => getUserGapCompetencies(user));
  const [courses, setCourses] = useState<CourseItem[]>(MOCK_COURSES);
  const [loading, setLoading] = useState(false);
  const streakDays = getUserStreak(user);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const userProf = await fetchApi<UserProfile>("/profile", MOCK_PROFILE);
      const crses = await fetchApi<CourseItem[]>("/courses", MOCK_COURSES);

      // Hydrate with user's actual onboarding diagnostic assessment gap matrix
      const userComps = getUserGapCompetencies(user);
      setCompetencies(userComps);

      const resolvedName = getDisplayName(user);
      if (userProf) {
        setProfile({
          ...userProf,
          fullName: resolvedName,
          email: user?.email || userProf.email,
        });
      } else {
        setProfile((prev) => ({ ...prev, fullName: resolvedName }));
      }

      if (crses) setCourses(crses);
      setLoading(false);
    }
    loadData();
  }, [user]);

  // Calculate overall readiness score
  const totalRequired = competencies.reduce((acc, curr) => acc + curr.requiredLevel, 0);
  const totalCurrent = competencies.reduce((acc, curr) => acc + curr.currentLevel, 0);
  const overallReadiness = Math.round((totalCurrent / Math.max(1, totalRequired)) * 100);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Officer Profile Header Banner */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center font-black text-2xl shadow-xs border border-blue-900 shrink-0">
                {profile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight">{profile.fullName}</h1>
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-900 text-xs font-bold">
                    {profile.currentJobRole}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" /> {profile.department}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-500/20" /> {streakDays} Day Learning Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link href="/roadmap" className="w-full md:w-auto">
                <Button className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2">
                  <Target className="h-4 w-4" /> View Career Roadmap
                </Button>
              </Link>
              <Link href="/quizzes" className="w-full md:w-auto">
                <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-800" /> Assessments
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* TOP EXECUTIVE METRICS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>Overall Role Readiness</span>
              <TrendingUp className="h-4 w-4 text-blue-800" />
            </div>
            <p className="text-2xl font-black text-[#0f172a]">{overallReadiness}%</p>
            <Progress value={overallReadiness} className="h-2 bg-slate-100" />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>Target Career Role</span>
              <Target className="h-4 w-4 text-blue-800" />
            </div>
            <p className="text-lg font-bold text-[#0f172a] truncate">{(profile as any).targetCareerRole || "Data Scientist"}</p>
            <p className="text-[11px] text-blue-900 font-bold">90-Day Schedule Active</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>Learning Streak</span>
              <Flame className="h-4 w-4 text-amber-600 fill-amber-500/20" />
            </div>
            <p className="text-2xl font-black text-amber-900">{streakDays} Days</p>
            <p className="text-[11px] text-slate-500 font-medium">Daily Goal: 1 Hour/Day</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>Assigned Courses</span>
              <BookOpen className="h-4 w-4 text-blue-800" />
            </div>
            <p className="text-2xl font-black text-[#0f172a]">{courses.length}</p>
            <p className="text-[11px] text-emerald-700 font-bold">iGOT & NSSTA Verified</p>
          </div>
        </div>

        {/* Main Content Split: Competency Table vs Hexagonal Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Competency Gap Matrix Table (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-800" />
                  Verified Competency Gap Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Current skill proficiency scores evaluated against target role benchmarks (Scale 1–5).
                </p>
              </div>
            </div>

            {/* Dense Structured Light Table */}
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="p-4">Competency Domain</th>
                      <th className="p-4 text-center">Current</th>
                      <th className="p-4 text-center">Benchmark</th>
                      <th className="p-4 text-center">Gap Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[#0f172a]">
                    {competencies.map((comp) => {
                      const isComplete = comp.currentLevel >= comp.requiredLevel;
                      return (
                        <tr key={comp.name} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-[#0f172a]">
                            {comp.name}
                          </td>
                          <td className="p-4 text-center font-extrabold text-slate-900">
                            L{comp.currentLevel} / 5
                          </td>
                          <td className="p-4 text-center font-bold text-blue-900">
                            L{comp.requiredLevel} / 5
                          </td>
                          <td className="p-4 text-center">
                            {isComplete ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] px-2 py-0.5 font-bold">
                                Met ✓
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] px-2 py-0.5 font-bold">
                                -{comp.gap} Level Gap
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Link href="/learning">
                              <span className="text-[11px] font-bold text-blue-900 hover:text-blue-700 hover:underline cursor-pointer">
                                Learn →
                              </span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Hexagonal Radar Visualization (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <HexagonalStatsGraph
              data={competencies.map((c) => ({
                name: c.name,
                currentLevel: c.currentLevel,
                targetLevel: c.requiredLevel,
              }))}
              targetRole={(profile as any).targetCareerRole || "Data Scientist"}
            />
          </div>
        </div>

        {/* TODAY'S SCHEDULED ACTION & RECOMMENDED COURSES */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-800" />
                Today's Scheduled Learning Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Recommended modules to close your highest priority competency gaps.
              </p>
            </div>

            <Link href="/learning">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold">
                Explore All Courses →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((course) => (
              <div key={course.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-900 text-[10px] font-bold">
                      {course.provider}
                    </Badge>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock className="h-3 w-3" /> {course.durationMinutes} mins
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-[#0f172a] leading-snug line-clamp-2">{course.title}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{course.description}</p>
                </div>

                <a
                  href={
                    course.title.toLowerCase().includes("python") || course.id === "course-2" || (course as any).externalCourseId === "IGOT-PY-201"
                      ? "https://portal.igotkarmayogi.gov.in/public/toc/do_1137349858229288961285/overview"
                      : course.courseUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs py-2 rounded-lg transition-colors mt-2 shadow-xs"
                >
                  Start Learning <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
