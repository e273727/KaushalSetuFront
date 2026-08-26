import React from "react";
import Navbar from "./Navbar";
import { ShieldCheck, Lock } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-slate-900 selection:text-white antialiased">
      {/* Top Persistent Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {children}
      </main>

      {/* Institutional Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-slate-600 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#1e3a8a] flex items-center justify-center text-white font-black text-xs">
                  KS
                </div>
                <span className="font-bold text-[#0f172a] text-sm tracking-tight">KaushalSetu</span>
                <span className="text-slate-500 font-medium">| National Public Competency & Learning System</span>
              </div>
              <p className="text-slate-600 text-xs max-w-2xl leading-relaxed">
                Official framework for officer skill-gap analysis, diagnostic assessments, and adaptive learning pathways integrated with iGOT Karmayogi & NSSTA TPAC standards.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> iGOT Framework Verified
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                <Lock className="h-3.5 w-3.5 text-slate-500" /> Enterprise Encrypted
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono text-[11px]">v1.0.0-production</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© 2026 KaushalSetu System. Ministry of Statistics & Programme Implementation (MoSPI). All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-900 cursor-pointer">Security Policy</span>
              <span>•</span>
              <span className="hover:text-slate-900 cursor-pointer">Accessibility Statement</span>
              <span>•</span>
              <span className="hover:text-slate-900 cursor-pointer">iGOT Standard Audit</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
