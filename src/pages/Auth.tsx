import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Award,
  Lock,
  Mail,
  User,
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("National Sample Survey Office (NSSO)");
  const [currentJobRole, setCurrentJobRole] = useState("Statistical Officer");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleDemoFill = (type: "officer" | "admin") => {
    if (type === "officer") {
      setEmail("officer@kaushalsetu.gov.in");
      setPassword("Password123!");
      setFullName("Rohit Sharma");
      setDepartment("National Sample Survey Office (NSSO)");
      setCurrentJobRole("Statistical Officer");
    } else {
      setEmail("admin@kaushalsetu.gov.in");
      setPassword("Password123!");
      setFullName("System Administrator");
      setDepartment("Ministry of Statistics & Programme Implementation");
      setCurrentJobRole("Administrator");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      let result: { success: boolean; isFirstTime: boolean; error?: string } = { success: false, isFirstTime: false };
      if (mode === "login") {
        result = await login(email, password);
      } else {
        if (!fullName) {
          setErrorMsg("Please enter your full name.");
          setIsSubmitting(false);
          return;
        }
        result = await register({
          email,
          password,
          fullName,
          department,
          currentJobRole,
        });
      }

      if (result.success) {
        if (result.isFirstTime) {
          setLocation("/onboarding");
        } else {
          setLocation("/dashboard");
        }
      } else {
        setErrorMsg(result.error || "Authentication failed. Please check your credentials or register first.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-blue-600/20 to-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
                Kaushal<span className="text-blue-400">Setu</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Competency & Career Bridge</span>
            </div>
          </div>

          <p className="text-sm text-slate-300">
            {mode === "login"
              ? "Sign in to access your officer competency roadmap"
              : "Register your official profile to map skill gaps"}
          </p>
        </div>

        {/* Quick Demo Fill Pills */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Quick Demo Login:
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("officer")}
              className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-colors"
            >
              Learner Officer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("admin")}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium transition-colors"
            >
              System Admin
            </button>
          </div>
        </div>

        {/* Auth Card Box */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xl space-y-6 text-slate-900">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`py-2.5 rounded-lg transition-all ${mode === "login"
                  ? "bg-blue-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`py-2.5 rounded-lg transition-all ${mode === "register"
                  ? "bg-blue-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Register
            </button>
          </div>

          {/* Error Message Notification */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between gap-2">
              <span className="text-rose-800 font-bold text-xs">{errorMsg}</span>
              {mode === "login" && errorMsg === "Sign up first" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMsg("");
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors shrink-0"
                >
                  Register Now
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Rohit Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200 text-[#0f172a] text-sm focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  placeholder="officer@kaushalsetu.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 text-[#0f172a] text-sm focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-slate-50 border-slate-200 text-[#0f172a] text-sm focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Department / Ministry
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="e.g. NSSO, MoSPI"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="pl-9 bg-slate-50 border-slate-200 text-[#0f172a] text-sm focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Job Role
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={currentJobRole}
                      onChange={(e) => setCurrentJobRole(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-[#0f172a] text-sm rounded-md focus:bg-white font-semibold"
                    >
                      <option>Statistical Officer</option>
                      <option>Data Analyst</option>
                      <option>Survey Officer</option>
                      <option>Data Processing Officer</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {isSubmitting ? (
                "Authenticating..."
              ) : (
                <>
                  {mode === "login" ? "Sign In to KaushalSetu" : "Create Official Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Security Note */}
        <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Protected by Government iGOT & NSSTA Competency Framework Standard
        </p>
      </div>
    </div>
  );
}
