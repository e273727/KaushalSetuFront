import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { MOCK_COURSES, CourseItem, fetchApi } from "@/lib/api";
import { BookOpen, Search, Filter, ExternalLink, Clock, Award, ShieldCheck, Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Learning() {
  const [courses, setCourses] = useState<CourseItem[]>(MOCK_COURSES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      const data = await fetchApi<CourseItem[]>("/courses", MOCK_COURSES);
      if (data && Array.isArray(data)) {
        const sanitized = data.map((c) => ({
          ...c,
          courseUrl:
            c.title.toLowerCase().includes("python") || c.id === "course-2" || (c as any).externalCourseId === "IGOT-PY-201"
              ? "https://portal.igotkarmayogi.gov.in/public/toc/do_1137349858229288961285/overview"
              : c.courseUrl,
        }));
        setCourses(sanitized);
      }
      setLoading(false);
    }
    loadCourses();
  }, []);

  // Helper to extract flat competency strings safely
  const getCourseCompetencies = (c: CourseItem): string[] => {
    if (!c) return [];
    if (Array.isArray(c.competencies)) {
      return c.competencies.map((comp: any) =>
        typeof comp === "string" ? comp : comp?.name || comp?.competencyName || String(comp)
      );
    }
    return [];
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCourseCompetencies(c).some((comp) => comp.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvider = selectedProvider === "all" || c.source === selectedProvider;

    return matchesSearch && matchesProvider;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-900 border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Integrated Government Learning Directory
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight flex items-center gap-2.5 mt-1">
              <BookOpen className="h-7 w-7 text-blue-800" />
              Courses & Learning Modules
            </h1>
            <p className="text-slate-600 text-sm mt-1 font-medium">
              Curated public sector learning resources mapped directly to officer competency benchmarks and gap analyses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold px-3 py-1 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" /> iGOT & NSSTA Verified
            </Badge>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by topic, competency, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 text-[#0f172a] placeholder:text-slate-400 text-xs h-10 rounded-xl focus:ring-2 focus:ring-blue-800 font-medium"
            />
          </div>

          {/* Provider Filter Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedProvider("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
                selectedProvider === "all"
                  ? "bg-[#0f172a] border-slate-900 text-white shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              All Providers ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvider("igot")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
                selectedProvider === "igot"
                  ? "bg-[#0f172a] border-slate-900 text-white shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              iGOT Karmayogi
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvider("nssta")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
                selectedProvider === "nssta"
                  ? "bg-[#0f172a] border-slate-900 text-white shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              NSSTA TPAC
            </button>
          </div>
        </div>

        {/* Course Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const comps = getCourseCompetencies(course);
            return (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-900 text-[10px] font-bold">
                      {course.provider}
                    </Badge>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-bold">
                      <Clock className="h-3.5 w-3.5" /> {course.durationMinutes} mins
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#0f172a] group-hover:text-blue-900 transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-medium">
                    {course.description}
                  </p>

                  {/* Competency Domain Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {comps.map((comp) => (
                      <span
                        key={comp}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-bold"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <a
                    href={
                      course.title.toLowerCase().includes("python") || course.id === "course-2" || (course as any).externalCourseId === "IGOT-PY-201"
                        ? "https://portal.igotkarmayogi.gov.in/public/toc/do_1137349858229288961285/overview"
                        : course.courseUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs"
                  >
                    Launch Learning Module <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
