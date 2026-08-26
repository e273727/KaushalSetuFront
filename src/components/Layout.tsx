import React from "react";
import Navbar from "./Navbar";
import { Award, ShieldCheck, Heart, Sparkles } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-slate-400 text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Award className="h-4 w-4" />
            </div>
            <span className="font-bold text-white">KaushalSetu</span>
            <span className="text-slate-500 text-xs">| iGOT & NSSTA Competency Portal</span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-left">
            Empowering Public Officers with AI-Driven Competency Mapping & Career Growth Roadmaps.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Framework
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
