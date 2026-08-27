import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Map,
  HelpCircle,
  Flame,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserStreak, getDisplayName } from "@/lib/api";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [streak, setStreak] = useState(() => getUserStreak(user));

  useEffect(() => {
    setStreak(getUserStreak(user));
    const handleUpdate = () => setStreak(getUserStreak(user));
    window.addEventListener("kaushalsetu_streak_updated", handleUpdate);
    return () => window.removeEventListener("kaushalsetu_streak_updated", handleUpdate);
  }, [user]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/learning", label: "Courses & Skills", icon: BookOpen },
    { href: "/roadmap", label: "Career Roadmap", icon: Map },
    { href: "/quizzes", label: "Assessments", icon: HelpCircle },
    { href: "/doc-assistant", label: "AI Doc Assistant", icon: Bot },
  ];

  const displayName = getDisplayName(user);
  const displayRole = user?.currentJobRole || user?.profile?.currentJobRole || "Statistical Officer";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    logout();
    setProfileDropdownOpen(false);
    setLocation("/auth");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* System Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 flex items-center justify-center text-white font-black text-sm shadow-md border border-blue-700/50 group-hover:scale-105 transition-transform duration-200">
                KS
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-[#0f172a] tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                  KaushalSetu
                </span>
                <span className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">
                  Public Officer Competency Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Menu */}
            <nav className="hidden md:flex items-center gap-1 border-l border-slate-200/80 pl-6 ml-2">
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href === "/quizzes" && location === "/assessments");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-[#0f172a] text-white shadow-sm scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-[1.01]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Glowing Daily Streak Counter Badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-orange-500/10 border border-amber-300/80 text-amber-900 text-xs font-extrabold shadow-xs hover:shadow-amber-200/50 transition-all">
              <Flame className="h-4 w-4 text-amber-600 fill-amber-500/30 animate-pulse" />
              <span>{streak} Day Streak</span>
            </div>

            {/* User Profile Dropdown / Sign-In State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 hover:border-slate-300 transition-all"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs">
                    {initials}
                  </div>
                  <div className="flex flex-col pr-1">
                    <span className="text-xs font-bold text-[#0f172a] leading-none">{displayName}</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5 truncate max-w-[120px]">
                      {displayRole}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0 ml-1" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150 text-slate-900">
                    <div className="p-3 bg-slate-50 rounded-lg space-y-1 border border-slate-200">
                      <p className="text-xs font-bold text-slate-900">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-900 text-[10px] mt-1 font-bold">
                        {displayRole}
                      </Badge>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-500/20" />
              <span>{streak}d</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-colors ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[10px] text-slate-500">{displayRole}</p>
                </div>
              </div>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-rose-700 font-bold text-xs">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-2">
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs py-2.5">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
