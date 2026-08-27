import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useAuth, CertificateItem } from "@/contexts/AuthContext";
import { generateDynamicDiagnosticQuiz, QuizQuestion, MOCK_COURSES, CourseItem } from "@/lib/api";
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
  TrendingUp,
  Plus,
  Trash2,
  Check,
  BookOpen,
  Calendar,
  Code,
  Layers,
  Compass,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import HexagonalStatsGraph, { CompetencyDataPoint } from "@/components/HexagonalStatsGraph";

const SKILL_CATEGORIES = [
  {
    category: "Programming",
    skills: ["Python", "R", "SQL", "Java", "C/C++", "Stata", "SPSS", "SAS"],
  },
  {
    category: "Data & Analytics",
    skills: ["Statistics", "Data Analysis", "Data Visualization", "Machine Learning", "AI", "GIS", "Excel"],
  },
  {
    category: "Digital Technologies",
    skills: ["Cloud Computing", "APIs", "Cybersecurity", "Data Privacy", "Open Data"],
  },
];

const PROFICIENCY_OPTIONS = [
  { label: "Basic", level: 2, desc: "Fundamental understanding" },
  { label: "Intermediate", level: 3, desc: "Working knowledge in projects" },
  { label: "Advanced", level: 4, desc: "Proficient in complex tasks" },
  { label: "Expert", level: 5, desc: "Deep domain authority & leadership" },
];

const LEARNING_GOALS = [
  "Improve my current job skills",
  "Prepare for a new role",
  "Prepare for a promotion",
  "Prepare for a government examination",
  "Learn emerging technologies",
  "Build foundational knowledge",
  "Other",
];

const TARGET_TIMELINES = [
  "1–3 months",
  "3–6 months",
  "6–12 months",
  "More than 1 year",
  "No specific deadline",
];

