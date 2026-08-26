import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DIAGNOSTIC_QUESTIONS, QuizQuestion } from "@/lib/api";
import {
  User,
  Building2,
  Briefcase,
  GraduationCap,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Target,
  HelpCircle,
  XCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || user?.profile?.fullName || "");
  const [age, setAge] = useState<number | string>(user?.age || 30);
  const [department, setDepartment] = useState(user?.department || "National Sample Survey Office (NSSO)");
  const [currentJobRole, setCurrentJobRole] = useState(user?.currentJobRole || "Statistical Officer");
  const [currentAssignment, setCurrentAssignment] = useState("Annual Survey of Unincorporated Enterprises");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | string>(user?.yearsOfExperience || 5);
  const [highestQualification, setHighestQualification] = useState(user?.highestQualification || "M.Sc. Statistics");
  const [fieldOfStudy, setFieldOfStudy] = useState(user?.fieldOfStudy || "Mathematical Statistics");

  // Competency Baseline Self Ratings
  const [samplingLevel, setSamplingLevel] = useState(3);
  const [pythonLevel, setPythonLevel] = useState(2);
  const [sqlLevel, setSqlLevel] = useState(2);

  // Diagnostic Test State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch role-specific diagnostic questions
  const roleQuestions: QuizQuestion[] =
    ROLE_DIAGNOSTIC_QUESTIONS[currentJobRole] || ROLE_DIAGNOSTIC_QUESTIONS["Statistical Officer"];

  const handleSelectOption = (qId: string, optId: string) => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleEvaluateTest = () => {
    let correctCount = 0;
    roleQuestions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        correctCount += 1;
      }
    });
    setDiagnosticScore(correctCount);
    setTestSubmitted(true);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    await completeOnboarding({
      fullName: fullName || "Officer",
      age: Number(age) || undefined,
      department,
      currentJobRole,
      currentAssignment,
      yearsOfExperience: Number(yearsOfExperience) || undefined,
      highestQualification,
      fieldOfStudy,
    });

    setIsSubmitting(false);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 to-indigo-500/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-3xl w-full space-y-8 relative z-10 py-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Officer Profile & Skill Assessment
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to KaushalSetu!
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Please complete your official details and target role diagnostic assessment to personalize your competency roadmap.
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between px-2 sm:px-6">
          {[
            { id: 1, label: "Personal Info" },
            { id: 2, label: "Target Role" },
            { id: 3, label: "Baseline" },
            { id: 4, label: "Role Assessment" },
          ].map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1.5 flex-1 relative">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.id
                    ? "bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/30"
                    : step > s.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-500"
                }`}
              >
                {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : s.id}
              </div>
              <span className="text-[11px] font-semibold text-slate-300 text-center hidden sm:block">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Box */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  Step 1: Personal & Government Info
                </h2>
                <p className="text-xs text-slate-400">Basic identification for official competency record</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="pl-9 bg-slate-950 border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 32"
                    className="bg-slate-950 border-slate-800 text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Ministry / Cadre / Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. NSSO, MoSPI"
                      className="pl-9 bg-slate-950 border-slate-800 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Professional Profile & Target Role */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-400" />
                  Step 2: Professional Background & Target Job Role
                </h2>
                <p className="text-xs text-slate-400">Target role selection determines diagnostic test questions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Target Job Role
                  </label>
                  <select
                    value={currentJobRole}
                    onChange={(e) => setCurrentJobRole(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 text-white text-sm rounded-md focus:border-blue-500 font-semibold text-blue-400"
                  >
                    <option>Statistical Officer</option>
                    <option>Data Analyst</option>
                    <option>Survey Officer</option>
                    <option>Data Processing Officer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Years of Public Experience
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Highest Qualification
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      value={highestQualification}
                      onChange={(e) => setHighestQualification(e.target.value)}
                      placeholder="e.g. M.Sc. Statistics"
                      className="pl-9 bg-slate-950 border-slate-800 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Field of Study
                  </label>
                  <Input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Mathematical Statistics"
                    className="bg-slate-950 border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Current Assignment / Project
                </label>
                <Input
                  type="text"
                  value={currentAssignment}
                  onChange={(e) => setCurrentAssignment(e.target.value)}
                  placeholder="e.g. Annual Survey of Unincorporated Enterprises"
                  className="bg-slate-950 border-slate-800 text-white text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Self-Assessed Competency Baseline */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  Step 3: Self-Assessed Skill Baseline
                </h2>
                <p className="text-xs text-slate-400">Rate your current baseline skill levels prior to the role test</p>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Sampling & Survey Design</span>
                    <span className="text-blue-400 font-bold">Level {samplingLevel} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={samplingLevel}
                    onChange={(e) => setSamplingLevel(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Python for Statistics</span>
                    <span className="text-indigo-400 font-bold">Level {pythonLevel} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={pythonLevel}
                    onChange={(e) => setPythonLevel(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">SQL & Database Querying</span>
                    <span className="text-purple-400 font-bold">Level {sqlLevel} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={sqlLevel}
                    onChange={(e) => setSqlLevel(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Role-Based Skill Diagnostic Test */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-purple-400" />
                    Step 4: Role-Based Diagnostic Skill Test
                  </h2>
                  <p className="text-xs text-slate-400">
                    Questions custom tailored to assess required vs targeted skills for <strong className="text-blue-400">{currentJobRole}</strong>
                  </p>
                </div>
                <Badge className="bg-purple-500/20 text-purple-300 text-xs border-purple-500/30">
                  {currentJobRole} Diagnostic
                </Badge>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {roleQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-400">Question {idx + 1}</span>
                      <span className="text-slate-400">Domain: {q.competencyName}</span>
                    </div>

                    <p className="text-sm font-semibold text-white">{q.questionText}</p>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedAnswers[q.id] === opt.id;
                        let optStyle = "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800";

                        if (isSelected) {
                          optStyle = "border-purple-500 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500";
                        }

                        if (testSubmitted) {
                          if (opt.isCorrect) {
                            optStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold";
                          } else if (isSelected && !opt.isCorrect) {
                            optStyle = "border-rose-500 bg-rose-500/20 text-rose-300";
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            disabled={testSubmitted}
                            className={`w-full p-3 rounded-lg text-left border text-xs transition-all flex items-center justify-between ${optStyle}`}
                          >
                            <span>{opt.optionText}</span>
                            {testSubmitted && opt.isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            )}
                            {testSubmitted && isSelected && !opt.isCorrect && (
                              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!testSubmitted && (
                <Button
                  type="button"
                  onClick={handleEvaluateTest}
                  disabled={Object.keys(selectedAnswers).length < roleQuestions.length}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg"
                >
                  Evaluate Diagnostic Skill Score
                </Button>
              )}

              {/* Assessment Score Results Box */}
              {testSubmitted && diagnosticScore !== null && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    <span className="font-bold text-white text-base">Diagnostic Evaluation Complete!</span>
                  </div>
                  <p className="text-xs text-emerald-300">
                    You answered <strong className="text-white">{diagnosticScore} / {roleQuestions.length}</strong> questions correctly.
                    Assessed Level: <strong className="text-white">Level {Math.max(2, diagnosticScore + 1)} / 5</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Target Skill Requirements for {currentJobRole}: <span className="text-blue-400 font-semibold">Level 5</span>. Gap Engine initialized.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-slate-800 text-slate-300 text-xs flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 flex items-center gap-1.5"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting || !testSubmitted}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/25"
              >
                {isSubmitting ? (
                  "Finalizing Setup..."
                ) : (
                  <>
                    Save Assessment & Enter Dashboard <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
