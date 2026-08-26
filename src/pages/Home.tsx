import React from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import {
  Award,
  Sparkles,
  Map,
  BookOpen,
  Target,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  Flame,
  Zap,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-200/50 via-indigo-100/40 to-slate-100/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1e3a8a] text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#1e3a8a]" />
            AI-Driven Competency & Career Architecture
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
            Bridge Skill Gaps & Elevate Your{" "}
            <span className="bg-gradient-to-r from-[#1e3a8a] via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Public Sector Career
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            KaushalSetu connects government officers with personalized competency roadmaps, 
            adaptive iGOT/NSSTA course recommendations, and real-time skill assessment analytics.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-sm px-8 py-6 rounded-xl shadow-xs flex items-center justify-center gap-2 group">
                Enter Learner Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm px-8 py-6 rounded-xl shadow-xs flex items-center justify-center gap-2">
                <Target className="h-5 w-5 text-[#1e3a8a]" />
                Analyze Career Gaps
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-2xl font-black text-[#1e3a8a]">10+</div>
              <div className="text-xs text-slate-500 font-bold">Core Competency Frameworks</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-2xl font-black text-indigo-700">iGOT & NSSTA</div>
              <div className="text-xs text-slate-500 font-bold">Direct Course Mapping</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-2xl font-black text-amber-700">100% Dynamic</div>
              <div className="text-xs text-slate-500 font-bold">AI Gap Engine Analysis</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-2xl font-black text-emerald-700">Adaptive</div>
              <div className="text-xs text-slate-500 font-bold">Assessment Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-12 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f172a]">
            Core Features of KaushalSetu
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Designed specifically for officers, statistical practitioners, and public administrators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 text-[#1e3a8a] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Competency Gap Engine</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Compare your current assessed skill levels against target job role standards (e.g. Statistical Officer, Data Analyst).
            </p>
            <Link href="/roadmap" className="text-xs font-bold text-[#1e3a8a] hover:text-blue-700 inline-flex items-center gap-1">
              Analyze Gaps <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Curated iGOT/NSSTA Courses</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Access mapped courses from iGOT Karmayogi and NSSTA TPAC designed to close identified skill gaps efficiently.
            </p>
            <Link href="/learning" className="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1">
              Explore Courses <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">AI Quiz & Assessment Builder</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Test your proficiency with adaptive MCQs, instant evaluation, explanations, and dynamic AI test generation.
            </p>
            <Link href="/quizzes" className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1">
              Take Assessments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Target Job Roles */}
      <section className="py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-xs">
          <div className="space-y-2">
            <Badge variant="outline" className="border-emerald-200 text-emerald-800 bg-emerald-50 text-xs font-bold">
              Supported Roles
            </Badge>
            <h3 className="text-xl font-bold text-[#0f172a]">Target Roles in Public Sector</h3>
            <p className="text-sm text-slate-600 max-w-xl">
              From Statistical Officers to Data Analysts and Survey Officers, KaushalSetu defines granular competency benchmarks for career progression.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3.5 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-2 hover:bg-slate-100 transition-colors">
              <Briefcase className="h-3.5 w-3.5 text-[#1e3a8a]" /> Statistical Officer
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-2 hover:bg-slate-100 transition-colors">
              <Briefcase className="h-3.5 w-3.5 text-indigo-700" /> Data Analyst
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-2 hover:bg-slate-100 transition-colors">
              <Briefcase className="h-3.5 w-3.5 text-purple-700" /> Survey Officer
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-2 hover:bg-slate-100 transition-colors">
              <Briefcase className="h-3.5 w-3.5 text-amber-700" /> Data Processing Officer
            </span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
