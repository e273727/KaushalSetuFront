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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/30 to-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider shadow-sm animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            AI-Driven Competency & Career Architecture
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Bridge Skill Gaps & Elevate Your{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Public Sector Career
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            KaushalSetu connects government officers with personalized competency roadmaps, 
            adaptive iGOT/NSSTA course recommendations, and real-time skill assessment analytics.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group">
                Enter Learner Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold px-8 py-6 rounded-xl flex items-center justify-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Analyze Career Gaps
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="text-2xl font-bold text-blue-400">10+</div>
              <div className="text-xs text-slate-400 mt-1">Core Competency Frameworks</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="text-2xl font-bold text-indigo-400">iGOT & NSSTA</div>
              <div className="text-xs text-slate-400 mt-1">Direct Course Mapping</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="text-2xl font-bold text-amber-400">100% Dynamic</div>
              <div className="text-xs text-slate-400 mt-1">AI Gap Engine Analysis</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="text-2xl font-bold text-emerald-400">Adaptive</div>
              <div className="text-xs text-slate-400 mt-1">Assessment Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-12 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Core Features of KaushalSetu
          </h2>
          <p className="text-slate-400 text-sm">
            Designed specifically for officers, statistical practitioners, and public administrators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/50 border border-slate-800 hover:border-blue-500/40 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Competency Gap Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Compare your current assessed skill levels against target job role standards (e.g. Statistical Officer, Data Analyst).
            </p>
            <Link href="/roadmap" className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
              Analyze Gaps <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/50 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Curated iGOT/NSSTA Courses</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Access mapped courses from iGOT Karmayogi and NSSTA TPAC designed to close identified skill gaps efficiently.
            </p>
            <Link href="/learning" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
              Explore Courses <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/50 border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Quiz & Assessment Builder</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Test your proficiency with adaptive MCQs, instant evaluation, explanations, and dynamic AI test generation.
            </p>
            <Link href="/quizzes" className="text-xs font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
              Take Assessments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Target Job Roles */}
      <section className="py-12 border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/80 border border-slate-800 p-8 rounded-2xl">
          <div className="space-y-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              Supported Roles
            </Badge>
            <h3 className="text-xl font-bold text-white">Target Roles in Public Sector</h3>
            <p className="text-sm text-slate-400 max-w-xl">
              From Statistical Officers to Data Analysts and Survey Officers, KaushalSetu defines granular competency benchmarks for career progression.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-blue-400" /> Statistical Officer
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-indigo-400" /> Data Analyst
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-purple-400" /> Survey Officer
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-amber-400" /> Data Processing Officer
            </span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
