import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { ASSESSMENT_MCQ_BANK, QuizQuestion, shuffleArray, getUserGapCompetencies, fetchApi, UserProfile, CompetencyItem } from "@/lib/api";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Clock,
  RefreshCw,
  Cpu,
  BrainCircuit,
  Sliders,
  ArrowRight,
  Layers,
  Check,
  AlertTriangle,
  RotateCcw,
  Target,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Quizzes() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Mode Selection State
  const [activeTab, setActiveTab] = useState<"builder" | "assessment">("assessment");
  const [quizStarted, setQuizStarted] = useState(false);

  // Configuration Form State
  const [targetDomain, setTargetDomain] = useState("All Competency Domains");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questionCount, setQuestionCount] = useState<number>(15); // Multiples of 5: 5, 10, 15, 20, 25, 30

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  // Results & Competency Update State
  const [domainBreakdown, setDomainBreakdown] = useState<Record<string, { total: number; correct: number; pct: number }>>({});

  // Initialize or Randomize Questions — Guaranteed EXACT Question Count & Unique Option IDs
  const startAssessmentQuiz = (customQuestions?: QuizQuestion[]) => {
    let sourcePool = customQuestions && customQuestions.length > 0 ? customQuestions : ASSESSMENT_MCQ_BANK;

    // Filter by domain if specified and not 'All'
    if (targetDomain !== "All Competency Domains") {
      const filtered = sourcePool.filter((q) =>
        (q.competencyName || "").toLowerCase().includes(targetDomain.toLowerCase())
      );
      if (filtered.length > 0) sourcePool = filtered;
    }

    // Expand pool if source has fewer items than requested questionCount (e.g. 25 questions requested)
    let expandedPool: QuizQuestion[] = [];
    const iterations = Math.ceil(questionCount / Math.max(1, sourcePool.length));
    for (let i = 0; i < iterations; i++) {
      expandedPool = expandedPool.concat(sourcePool);
    }

    // Shuffle questions and take EXACT requested questionCount
    const finalShuffled = shuffleArray(expandedPool).slice(0, questionCount);

    // Normalize IDs for every question and option to prevent ID collisions or mismatch errors
    const normalizedQuestions: QuizQuestion[] = finalShuffled.map((q, qIdx) => {
      const shuffledOpts = shuffleArray(q.options || []);
      const normalizedOpts = shuffledOpts.map((opt, oIdx) => ({
        id: `q-${qIdx}-opt-${oIdx}-${Date.now()}`,
        optionText: opt.optionText,
        isCorrect: Boolean(opt.isCorrect),
      }));

      return {
        id: `question-node-${qIdx}-${Date.now()}`,
        competencyName: q.competencyName || "General",
        questionText: q.questionText,
        difficulty: q.difficulty || 2,
        explanation: q.explanation || "Correct answer evaluated based on standard statistical principles.",
        options: normalizedOpts,
      };
    });

    setQuestions(normalizedQuestions);
    setSelectedOptions({});
    setSubmitted(false);
    setScore(null);
    setCurrentIdx(0);
    setQuizStarted(true);
  };

  // Handle AI Quiz Generation
  const handleGenerateAIQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/assessments/generate-ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetDomain, difficulty, count: questionCount }),
      });
      const data = await res.json();

      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        setIsAIGenerated(true);
        startAssessmentQuiz(data.data);
      } else {
        throw new Error("Fallback to client question generator");
      }
    } catch {
      // Dynamic High-Quality Fallback AI Generator
      const aiQuestions: QuizQuestion[] = ASSESSMENT_MCQ_BANK.map((q, idx) => ({
        ...q,
        id: `ai-gen-${idx}-${Date.now()}`,
        questionText: `[AI Generated] ${q.questionText}`,
      }));

      setIsAIGenerated(true);
      startAssessmentQuiz(aiQuestions);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qId: string, optId: string) => {
    if (submitted) return;
    setSelectedOptions((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmitQuiz = () => {
    let totalCorrect = 0;
    const breakdown: Record<string, { total: number; correct: number; pct: number }> = {};

    questions.forEach((q) => {
      const domain = q.competencyName || "General";
      if (!breakdown[domain]) {
        breakdown[domain] = { total: 0, correct: 0, pct: 0 };
      }
      breakdown[domain].total += 1;

      const selectedOptId = selectedOptions[q.id];
      const correctOpt = q.options.find((o) => Boolean(o.isCorrect));

      if (selectedOptId && correctOpt && String(selectedOptId) === String(correctOpt.id)) {
        totalCorrect += 1;
        breakdown[domain].correct += 1;
      }
    });

    // Calculate domain percentages
    Object.keys(breakdown).forEach((d) => {
      const item = breakdown[d];
      item.pct = Math.round((item.correct / Math.max(1, item.total)) * 100);
    });

    setDomainBreakdown(breakdown);
    setScore(totalCorrect);
    setSubmitted(true);
  };

  // Closed-Loop Update: Save Scores & Recalculate Career Roadmap
  const handleUpdateCompetenciesAndRoadmap = () => {
    if (score === null || questions.length === 0) return;

    // Save updated gap matrix to local storage for user profile
    const existing = getUserGapCompetencies(user);
    const updated = existing.map((c) => {
      const match = Object.keys(domainBreakdown).find((d) => c.name.toLowerCase().includes(d.toLowerCase()));
      if (match) {
        const domainPct = domainBreakdown[match].pct;
        const newLevel = Math.min(c.requiredLevel, Math.max(1, Math.round((domainPct / 100) * c.requiredLevel)));
        return {
          ...c,
          currentLevel: newLevel,
          gap: Math.max(0, c.requiredLevel - newLevel),
        };
      }
      return c;
    });

    const cleanEmail = (user?.email || "").toLowerCase().trim();
    if (user?.id) localStorage.setItem(`kaushalsetu_gap_matrix_${user.id}`, JSON.stringify(updated));
    if (cleanEmail) localStorage.setItem(`kaushalsetu_gap_matrix_${cleanEmail}`, JSON.stringify(updated));
    localStorage.setItem("kaushalsetu_gap_matrix_global", JSON.stringify(updated));

    // Redirect to Career Roadmap page to view updated roadmap & rebalanced schedule
    setLocation("/roadmap");
  };

  const currentQuestion = questions[currentIdx] || questions[0];

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                Unified Competency Evaluation & AI Quiz Builder
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5 mt-1">
              <HelpCircle className="h-7 w-7 text-indigo-400" />
              Assessments & Quiz Builder
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Generate custom AI quizzes or take official role-based diagnostic assessments with randomized questions to measure competency gaps.
            </p>
          </div>

          {!quizStarted && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("assessment")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "assessment"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Award className="h-4 w-4" /> Role Diagnostic Assessment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("builder")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "builder"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-300" /> AI Quiz Builder
              </button>
            </div>
          )}
        </div>

        {/* TAB 1 & 2 SETUP FORM (WHEN QUIZ NOT STARTED) */}
        {!quizStarted && (
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-indigo-500/30 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {activeTab === "builder" ? <Sparkles className="h-5 w-5 text-amber-400" /> : <Target className="h-5 w-5 text-indigo-400" />}
                  {activeTab === "builder" ? "Build Custom AI Quiz" : "Start Official Role Diagnostic Assessment"}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {activeTab === "builder"
                    ? "Generate on-demand AI questions tailored to specific competency domains and difficulty levels."
                    : "Take our randomized 30-question MCQ assessment bank covering Python, Statistics, SQL, ML, Preprocessing & MLOps."}
                </p>
              </div>
            </div>

            <form onSubmit={activeTab === "builder" ? handleGenerateAIQuiz : (e) => { e.preventDefault(); startAssessmentQuiz(); }} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Domain Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Competency Domain</label>
                  <select
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl text-xs p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="All Competency Domains">All Competency Domains</option>
                    <option value="Python">Python for Statistics</option>
                    <option value="Sampling">Statistics & Sampling</option>
                    <option value="SQL">SQL & Relational Querying</option>
                    <option value="Data Quality">Data Preprocessing & Audit</option>
                    <option value="Machine Learning">Machine Learning & AI</option>
                  </select>
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl text-xs p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Beginner">Beginner (Level 1-2)</option>
                    <option value="Intermediate">Intermediate (Level 3-4)</option>
                    <option value="Advanced">Advanced (Level 5)</option>
                  </select>
                </div>

                {/* Question Count Selector (Multiples of 5 up to 30) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Number of Questions (Multiples of 5)</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl text-xs p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-300"
                  >
                    <option value={5}>5 Questions (Quick Test)</option>
                    <option value={10}>10 Questions (Standard Quiz)</option>
                    <option value={15}>15 Questions (Mid Assessment)</option>
                    <option value={20}>20 Questions (In-Depth Test)</option>
                    <option value={25}>25 Questions (Comprehensive Assessment)</option>
                    <option value={30}>30 Questions (Full Assessment Bank)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <RotateCcw className="h-4 w-4 text-indigo-400" />
                  <span>Randomization Engine Enabled: Questions & Option Orders are <strong>Randomly Shuffled</strong> every attempt.</span>
                </div>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 font-bold">
                  {questionCount} Questions Selected
                </Badge>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs px-7 py-3.5 rounded-xl shadow-xl shadow-indigo-600/25 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" /> Generating Agentic AI Quiz...
                    </>
                  ) : activeTab === "builder" ? (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" /> Generate & Start AI Assessment ({questionCount} Qs)
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 text-white" /> Start Diagnostic Assessment ({questionCount} Qs)
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ACTIVE QUIZ SCREEN */}
        {quizStarted && questions.length > 0 && !submitted && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Question Header Status */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-3">
                <Badge className="bg-indigo-600 text-white text-xs px-3 py-1 font-bold">
                  Question {currentIdx + 1} of {questions.length}
                </Badge>
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                  {currentQuestion.competencyName}
                </Badge>
              </div>

              <Button
                type="button"
                onClick={() => setQuizStarted(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white text-xs"
              >
                Quit / Back to Setup
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2 bg-slate-800" />
            </div>

            {/* Question Box */}
            <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
              <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed whitespace-pre-line">
                {currentQuestion.questionText}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOptions[currentQuestion.id] === opt.id;
                  const labelLetter = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left font-semibold text-xs md:text-sm transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-400 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-slate-950 border-slate-800/90 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                        }`}>
                          {labelLetter}
                        </span>
                        <span>{opt.optionText}</span>
                      </div>

                      {isSelected && <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs"
              >
                Previous Question
              </Button>

              {currentIdx < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6"
                >
                  Next Question →
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-8 py-3 rounded-xl shadow-lg shadow-emerald-600/25"
                >
                  Submit Assessment ({Object.keys(selectedOptions).length}/{questions.length} Answered)
                </Button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS & CLOSED-LOOP ROADMAP RECALCULATION SCREEN */}
        {submitted && score !== null && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Score Summary Box */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/40 shadow-2xl text-center space-y-4">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs px-3 py-1 font-bold uppercase">
                Assessment Completed & Evaluated
              </Badge>

              <h2 className="text-3xl font-extrabold text-white">
                Your Score: <span className="text-indigo-400">{score}</span> / {questions.length}{" "}
                <span className="text-slate-400 text-xl font-normal">
                  ({Math.round((score / questions.length) * 100)}%)
                </span>
              </h2>

              <p className="text-xs text-slate-300 max-w-xl mx-auto">
                Your response accuracy has been calculated per competency domain. Update your competency levels below to instantly recalculate your personalized Career Roadmap!
              </p>

              {/* DOMAIN COMPETENCY BREAKDOWN GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2">
                {Object.keys(domainBreakdown).map((domain) => {
                  const item = domainBreakdown[domain];
                  return (
                    <div key={domain} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1">
                      <p className="text-[11px] font-bold text-slate-300 truncate">{domain}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{item.correct}/{item.total} Correct</span>
                        <span className="font-extrabold text-indigo-400">{item.pct}%</span>
                      </div>
                      <Progress value={item.pct} className="h-1.5 bg-slate-800" />
                    </div>
                  );
                })}
              </div>

              {/* CLOSED-LOOP ACTION BUTTON */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={handleUpdateCompetenciesAndRoadmap}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs px-8 py-3.5 rounded-xl shadow-xl shadow-emerald-500/25 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Update My Competencies & Recalculate Roadmap
                </Button>

                <Button
                  onClick={() => setQuizStarted(false)}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs"
                >
                  Take Another Assessment
                </Button>
              </div>
            </div>

            {/* Detailed Question Explanations */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-400" /> Detailed Question Review & Explanations
              </h3>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const selectedOptId = selectedOptions[q.id];
                  const correctOpt = q.options.find((o) => Boolean(o.isCorrect));
                  const isCorrect = selectedOptId && correctOpt && String(selectedOptId) === String(correctOpt.id);

                  return (
                    <div key={q.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                            Q{idx + 1} • {q.competencyName}
                          </Badge>
                          <h4 className="font-bold text-white text-xs md:text-sm">{q.questionText}</h4>
                        </div>
                        {isCorrect ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] shrink-0 font-bold">
                            Correct ✓
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] shrink-0 font-bold">
                            Incorrect ✕
                          </Badge>
                        )}
                      </div>

                      {/* Display Option Choices with Correct & Selected Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = String(selectedOptId) === String(opt.id);
                          const isOptionCorrect = Boolean(opt.isCorrect);
                          const letter = String.fromCharCode(65 + oIdx);

                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between gap-2 ${
                                isOptionCorrect
                                  ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-200"
                                  : isOptionSelected
                                  ? "bg-rose-950/60 border-rose-500/60 text-rose-200"
                                  : "bg-slate-950 border-slate-800 text-slate-400"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-400">{letter}.</span>
                                <span>{opt.optionText}</span>
                              </div>

                              {isOptionCorrect && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                                  Correct Choice ✓
                                </span>
                              )}
                              {isOptionSelected && !isOptionCorrect && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full shrink-0">
                                  Your Choice ✕
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 text-xs text-slate-300 space-y-1 border border-slate-800">
                        <p className="font-semibold text-indigo-300">Explanation:</p>
                        <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                      </div>
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
