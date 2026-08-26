import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Map,
  HelpCircle,
  Sparkles,
  Flame,
  Award,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getUserStreak } from "@/lib/api";

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
    { href: "/quiz-generator", label: "AI Quiz Builder", icon: Sparkles },
  ];

  const displayName = user?.fullName || user?.profile?.fullName || "Rohit Sharma";
  const displayRole = user?.currentJobRole || user?.profile?.currentJobRole || "Statistical Officer";
  const displayEmail = user?.email || "officer@kaushalsetu.gov.in";
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
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
                  Kaushal<span className="text-blue-400">Setu</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold uppercase tracking-wider ml-1">iGOT</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Competency & Career Bridge</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Streak Counter Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-inner">
              <Flame className="h-4 w-4 text-amber-400 animate-pulse fill-amber-400/20" />
              <span>{streak} Day Streak</span>
            </div>

            {/* Notifications */}
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
            </button>

            {/* User Dropdown / Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow">
                    {initials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight">{displayName}</span>
                    <span className="text-[10px] text-slate-400">{displayRole}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white">{displayName}</p>
                      <p className="text-xs text-slate-400">{displayEmail}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <User className="h-4 w-4 text-slate-400" /> Profile & Competencies
                    </Link>
                    <Link
                      href="/roadmap"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Map className="h-4 w-4 text-slate-400" /> Career Gap Analysis
                    </Link>
                    <div className="border-t border-slate-800 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 w-full text-left font-medium"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 flex items-center gap-1.5">
                  <LogIn className="h-3.5 w-3.5" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>3</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full text-left mt-2 border-t border-slate-800 pt-3"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white w-full mt-2"
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