const DAILY_TIME_OPTIONS = ["15 min", "30 min", "1 hour", "2+ hours"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);

  // General Identity
  const [fullName, setFullName] = useState(user?.fullName || user?.profile?.fullName || "");
  const [age, setAge] = useState<number | string>(user?.age || 30);

  // STEP 1: Current Status
  const [hasWorkExperience, setHasWorkExperience] = useState<boolean>(true);
  
  // Experienced User State
  const [currentJobRole, setCurrentJobRole] = useState(user?.currentJobRole || "Statistical Officer");
  const [department, setDepartment] = useState(user?.department || "National Sample Survey Office (NSSO)");
  const [yearsOfExperienceRange, setYearsOfExperienceRange] = useState<string>("3–5");
  const [currentAssignment, setCurrentAssignment] = useState("Survey data collection, validation, and statistical reporting.");
  const [hasPreviousRole, setHasPreviousRole] = useState<boolean>(false);
  const [previousRole, setPreviousRole] = useState("");
  const [previousExperienceYears, setPreviousExperienceYears] = useState("");
  const [previousResponsibilities, setPreviousResponsibilities] = useState("");

  // Fresher State
  const [targetCareerRole, setTargetCareerRole] = useState("Statistical Officer");
  const [targetSector, setTargetSector] = useState("Official Statistics");

  // STEP 2: Education
  const [highestQualification, setHighestQualification] = useState(user?.highestQualification || "Master's");
  const [fieldOfStudy, setFieldOfStudy] = useState(user?.fieldOfStudy || "Mathematical Statistics");
  const [graduationYear, setGraduationYear] = useState("2021");

  // STEP 3: Existing Technical Skills & Proficiency
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Python",
    "SQL",
    "Statistics",
    "Data Analysis",
  ]);
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, string>>({
    Python: "Basic",
    SQL: "Intermediate",
    Statistics: "Advanced",
    "Data Analysis": "Intermediate",
  });

  // STEP 4: Certificates & Training
  const [hasCertifications, setHasCertifications] = useState<boolean>(false);
  const [certificates, setCertificates] = useState<CertificateItem[]>([
    { name: "Public Sector Data Quality Certification", provider: "NSSTA", year: "2023" },
  ]);

  // STEP 5: Learning Goal & Course Selection
  const [selectedCourseId, setSelectedCourseId] = useState<string>("course-1");
  const [learningGoal, setLearningGoal] = useState("Improve my current job skills");
  const [targetTimeline, setTargetTimeline] = useState("3–6 months");
  const [dailyLearningTime, setDailyLearningTime] = useState("1 hour");
  const [preferredDays, setPreferredDays] = useState<string[]>([
    "Monday",
    "Wednesday",
    "Friday",
    "Saturday",
  ]);

  // STEP 6: Diagnostic Test State & Gap Matrix
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effective job role for diagnostic test and requirements engine
  const activeTargetRole = hasWorkExperience ? currentJobRole : targetCareerRole;

  // Auto-sync form state and user-specific saved goals whenever user resolves or changes
  useEffect(() => {
    if (user) {
      const uName = user.fullName || user.profile?.fullName;
      if (uName && (!fullName || fullName === "Officer")) {
        setFullName(uName);
      }
      const uDept = user.department || user.profile?.department;
      if (uDept) setDepartment(uDept);
      const uRole = user.currentJobRole || user.profile?.currentJobRole;
      if (uRole) setCurrentJobRole(uRole);
      const uQual = user.highestQualification || user.profile?.highestQualification;
      if (uQual) setHighestQualification(uQual);
      const uField = user.fieldOfStudy || user.profile?.fieldOfStudy;
      if (uField) setFieldOfStudy(uField);

      // Load user-bound saved goals and preferences if previously created
      const savedGoalsRaw = localStorage.getItem(`kaushalsetu_user_goals_${user.id}`) ||
                             localStorage.getItem(`kaushalsetu_user_goals_${user.email}`);
      if (savedGoalsRaw) {
        try {
          const parsed = JSON.parse(savedGoalsRaw);
          if (parsed.selectedCourseId) setSelectedCourseId(parsed.selectedCourseId);
          if (parsed.learningGoal) setLearningGoal(parsed.learningGoal);
          if (parsed.targetTimeline) setTargetTimeline(parsed.targetTimeline);
          if (parsed.dailyLearningTime) setDailyLearningTime(parsed.dailyLearningTime);
          if (parsed.preferredLearningDays && Array.isArray(parsed.preferredLearningDays)) {
            setPreferredDays(parsed.preferredLearningDays);
          }
          if (parsed.selectedSkills && Array.isArray(parsed.selectedSkills)) {
            setSelectedSkills(parsed.selectedSkills);
          }
          if (parsed.skillProficiencies) setSkillProficiencies(parsed.skillProficiencies);
          if (parsed.certificates && Array.isArray(parsed.certificates)) setCertificates(parsed.certificates);
          if (parsed.targetCareerRole) setTargetCareerRole(parsed.targetCareerRole);
          if (parsed.targetSector) setTargetSector(parsed.targetSector);
        } catch {}
      }
    }
  }, [user]);

  // Dynamically generate questions tailored specifically to selected course & prerequisite competencies
  const dynamicQuestions: QuizQuestion[] = generateDynamicDiagnosticQuiz({
    targetRole: activeTargetRole,
    selectedCourseId,
    selectedSkills,
    highestQualification,
    learningGoal,
  });

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
      const nextProf = { ...skillProficiencies };
      delete nextProf[skill];
      setSkillProficiencies(nextProf);
    } else {
      setSelectedSkills((prev) => [...prev, skill]);
      setSkillProficiencies((prev) => ({ ...prev, [skill]: "Intermediate" }));
    }
  };

  const updateProficiency = (skill: string, levelLabel: string) => {
    setSkillProficiencies((prev) => ({ ...prev, [skill]: levelLabel }));
  };

  const addCertificateRow = () => {
    setCertificates((prev) => [...prev, { name: "", provider: "", year: "" }]);
  };

  const removeCertificateRow = (idx: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCertificateField = (idx: number, field: keyof CertificateItem, val: string) => {
    setCertificates((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const toggleWeekday = (day: string) => {
    if (preferredDays.includes(day)) {
      setPreferredDays((prev) => prev.filter((d) => d !== day));
    } else {
      setPreferredDays((prev) => [...prev, day]);
    }
  };

  const handleSelectOption = (qId: string, optId: string) => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleEvaluateTest = async () => {
    let correctCount = 0;
    dynamicQuestions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        correctCount += 1;
      }
    });
    const total = Math.max(1, dynamicQuestions.length);
    const scorePct = Math.round((correctCount / total) * 100);

    const evaluatedMatrix = computeGapMatrix();

    setDiagnosticScore(correctCount);
    setTestSubmitted(true);

    // Save evaluated gap matrix locally per unique user
    if (user?.id) localStorage.setItem(`kaushalsetu_gap_matrix_${user.id}`, JSON.stringify(evaluatedMatrix));
    const cleanEmail = (user?.email || "").toLowerCase().trim();
    if (cleanEmail) localStorage.setItem(`kaushalsetu_gap_matrix_${cleanEmail}`, JSON.stringify(evaluatedMatrix));
    localStorage.setItem("kaushalsetu_gap_matrix_global", JSON.stringify(evaluatedMatrix));

    // Persist assessment result to backend DB
    try {
      const token = localStorage.getItem("kaushalsetu_token");
      if (token && token !== "mock_jwt_token_2026") {
        await fetch("/api/assessments/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assessmentType: "onboarding_diagnostic",
            totalQuestions: total,
            correctCount,
            scorePercentage: scorePct,
            targetRole: activeTargetRole,
            gapMatrix: evaluatedMatrix,
          }),
        });
      }
    } catch (err) {
      console.warn("[KaushalSetu Assessment] Backend submit fallback:", err);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      await completeOnboarding({
        fullName: fullName || "Officer",
        age: Number(age) || undefined,
        department: hasWorkExperience ? department : targetSector,
        currentJobRole: activeTargetRole,
        currentAssignment,
        yearsOfExperience: hasWorkExperience ? 3 : 0,
        highestQualification,
        fieldOfStudy,
        graduationYear,
        hasWorkExperience,
        targetCareerRole: activeTargetRole,
        targetSector,
        hasPreviousRole,
        previousRole,
        previousExperienceYears,
        previousResponsibilities,
        selectedSkills,
        skillProficiencies,
        hasCertifications,
        certificates,
        learningGoal,
        targetTimeline,
        dailyLearningTime,
        preferredLearningDays: preferredDays,
      });
    } catch (err) {
      console.warn("Onboarding save fallback:", err);
    } finally {
      setIsSubmitting(false);
      setLocation("/dashboard");
    }
  };

  // Compute Skill Gap Matrix for Step 6
  const computeGapMatrix = () => {
    const domainStats = new Map<string, { total: number; correct: number }>();

    dynamicQuestions.forEach((q) => {
      const domain = q.competencyName || "General Analytics";
      const existing = domainStats.get(domain) || { total: 0, correct: 0 };
      existing.total += 1;
      const selected = selectedAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        existing.correct += 1;
      }
      domainStats.set(domain, existing);
    });

    const matrix = Array.from(domainStats.entries()).map(([compName, stats]) => {
      const foundSkillKey = selectedSkills.find((s) =>
        compName.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(compName.toLowerCase())
      );
      const profLabel = foundSkillKey ? skillProficiencies[foundSkillKey] : "Intermediate";
      const selfLevelMap: Record<string, number> = { Basic: 2, Intermediate: 3, Advanced: 4, Expert: 5 };
      const selfLevel = selfLevelMap[profLabel] || 3;

      const accuracy = stats.total > 0 ? stats.correct / stats.total : 0.5;
      const testVerifiedLevel = Math.max(1, Math.min(5, Math.round(accuracy * 5)));
      const reqLevel = compName.toLowerCase().includes("sampling") || compName.toLowerCase().includes("survey") ? 5 : 4;
      const gap = Math.max(0, reqLevel - testVerifiedLevel);

      return {
        name: compName,
        selfLevel,
        testVerifiedLevel,
        reqLevel,
        gap,
      };
    });

    return matrix.length > 0 ? matrix : [
      { name: "Sampling Techniques", selfLevel: 3, testVerifiedLevel: 3, reqLevel: 5, gap: 2 },
      { name: "Python for Statistics", selfLevel: 2, testVerifiedLevel: 2, reqLevel: 4, gap: 2 },
      { name: "SQL Querying", selfLevel: 3, testVerifiedLevel: 3, reqLevel: 4, gap: 1 },
      { name: "Data Quality & Audit", selfLevel: 3, testVerifiedLevel: 3, reqLevel: 4, gap: 1 },
    ];
  };

  const gapMatrix = computeGapMatrix();
  const topGaps = gapMatrix.filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 3);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        {/* Brand Header Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> KaushalSetu Professional Profile Builder
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Map Your Competency & Career State
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-medium leading-relaxed">
            Establish your current skill baseline and target career role to calculate personalized learning gaps.
          </p>

          {/* Step Progress Tracker (6 Steps) */}
          <div className="grid grid-cols-6 gap-1 px-1 sm:px-4 pt-4 border-t border-slate-200/80">
            {[
              { id: 1, label: "Status" },
              { id: 2, label: "Education" },
              { id: 3, label: "Skills" },
              { id: 4, label: "Certificates" },
              { id: 5, label: "Goals" },
              { id: 6, label: "Assessment" },
            ].map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1 flex-1 relative">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.id
                      ? "bg-[#1e3a8a] text-white ring-4 ring-blue-500/20 shadow-xs"
                      : step > s.id
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 border border-slate-200 text-slate-500"
                  }`}
                >
                  {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                </div>
                <span className={`text-[10px] font-bold text-center hidden sm:block ${step === s.id ? "text-[#1e3a8a]" : "text-slate-600"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Card Container */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-[#0f172a]">
          
          {/* ==================== STEP 1: Current Status ==================== */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-800" />
                  Step 1: Current Status & Background
                </h2>
                <p className="text-xs text-slate-500 font-medium">Tell us about your professional work experience</p>
              </div>

              {/* Work Experience Radio Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Do you currently have professional work experience?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHasWorkExperience(true)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      hasWorkExperience
                        ? "bg-blue-50 border-blue-700 text-[#0f172a] ring-1 ring-blue-700 font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className={`h-5 w-5 ${hasWorkExperience ? "text-[#1e3a8a]" : "text-slate-500"}`} />
                      <div>
                        <p className="font-bold text-sm text-[#0f172a]">Yes, I have work experience</p>
                        <p className="text-[11px] text-slate-600 font-medium">Public officer or private professional</p>
                      </div>
                    </div>
                    {hasWorkExperience && <CheckCircle2 className="h-5 w-5 text-[#1e3a8a]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasWorkExperience(false)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      !hasWorkExperience
                        ? "bg-blue-50 border-blue-700 text-[#0f172a] ring-1 ring-blue-700 font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className={`h-5 w-5 ${!hasWorkExperience ? "text-[#1e3a8a]" : "text-slate-500"}`} />
                      <div>
                        <p className="font-bold text-sm text-[#0f172a]">No, I am a fresher</p>
                        <p className="text-[11px] text-slate-600 font-medium">Student or aspiring candidate</p>
                      </div>
                    </div>
                    {!hasWorkExperience && <CheckCircle2 className="h-5 w-5 text-[#1e3a8a]" />}
                  </button>
                </div>
              </div>

              {/* IF EXPERIENCED */}
              {hasWorkExperience ? (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Current Job Role
                      </label>
                      <select
                        value={currentJobRole}
                        onChange={(e) => setCurrentJobRole(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-[#0f172a] text-sm rounded-xl focus:bg-white font-bold"
                      >
                        <option>Statistical Officer</option>
                        <option>Data Analyst</option>
                        <option>Statistical Investigator</option>
                        <option>Research Officer</option>
                        <option>Data Processing Officer</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Department / Organization
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. NSSO, MoSPI"
                          className="pl-9 bg-slate-50 border-slate-200 text-[#0f172a] text-sm rounded-xl focus:bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Years of Experience
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {["0–1", "1–3", "3–5", "5–10", "10+"].map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setYearsOfExperienceRange(range)}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                            yearsOfExperienceRange === range
                              ? "bg-[#1e3a8a] text-white border-blue-900 shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {range} yrs
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Current Assignment / Responsibilities
                    </label>
                    <textarea
                      rows={2}
                      value={currentAssignment}
                      onChange={(e) => setCurrentAssignment(e.target.value)}
                      placeholder="I work on survey data collection, validation and statistical reporting..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0f172a] text-sm focus:bg-white font-medium"
                    />
                  </div>

                  {/* Previous Experience Sub-section */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Have you worked in any other previous roles?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHasPreviousRole(true)}
                          className={`px-3.5 py-1 text-xs rounded-xl font-bold transition-all ${
                            hasPreviousRole ? "bg-[#1e3a8a] text-white shadow-xs" : "bg-white border border-slate-300 text-slate-700"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasPreviousRole(false)}
                          className={`px-3.5 py-1 text-xs rounded-xl font-bold transition-all ${
                            !hasPreviousRole ? "bg-[#1e3a8a] text-white shadow-xs" : "bg-white border border-slate-300 text-slate-700"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {hasPreviousRole && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <Input
                          placeholder="Previous Role (e.g. Field Surveyor)"
                          value={previousRole}
                          onChange={(e) => setPreviousRole(e.target.value)}
                          className="bg-white border-slate-200 text-xs text-[#0f172a] font-bold rounded-xl"
                        />
                        <Input
                          placeholder="Experience (Years)"
                          value={previousExperienceYears}
                          onChange={(e) => setPreviousExperienceYears(e.target.value)}
                          className="bg-white border-slate-200 text-xs text-[#0f172a] font-bold rounded-xl"
                        />
                        <Input
                          placeholder="Main Responsibilities"
                          value={previousResponsibilities}
                          onChange={(e) => setPreviousResponsibilities(e.target.value)}
                          className="bg-white border-slate-200 text-xs text-[#0f172a] font-bold rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* IF FRESHER */
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Target Career Role
                    </label>
                    <select
                      value={targetCareerRole}
                      onChange={(e) => setTargetCareerRole(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-[#0f172a] text-sm rounded-xl focus:bg-white font-bold"
                    >
                      <option>Statistical Officer</option>
                      <option>Data Analyst</option>
                      <option>Statistical Investigator</option>
                      <option>Data Scientist</option>
                      <option>Research Officer</option>
                      <option>Data Processing Officer</option>
                      <option>AI/ML Analyst</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Target Organization / Sector
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        "Government / Public Sector",
                        "Official Statistics",
                        "Research",
                        "Private Sector",
                        "Academia",
                        "Not sure yet",
                      ].map((sector) => (
                        <button
                          key={sector}
                          type="button"
                          onClick={() => setTargetSector(sector)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                            targetSector === sector
                              ? "bg-blue-50 border-blue-700 text-[#0f172a] ring-1 ring-blue-700 shadow-xs"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 2: Education ==================== */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#1e3a8a]" />
                  Step 2: Educational Background
                </h2>
                <p className="text-xs text-slate-500 font-medium">Academic credentials and domain foundation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Highest Qualification
                  </label>
                  <select
                    value={highestQualification}
                    onChange={(e) => setHighestQualification(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-[#0f172a] text-sm rounded-xl focus:bg-white font-bold"
                  >
                    <option>Diploma</option>
                    <option>Bachelor's</option>
                    <option>Master's</option>
                    <option>PhD</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Degree / Field of Study
                  </label>
                  <Input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. M.Sc. Statistics / B.Tech CS"
                    className="bg-slate-50 border-slate-200 text-[#0f172a] text-sm rounded-xl focus:bg-white font-bold"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Graduation Year
                  </label>
                  <Input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2021"
                    className="bg-slate-50 border-slate-200 text-[#0f172a] text-sm rounded-xl focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-[#1e3a8a] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <span className="font-extrabold text-[#0f172a]">Why education matters:</span>
                  <p className="text-slate-600 font-medium">
                    KaushalSetu maps your academic foundation to skipping redundant beginner modules in subjects you have already mastered during formal education.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 3: Existing Technical Skills & Proficiency ==================== */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <Code className="h-5 w-5 text-emerald-700" />
                  Step 3: Existing Technical Skills & Proficiency Ratings
                </h2>
                <p className="text-xs text-slate-500 font-medium">Select skills you are familiar with and self-assess your baseline level</p>
              </div>

              {/* Categorized Skill Chips */}
              <div className="space-y-4">
                {SKILL_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-extrabold shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {isSelected ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Plus className="h-3.5 w-3.5 text-slate-400" />}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Proficiency Self-Ratings for Selected Skills */}
              {selectedSkills.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Self-Assessed Skill Proficiency Ratings:
                  </span>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedSkills.map((skill) => (
                      <div key={skill} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="font-extrabold text-[#0f172a] text-xs sm:w-32">{skill}</span>
                        <div className="grid grid-cols-4 gap-1.5 flex-1">
                          {PROFICIENCY_OPTIONS.map((opt) => {
                            const isCurrentProf = (skillProficiencies[skill] || "Intermediate") === opt.label;
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => updateProficiency(skill, opt.label)}
                                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                                  isCurrentProf
                                    ? "bg-[#1e3a8a] text-white border-blue-900 shadow-xs"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 4: Certificates & Training ==================== */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Step 4: Certificates & Prior Training
                </h2>
                <p className="text-xs text-slate-500 font-medium">Add relevant certifications or government training completed</p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Have you completed any relevant training or certifications?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setHasCertifications(true)}
                    className={`px-4 py-2 text-xs rounded-xl font-bold border transition-all ${
                      hasCertifications ? "bg-amber-50 border-amber-300 text-amber-950 shadow-2xs font-extrabold" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Yes, I have certifications
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasCertifications(false)}
                    className={`px-4 py-2 text-xs rounded-xl font-bold border transition-all ${
                      !hasCertifications ? "bg-[#1e3a8a] text-white border-blue-900 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    No, skip this
                  </button>
                </div>
              </div>

              {hasCertifications && (
                <div className="space-y-3 pt-2">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-amber-900">Certificate #{idx + 1}</span>
                        {certificates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCertificateRow(idx)}
                            className="text-rose-700 hover:text-rose-900 text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          placeholder="Certificate Name (e.g. Python for Public Sector)"
                          value={cert.name}
                          onChange={(e) => updateCertificateField(idx, "name", e.target.value)}
                          className="bg-white border-slate-200 text-xs text-[#0f172a] font-bold rounded-xl"
                        />
                        <Input
                          placeholder="Provider (e.g. NSSTA / iGOT)"
                          value={cert.provider}
                          onChange={(e) => updateCertificateField(idx, "provider", e.target.value)}
                          className="bg-white border-slate-200 text-xs text-[#0f172a] font-bold rounded-xl"
                        />
                        <Input
                          placeholder="Year Completed (YYYY)"
                          value={cert.year}
                          onChange={(e) => updateCertificateField(idx, "year", e.target.value)}
                          className="bg-white border-slate-200 text-xs text-[#0f172a] font-bold rounded-xl"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCertificateRow}
                    className="w-full border-dashed border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 rounded-xl"
                  >
                    <Plus className="h-4 w-4 text-blue-800" /> Add Another Certificate
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 5: Learning Goal & Schedule ==================== */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <Compass className="h-5 w-5 text-[#1e3a8a]" />
                  Step 5: Learning Goal & Study Commitment
                </h2>
                <p className="text-xs text-slate-500 font-medium">Configure your adaptive roadmap pacing and daily schedule</p>
              </div>

              {/* Target Course / Pathway Selector (Drives Diagnostic Test) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Primary Target Course / Learning Pathway</span>
                  <span className="text-[10px] text-blue-900 font-bold">Diagnostic test will assess prerequisites for this course</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MOCK_COURSES.map((crs) => {
                    const isSelected = selectedCourseId === crs.id;
                    return (
                      <button
                        key={crs.id}
                        type="button"
                        onClick={() => setSelectedCourseId(crs.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                          isSelected
                            ? "bg-blue-50 border-blue-700 text-[#0f172a] ring-1 ring-blue-700 shadow-xs font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-[#1e3a8a]">{crs.provider}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-extrabold">Level {crs.level}</span>
                        </div>
                        <p className="text-xs font-bold text-[#0f172a] leading-snug">{crs.title}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {crs.competencies.map((comp, cIdx) => (
                            <span key={cIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-bold">
                              Prerequisite: {comp}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Learning Goal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  What do you primary want to achieve?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LEARNING_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setLearningGoal(goal)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        learningGoal === goal
                          ? "bg-blue-50 border-blue-700 text-[#0f172a] ring-1 ring-blue-700 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Timeline & Daily Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Timeline
                  </label>
                  <div className="space-y-1.5">
                    {TARGET_TIMELINES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTargetTimeline(t)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          targetTimeline === t
                            ? "bg-blue-50 border-blue-700 text-[#0f172a] ring-1 ring-blue-700 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daily Time Dedicated to Learning
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAILY_TIME_OPTIONS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setDailyLearningTime(time)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          dailyLearningTime === time
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400 shadow-xs font-black"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Preferred Learning Days
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAYS.map((day) => {
                        const isDaySel = preferredDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWeekday(day)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                              isDaySel
                                ? "bg-[#1e3a8a] text-white border-blue-900 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 6: Diagnostic Test & Competency Gap Analysis ==================== */}
          {step === 6 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-[#1e3a8a]" />
                    Step 6: Diagnostic Skill Assessment & Gap Analysis
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Questions generated dynamically for role <strong className="text-blue-900">{activeTargetRole}</strong> and skills ({dynamicQuestions.length} Questions)
                  </p>
                </div>
                <Badge className="bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                  {dynamicQuestions.length} Custom Questions
                </Badge>
              </div>

              {/* Course Prerequisite Assessment Header Card */}
              {(() => {
                const matchedCourse = MOCK_COURSES.find((c) => c.id === selectedCourseId);
                return (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <BookOpen className="h-5 w-5 text-amber-300" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#0f172a] flex items-center gap-2">
                          <span>Target Course: {matchedCourse?.title || "Selected Pathway"}</span>
                        </p>
                        <p className="text-[11px] text-blue-900 font-bold">
                          Assessing Prerequisite Competencies: {matchedCourse?.competencies.join(", ") || "Core Skills"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-[#1e3a8a] text-white border-blue-900 text-[10px] font-bold shrink-0 self-start sm:self-auto shadow-xs">
                      Course Assessment
                    </Badge>
                  </div>
                );
              })()}

              {/* Questions List */}
              <div className="space-y-4">
                {dynamicQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4.5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs text-[#0f172a]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-blue-900">Question {idx + 1} of {dynamicQuestions.length}</span>
                      <span className="text-slate-500 font-bold">Domain: {q.competencyName}</span>
                    </div>

                    <p className="text-sm font-bold text-[#0f172a] leading-relaxed">{q.questionText}</p>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedAnswers[q.id] === opt.id;
                        let optStyle = "border-slate-200 bg-slate-50 text-[#0f172a] hover:bg-blue-50/60 font-medium";

                        if (isSelected) {
                          optStyle = "border-blue-800 bg-blue-900 text-white font-bold shadow-xs";
                        }

                        if (testSubmitted) {
                          if (opt.isCorrect) {
                            optStyle = "border-emerald-400 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-1 ring-emerald-400";
                          } else if (isSelected && !opt.isCorrect) {
                            optStyle = "border-rose-400 bg-rose-50 text-rose-950 font-bold shadow-xs ring-1 ring-rose-300";
                          } else {
                            optStyle = "border-slate-200 bg-slate-50/80 text-slate-700 font-medium opacity-80";
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            disabled={testSubmitted}
                            className={`w-full p-3.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between gap-3 ${optStyle}`}
                          >
                            <span className="text-xs">{opt.optionText}</span>
                            {testSubmitted && opt.isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                            )}
                            {testSubmitted && isSelected && !opt.isCorrect && (
                              <XCircle className="h-4 w-4 text-rose-700 shrink-0" />
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
                  disabled={Object.keys(selectedAnswers).length < dynamicQuestions.length}
                  className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs"
                >
                  Evaluate {dynamicQuestions.length} Questions & Calculate Gap Matrix
                </Button>
              )}

              {/* Skill Gap Analysis Result Matrix */}
              {testSubmitted && (
                <div className="space-y-4 pt-2 animate-in fade-in duration-300">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0f172a] text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#1e3a8a]" />
                        Competency Gap Analysis Result
                      </span>
                      <Badge className="bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                        Target Role: {activeTargetRole}
                      </Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-2 px-2 font-bold">Competency Domain</th>
                            <th className="py-2 px-2 font-bold text-center">Self-Assessed</th>
                            <th className="py-2 px-2 font-bold text-center">Test Verified</th>
                            <th className="py-2 px-2 font-bold text-center">Required</th>
                            <th className="py-2 px-2 font-bold text-right">Skill Gap</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {gapMatrix.map((row) => (
                            <tr key={row.name} className="hover:bg-white/80">
                              <td className="py-2.5 px-2 font-bold text-[#0f172a]">{row.name}</td>
                              <td className="py-2.5 px-2 text-center text-slate-700 font-medium">Level {row.selfLevel}</td>
                              <td className="py-2.5 px-2 text-center text-blue-900 font-extrabold">Level {row.testVerifiedLevel}</td>
                              <td className="py-2.5 px-2 text-center text-slate-600 font-medium">Level {row.reqLevel}</td>
                              <td className="py-2.5 px-2 text-right">
                                {row.gap > 0 ? (
                                  <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-900 font-bold text-[11px]">
                                    {row.gap} {row.gap === 1 ? "Level" : "Levels"}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px]">
                                    Satisfied
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Single Overlaid Comparative Hexagonal Radar Chart */}
                  <HexagonalStatsGraph
                    data={gapMatrix.map((row) => ({
                      name: row.name,
                      currentLevel: row.testVerifiedLevel,
                      targetLevel: row.reqLevel,
                    }))}
                    targetRole={activeTargetRole}
                  />

                  {/* Summary Alert Box */}
                  <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-1.5 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-2 text-emerald-900 font-extrabold text-sm">
                      <Sparkles className="h-4 w-4 text-emerald-700" />
                      Gap Engine Analysis Complete!
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Your largest competency gaps are{" "}
                      <strong className="text-[#0f172a]">
                        {topGaps.map((g) => g.name).join(", ") || "Advanced Data Analytics"}
                      </strong>.
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      KaushalSetu has initialized your personalized learning roadmap targeting these specific gap areas.
                    </p>
                  </div>
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

            {step < 6 ? (
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
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  "Finalizing Setup..."
                ) : (
                  <>
                    Save Profile & Generate Personalized Roadmap <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
