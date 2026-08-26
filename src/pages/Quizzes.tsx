import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { MOCK_QUESTIONS, QuizQuestion } from "@/lib/api";
import { HelpCircle, CheckCircle2, XCircle, Award, Sparkles, Clock, RefreshCw, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Quizzes() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(MOCK_QUESTIONS);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    // Check if AI generated questions exist in sessionStorage
    const savedAI = sessionStorage.getItem("kaushalsetu_ai_questions");
    if (savedAI) {
      try {
        const parsed = JSON.parse(savedAI);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          setIsAIGenerated(true);
        }
      } catch {}
    }
  }, []);

  const question = questions[currentIdx] || MOCK_QUESTIONS[0];

  const handleSelect = (qId: string, optId: string) => {
    if (submitted) return;
    setSelectedOptions((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmit = () => {
    let total = 0;
    questions.forEach((q) => {
      const selected = selectedOptions[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        total += 1;
      }
    });
    setScore(total);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOptions({});
    setSubmitted(false);
    setScore(null);
    setCurrentIdx(0);
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <HelpCircle className="h-7 w-7 text-purple-400" />
                Competency Assessment Center
              </h1>
              {isAIGenerated && (
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5" /> Agentic AI (NVIDIA)
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Verify your technical and statistical proficiency through adaptive multiple-choice evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-400 font-semibold px-3 py-1">
              Question {currentIdx + 1} of {questions.length}
            </Badge>
          </div>
        </div>

        {/* Quiz Runner Box */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                {question.competencyName}
              </Badge>
              <span className="text-xs text-slate-400">Difficulty: Level {question.difficulty}</span>
            </div>
            {submitted && (
              <Badge className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                Completed
              </Badge>
            )}
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
              {question.questionText}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt) => {
              const isSelected = selectedOptions[question.id] === opt.id;
              let btnClass = "border-slate-800 bg-slate-950/80 text-slate-200 hover:bg-slate-800";

              if (isSelected) {
                btnClass = "border-purple-500 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500";
              }

              if (submitted) {
                if (opt.isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500 font-semibold";
                } else if (isSelected && !opt.isCorrect) {
                  btnClass = "border-rose-500 bg-rose-500/20 text-rose-300 ring-1 ring-rose-500";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(question.id, opt.id)}
                  disabled={submitted}
                  className={`w-full p-4 rounded-xl text-left border text-sm transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt.optionText}</span>
                  {submitted && opt.isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  )}
                  {submitted && isSelected && !opt.isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner when Submitted */}
          {submitted && (
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-1">
              <p className="font-bold flex items-center gap-1 text-purple-400">
                <Sparkles className="h-4 w-4" /> Explanation:
              </p>
              <p>{question.explanation}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              className="border-slate-800 text-slate-300 text-xs"
            >
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {currentIdx < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Next Question
                </Button>
              ) : (
                !submitted && (
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-6"
                  >
                    Submit Assessment
                  </Button>
                )
              )}

              {submitted && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-slate-700 text-slate-200 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retake Quiz
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Score Summary Modal/Banner */}
        {score !== null && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 text-center space-y-2">
            <Award className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Assessment Complete!</h3>
            <p className="text-sm text-emerald-300 font-semibold">
              You scored {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
