import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { MOCK_COURSES, fetchApi, CourseItem } from "@/lib/api";
import { BookOpen, Search, ExternalLink, Clock, Award, ShieldCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Learning() {
  const [courses, setCourses] = useState<CourseItem[]>(MOCK_COURSES);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

  useEffect(() => {
    async function loadCourses() {
      const crses = await fetchApi<CourseItem[]>("/courses", MOCK_COURSES);
      setCourses(crses);
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = selectedDomain === "All" || c.provider.includes(selectedDomain) || c.competencies.some(comp => comp.toLowerCase().includes(selectedDomain.toLowerCase()));
    return matchesSearch && matchesDomain;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="h-7 w-7 text-emerald-400" />
              iGOT & NSSTA Mapped Courses
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explore specialized modules curated to eliminate identified officer competency gaps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold px-3 py-1">
              {courses.length} Mapped Courses
            </Badge>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search courses or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["All", "Sampling", "Python", "SQL", "AI"].map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDomain === domain
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                    {course.provider}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {course.durationMinutes} mins
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug group-hover:text-emerald-400 transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex flex-wrap gap-1.5">
                  {course.competencies.map((comp) => (
                    <span
                      key={comp}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 font-medium border border-slate-700/50"
                    >
                      {comp}
                    </span>
                  ))}
                </div>

                <a
                  href={course.courseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Access Module <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
