import React, { useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import {
  MOCK_COMPETENCIES,
  fetchApi,
  ASSESSMENT_MCQ_BANK,
  CompetencyItem,
  getUserGapCompetencies,
  shuffleArray,
  getDisplayName
} from "@/lib/api";

const setUserGapCompetencies = (user: any, competencies: CompetencyItem[]) => {
  const cleanEmail = (user?.email || "").toLowerCase().trim();
  if (user?.id) localStorage.setItem(`kaushalsetu_comps_${user.id}`, JSON.stringify(competencies));
  if (cleanEmail) localStorage.setItem(`kaushalsetu_comps_${cleanEmail}`, JSON.stringify(competencies));
  localStorage.setItem("kaushalsetu_comps_global", JSON.stringify(competencies));
};
import {
  HelpCircle,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Clock,
  BookOpen,
  BrainCircuit,
  Sliders,
  Check,
  Zap,
  Target,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

export default function Quizzes() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"assessment" | "generator">("assessment");

  // Assessment Config State
  const [questionCount, setQuestionCount] = useState<number>(25); // Default 25 (Multiples of 5: 5, 10, 15, 20, 25, 30)
  const [selectedDomain, setSelectedDomain] = useState<string>("All Domains");

  // Generator Config State
  const [genTopic, setGenTopic] = useState("Python Data Science");
  const [genDifficulty, setGenDifficulty] = useState("Intermediate");
  const [genCount, setGenCount] = useState(10);
  const [genGenerating, setGenGenerating] = useState(false);

  // Active Quiz Running State
  const [quizRunning, setQuizRunning] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [domainBreakdown, setDomainBreakdown] = useState<Record<string, { total: number; correct: number }>>({});
  const [competenciesUpdated, setCompetenciesUpdated] = useState(false);

  // START DIAGNOSTIC ASSESSMENT / AI QUIZ
  const startAssessmentQuiz = (overrideCount?: number | React.SyntheticEvent) => {
    const targetCount = typeof overrideCount === "number" ? overrideCount : questionCount;
    const isAiCustom = typeof overrideCount === "number";
    let sourcePool = [...ASSESSMENT_MCQ_BANK];
    if (selectedDomain !== "All Domains" && !isAiCustom) {
      sourcePool = sourcePool.filter((q) => ((q as any).domain || "").toLowerCase() === selectedDomain.toLowerCase());
    }

    if (sourcePool.length === 0) {
      sourcePool = [...ASSESSMENT_MCQ_BANK];
    }

    // Dynamic Expansion: duplicate/cycle pool if requested count > available questions
    let finalPool: any[] = [];
    while (finalPool.length < targetCount) {
      finalPool = [...finalPool, ...shuffleArray([...sourcePool])];
    }
    finalPool = finalPool.slice(0, targetCount);

    // Shuffle questions and options with explicit unique IDs
    const preparedQuestions = finalPool.map((q, qIdx) => {
      const shuffledOpts = shuffleArray(q.options).map((opt: any, oIdx: number) => ({
        ...opt,
        id: `q-${qIdx}-opt-${oIdx}-${Date.now()}`,
      }));
      return {
        ...q,
        id: `q-${qIdx}-${Date.now()}`,
        domain: isAiCustom ? genTopic : (q.domain || "General"),
        options: shuffledOpts,
      };
    });

    setQuizQuestions(preparedQuestions);
    setCurrentIdx(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setQuizScore(0);
    setDomainBreakdown({});
    setCompetenciesUpdated(false);
    setQuizRunning(true);
  };

  // GENERATE AI QUIZ
  const handleGenerateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setGenGenerating(true);
    setTimeout(() => {
      setGenGenerating(false);
      startAssessmentQuiz(genCount);
    }, 800);
  };

  // ANSWER SELECTION HANDLER
  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // SUBMIT QUIZ & CALCULATE DOMAIN SCORES
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    const breakdown: Record<string, { total: number; correct: number }> = {};

    quizQuestions.forEach((q) => {
      const domain = q.domain || "General";
      if (!breakdown[domain]) {
        breakdown[domain] = { total: 0, correct: 0 };
      }
      breakdown[domain].total += 1;

      const chosenOptId = userAnswers[q.id];
      const chosenOpt = q.options.find((o: any) => o.id === chosenOptId);
      if (chosenOpt && Boolean(chosenOpt.isCorrect)) {
        correctCount += 1;
        breakdown[domain].correct += 1;
      }
    });

    setQuizScore(correctCount);
    setDomainBreakdown(breakdown);
    setQuizCompleted(true);
    setQuizRunning(false);
  };

  // UPDATE LOCALSTORAGE COMPETENCY MATRIX & RECALCULATE ROADMAP
  const handleUpdateCompetencies = () => {
    const existing = getUserGapCompetencies(user);
    const updated = existing.map((c) => {
      const stats = domainBreakdown[c.name];
      if (stats && stats.total > 0) {
        const pct = stats.correct / stats.total;
        let newLevel = Math.max(1, Math.round(pct * 5));
        return {
          ...c,
          currentLevel: newLevel,
          gap: Math.max(0, c.requiredLevel - newLevel),
        };
      }
      return c;
    });

    setUserGapCompetencies(user, updated);
    setCompetenciesUpdated(true);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-900 border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Integrated Assessment System
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight flex items-center gap-2.5 mt-1">
              <HelpCircle className="h-7 w-7 text-blue-800" />
              Role Diagnostic & AI Assessment Hub
            </h1>
            <p className="text-slate-600 text-sm mt-1 font-medium">
              Diagnostic multi-choice tests to benchmark officer competency levels, update gap matrices, and trigger adaptive roadmap recalculations.
            </p>
          </div>
        </div>

        {/* SETUP FORM & TAB SWITCHER (If quiz not actively running/completed) */}
        {!quizRunning && !quizCompleted && (
          <div className="space-y-6">
            {/* Tab Navigation Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 max-w-md shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("assessment")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === "assessment"
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Role Diagnostic Assessment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("generator")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === "generator"
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                AI Quiz Builder
              </button>
            </div>

            {/* TAB 1: ROLE DIAGNOSTIC ASSESSMENT SETUP */}
            {activeTab === "assessment" && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-800" />
                    Configure Diagnostic Test
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Select your target domain and question count to launch your diagnostic test. Questions are randomly sampled from official MCQs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Question Count Selector (Multiples of 5: 5, 10, 15, 20, 25, 30) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Number of Questions</label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-bold"
                    >
                      <option value={5}>5 Questions (Quick Check)</option>
                      <option value={10}>10 Questions (Standard)</option>
                      <option value={15}>15 Questions (Detailed)</option>
                      <option value={20}>20 Questions (Comprehensive)</option>
                      <option value={25}>25 Questions (Full Diagnostic)</option>
                      <option value={30}>30 Questions (Complete Master Bank)</option>
                    </select>
                  </div>

                  {/* Competency Domain Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Filter by Competency Domain</label>
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-bold"
                    >
                      <option value="All Domains">All Domains (Comprehensive)</option>
                      <option value="Python">Python for Statistics</option>
                      <option value="Statistics">Statistics & Probability</option>
                      <option value="SQL">SQL & Database Querying</option>
                      <option value="Data Audit">Data Preprocessing & Audit</option>
                      <option value="Machine Learning">Machine Learning & AI</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={startAssessmentQuiz}
                    className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2"
                  >
                    Start {questionCount}-Question Assessment →
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: AI QUIZ BUILDER SETUP */}
            {activeTab === "generator" && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-blue-800" />
                    Custom AI Quiz Builder
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Generate targeted AI quiz modules on any custom topic or policy domain using NVIDIA AI Engine.
                  </p>
                </div>

                <form onSubmit={handleGenerateQuiz} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Topic / Skill Domain</label>
                      <input
                        type="text"
                        value={genTopic}
                        onChange={(e) => setGenTopic(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-bold"
                        placeholder="e.g. Sampling Theory"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Difficulty Level</label>
                      <select
                        value={genDifficulty}
                        onChange={(e) => setGenDifficulty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-bold"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Question Count</label>
                      <select
                        value={genCount}
                        onChange={(e) => setGenCount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] rounded-xl text-xs p-3 focus:ring-2 focus:ring-blue-800 outline-none font-bold"
                      >
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={15}>15 Questions</option>
                        <option value={20}>20 Questions</option>
                        <option value={25}>25 Questions</option>
                        <option value={30}>30 Questions</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={genGenerating}
                      className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2"
                    >
                      {genGenerating ? "Generating AI Quiz..." : `Generate & Launch ${genCount}-Question Quiz →`}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE QUIZ SCREEN */}
        {quizRunning && quizQuestions.length > 0 && (
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-xs text-[#0f172a]">
            {/* Header Status & Progress */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <Badge className="bg-blue-50 text-blue-900 border-blue-200 text-[10px] font-bold">
                  Domain: {quizQuestions[currentIdx]?.domain || "General"}
                </Badge>
                <h2 className="text-sm font-extrabold text-slate-700 mt-1">
                  Question {currentIdx + 1} of {quizQuestions.length}
                </h2>
              </div>

              <span className="text-xs font-extrabold text-blue-900">
                {Math.round(((currentIdx + 1) / quizQuestions.length) * 100)}% Progress
              </span>
            </div>

            <Progress value={((currentIdx + 1) / quizQuestions.length) * 100} className="h-2 bg-slate-100" />

            {/* Question Box */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-bold text-[#0f172a] leading-relaxed">
                {quizQuestions[currentIdx]?.questionText}
              </h3>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {quizQuestions[currentIdx]?.options.map((opt: any, optIdx: number) => {
                  const isSelected = userAnswers[quizQuestions[currentIdx].id] === opt.id;
                  const optionText = opt.optionText || opt.text || "";
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(quizQuestions[currentIdx].id, opt.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-[#0f172a] border-slate-900 text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-[#0f172a] hover:bg-blue-50/70 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-7 w-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-white border-slate-300 text-slate-700"
                          }`}
                        >
                          {letter}
                        </span>
                        <span className={`text-sm font-semibold leading-normal ${isSelected ? "text-white" : "text-[#0f172a]"}`}>
                          {optionText}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
              >
                ← Previous
              </Button>

              {currentIdx < quizQuestions.length - 1 ? (
                <Button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs px-5"
                >
                  Next Question →
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-6 shadow-xs"
                >
                  Submit & Finish Assessment ✓
                </Button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS & QUESTION REVIEW SCREEN */}
        {quizCompleted && (
          <div className="space-y-6">
            {/* Score Summary Box */}
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-xs text-[#0f172a]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold">
                    Assessment Completed
                  </Badge>
                  <h2 className="text-xl font-extrabold text-[#0f172a] mt-1">Diagnostic Score Breakdown</h2>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={startAssessmentQuiz}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retake Assessment
                  </Button>

                  <Button
                    onClick={handleUpdateCompetencies}
                    disabled={competenciesUpdated}
                    className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    {competenciesUpdated ? "Competencies Updated! ✓" : "Update My Competencies & Recalculate Roadmap"}
                  </Button>
                </div>
              </div>

              {/* Score Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <p className="text-xs text-slate-500 font-bold">Total Score</p>
                  <p className="text-3xl font-black text-[#0f172a]">
                    {quizScore} / {quizQuestions.length}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <p className="text-xs text-slate-500 font-bold">Accuracy Percentage</p>
                  <p className="text-3xl font-black text-blue-900">
                    {Math.round((quizScore / quizQuestions.length) * 100)}%
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <p className="text-xs text-slate-500 font-bold">Competency Impact</p>
                  <p className="text-sm font-extrabold text-emerald-700 mt-2">
                    {competenciesUpdated ? "Roadmap Recalculated ✓" : "Pending Update Action"}
                  </p>
                </div>
              </div>

              {/* Domain Breakdown Grid */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-extrabold text-[#0f172a]">Accuracy by Domain:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(domainBreakdown).map(([domain, stats]) => {
                    const pct = Math.round((stats.correct / Math.max(1, stats.total)) * 100);
                    return (
                      <div key={domain} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-800">{domain}</span>
                        <span className="font-black text-blue-900">{stats.correct}/{stats.total} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Question Review List */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-[#0f172a]">Detailed Answers & Explanations Review</h3>

              <div className="space-y-4">
                {quizQuestions.map((q, idx) => {
                  const chosenOptId = userAnswers[q.id];
                  const chosenOpt = q.options.find((o: any) => o.id === chosenOptId);
                  const isCorrect = chosenOpt && Boolean(chosenOpt.isCorrect);

                  return (
                    <div key={q.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs text-[#0f172a]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-600">Question {idx + 1} ({q.domain})</span>
                        {isCorrect ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                            Correct ✓
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold">
                            Incorrect ✕
                          </Badge>
                        )}
                      </div>

                      <p className="font-bold text-sm text-[#0f172a]">{q.questionText}</p>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt: any, optIdx: number) => {
                          const isUserChoice = chosenOptId === opt.id;
                          const isTrueAnswer = Boolean(opt.isCorrect);
                          const optionText = opt.optionText || opt.text || "";
                          const letter = String.fromCharCode(65 + optIdx);

                          return (
                            <div
                              key={opt.id}
                              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-3 ${
                                isTrueAnswer
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-black"
                                  : isUserChoice
                                  ? "bg-rose-50 border-rose-300 text-rose-950"
                                  : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-slate-500">{letter}.</span>
                                <span className="text-xs font-semibold">{optionText}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isTrueAnswer && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                                    Correct Choice ✓
                                  </span>
                                )}
                                {isUserChoice && !isTrueAnswer && (
                                  <span className="px-2 py-0.5 rounded bg-rose-700 text-white text-[10px] font-bold">
                                    Your Choice ✕
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium mt-2">
                        <strong className="text-slate-800">Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
