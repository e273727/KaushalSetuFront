// API Client & Rich Fallback Data Engine for KaushalSetu

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  department: string;
  currentJobRole: string;
  yearsOfExperience: number;
  highestQualification: string;
  fieldOfStudy: string;
  currentStreak: number;
}

export interface CompetencyItem {
  id: string;
  name: string;
  domain: "Statistical" | "Technical" | "Digital Governance" | "Behavioural";
  requiredLevel: number;
  currentLevel: number;
  gap: number;
  currentScore: number;
  description?: string;
}

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  provider: string;
  source: string;
  level: number;
  durationMinutes: number;
  courseUrl: string;
  competencies: string[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  difficulty: number;
  explanation: string;
  competencyName: string;
  domain?: string;
  options: { id: string; optionText: string; isCorrect: boolean }[];
}

// Fallback Mock Datasets
export const MOCK_PROFILE: UserProfile = {
  id: "user-123",
  fullName: "Rohit Sharma",
  email: "officer@kaushalsetu.gov.in",
  department: "National Sample Survey Office (NSSO)",
  currentJobRole: "Statistical Officer",
  yearsOfExperience: 6.5,
  highestQualification: "M.Sc. Statistics",
  fieldOfStudy: "Mathematical Statistics",
  currentStreak: 3,
};

export const MOCK_COMPETENCIES: CompetencyItem[] = [
  { id: "c1", name: "Survey Design", domain: "Statistical", requiredLevel: 5, currentLevel: 4, gap: 1, currentScore: 80, description: "National survey instruments and metadata standards" },
  { id: "c2", name: "Sampling Techniques", domain: "Statistical", requiredLevel: 5, currentLevel: 3, gap: 2, currentScore: 62.5, description: "Probability sampling, stratification, and weighting" },
  { id: "c3", name: "Data Quality & Audit", domain: "Statistical", requiredLevel: 4, currentLevel: 3, gap: 1, currentScore: 65, description: "Outlier detection and dataset verification" },
  { id: "c4", name: "Python for Statistics", domain: "Technical", requiredLevel: 4, currentLevel: 2, gap: 2, currentScore: 45, description: "Pandas, NumPy, and statistical computing" },
  { id: "c5", name: "SQL Querying", domain: "Technical", requiredLevel: 4, currentLevel: 2, gap: 2, currentScore: 40, description: "Relational database joins and transformations" },
  { id: "c6", name: "Data Visualization", domain: "Technical", requiredLevel: 3, currentLevel: 1, gap: 2, currentScore: 25, description: "Dashboards, charts, and spatial maps" },
  { id: "c7", name: "AI & Machine Learning", domain: "Technical", requiredLevel: 3, currentLevel: 1, gap: 2, currentScore: 20, description: "Predictive analytics for policy" },
  { id: "c8", name: "Digital Governance", domain: "Digital Governance", requiredLevel: 3, currentLevel: 2, gap: 1, currentScore: 50, description: "Data privacy and IT security compliance" },
];

export function getUserGapCompetencies(user: any): CompetencyItem[] {
  if (typeof window === "undefined") return MOCK_COMPETENCIES;

  const cleanEmail = (user?.email || "").toLowerCase().trim();
  const savedMatrix =
    (user?.id && localStorage.getItem(`kaushalsetu_gap_matrix_${user.id}`)) ||
    (cleanEmail && localStorage.getItem(`kaushalsetu_gap_matrix_${cleanEmail}`)) ||
    localStorage.getItem("kaushalsetu_gap_matrix_global");

  if (savedMatrix) {
    try {
      const parsed = JSON.parse(savedMatrix);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, index: number) => ({
          id: `comp-${index + 1}`,
          name: item.name,
          domain: item.name.includes("Python") || item.name.includes("SQL") || item.name.includes("Viz") ? "Technical" : "Statistical",
          currentLevel: item.testVerifiedLevel || item.selfLevel || 2,
          requiredLevel: item.reqLevel || 4,
          gap: item.gap !== undefined ? item.gap : Math.max(0, (item.reqLevel || 4) - (item.testVerifiedLevel || 2)),
          currentScore: Math.round(((item.testVerifiedLevel || item.selfLevel || 2) / (item.reqLevel || 5)) * 100),
          description: `Test-verified baseline score from onboarding diagnostic assessment.`,
        }));
      }
    } catch { }
  }
  return MOCK_COMPETENCIES;
}

export function getUserStreak(user?: any): number {
  if (typeof window === "undefined") return 1;
  if (!user || (!user.id && !user.email)) {
    const anonStreak = localStorage.getItem("kaushalsetu_streak_anon");
    return anonStreak ? parseInt(anonStreak) || 1 : 1;
  }
  const cleanEmail = (user?.email || "").toLowerCase().trim();
  const savedStreak =
    (user?.id && localStorage.getItem(`kaushalsetu_streak_${user.id}`)) ||
    (cleanEmail && localStorage.getItem(`kaushalsetu_streak_${cleanEmail}`));

  return savedStreak ? parseInt(savedStreak) || 1 : 1;
}

export function setUserStreak(user: any, streak: number): void {
  if (typeof window === "undefined") return;
  if (!user || (!user.id && !user.email)) {
    localStorage.setItem("kaushalsetu_streak_anon", streak.toString());
  } else {
    const cleanEmail = (user?.email || "").toLowerCase().trim();
    if (user?.id) localStorage.setItem(`kaushalsetu_streak_${user.id}`, streak.toString());
    if (cleanEmail) localStorage.setItem(`kaushalsetu_streak_${cleanEmail}`, streak.toString());
  }
  window.dispatchEvent(new Event("kaushalsetu_streak_updated"));
}

export function getDisplayName(user?: any): string {
  if (!user) return "Statistical Officer";
  if (user.fullName && user.fullName.trim().length > 0 && user.fullName !== "Rohit Sharma") return user.fullName;
  if (user.profile?.fullName && user.profile.fullName.trim().length > 0 && user.profile.fullName !== "Rohit Sharma") return user.profile.fullName;

  // Check saved profile in local storage
  if (typeof window !== "undefined") {
    const cleanEmail = (user.email || "").toLowerCase().trim();
    const saved =
      (user.id && localStorage.getItem(`kaushalsetu_profile_${user.id}`)) ||
      (cleanEmail && localStorage.getItem(`kaushalsetu_profile_${cleanEmail}`)) ||
      localStorage.getItem("kaushalsetu_profile_global");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fullName && parsed.fullName.trim().length > 0) return parsed.fullName;
      } catch { }
    }
  }

  if (user.email) {
    const prefix = user.email.split("@")[0];
    const formatted = prefix
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
    return formatted || "Government Officer";
  }
  return "Statistical Officer";
}

export const MOCK_COURSES: CourseItem[] = [
  {
    id: "course-1",
    title: "Advanced Sampling Techniques for National Surveys",
    description: "Stratified random sampling, cluster sampling, and weight calibration models for large sample sets.",
    provider: "NSSTA TPAC",
    source: "nssta",
    level: 4,
    durationMinutes: 240,
    courseUrl: "https://nssta.gov.in/courses/sampling",
    competencies: ["Sampling Techniques", "Survey Design"],
  },
  {
    id: "course-2",
    title: "Python for Data Analysis in Public Sector",
    description: "Hands-on Pandas & NumPy computing tailored for public sector census and survey data.",
    provider: "iGOT Karmayogi",
    source: "igot",
    level: 3,
    durationMinutes: 180,
    courseUrl: "https://portal.igotkarmayogi.gov.in/public/toc/do_1137349858229288961285/overview",
    competencies: ["Python for Statistics", "Data Visualization"],
  },
  {
    id: "course-3",
    title: "Statistical Data Quality Audit & Cleaning Pipelines",
    description: "Frameworks for automated anomaly detection, missing value imputation, and validation.",
    provider: "NSSTA TPAC",
    source: "nssta",
    level: 4,
    durationMinutes: 150,
    courseUrl: "https://nssta.gov.in/courses/quality",
    competencies: ["Data Quality & Audit"],
  },
  {
    id: "course-4",
    title: "SQL Fundamentals for Government Data Systems",
    description: "Relational query optimization, CTEs, and aggregation for official statistics.",
    provider: "iGOT Karmayogi",
    source: "igot",
    level: 2,
    durationMinutes: 120,
    courseUrl: "https://igotkarmayogi.gov.in/courses/sql",
    competencies: ["SQL Querying"],
  },
  {
    id: "course-5",
    title: "AI Using Google Bard and ChatGPT for Beginners",
    description: "Machine learning applications, predictive modelling, and NLP in governance.",
    provider: "iGOT Karmayogi",
    source: "igot",
    level: 3,
    durationMinutes: 300,
    courseUrl: "https://portal.igotkarmayogi.gov.in/public/toc/do_113923174474121216195/overview",
    competencies: ["Google Bard & ChatGPT"],
  },
];

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export { MASTER_QUESTION_BANK } from "./questionBank";
import { MASTER_QUESTION_BANK, SKILL_QUESTION_BANK as MASTER_SKILL_QUESTION_BANK } from "./questionBank";

export const ASSESSMENT_MCQ_BANK: QuizQuestion[] = MASTER_QUESTION_BANK;
export const MOCK_QUESTIONS: QuizQuestion[] = MASTER_QUESTION_BANK;
export const SKILL_QUESTION_BANK: Record<string, QuizQuestion[]> = MASTER_SKILL_QUESTION_BANK;

// Role-Based Core Question Collections
export const ROLE_DIAGNOSTIC_QUESTIONS: Record<string, QuizQuestion[]> = {
  "Statistical Officer": [
    {
      id: "so-1",
      competencyName: "Sampling Techniques",
      questionText: "In national household surveys, what is the primary benefit of applying sample weights to sample unit observations?",
      difficulty: 4,
      explanation: "Sample weights expand sample observations so that survey estimators accurately reflect the target national population distribution.",
      options: [
        { id: "so-o1", optionText: "To inflate sample size artificially", isCorrect: false },
        { id: "so-o2", optionText: "To compensate for unequal selection probabilities and non-response", isCorrect: true },
        { id: "so-o3", optionText: "To remove non-numeric character strings", isCorrect: false },
        { id: "so-o4", optionText: "To encrypt respondent identifiers", isCorrect: false },
      ],
    },
    {
      id: "so-2",
      competencyName: "Survey Design",
      questionText: "Which questionnaire design principle minimizes respondent cognitive burden during field enumeration?",
      difficulty: 3,
      explanation: "Using standardized skip-patterns and pre-coded categorical options reduces enumeration error and cognitive load.",
      options: [
        { id: "so-o5", optionText: "Using open-ended essays exclusively", isCorrect: false },
        { id: "so-o6", optionText: "Structured skip-logic with validated categorical options", isCorrect: true },
        { id: "so-o7", optionText: "Randomizing question sequence for each respondent", isCorrect: false },
        { id: "so-o8", optionText: "Omitting instructions for field enumerators", isCorrect: false },
      ],
    },
    {
      id: "so-3",
      competencyName: "Data Quality & Audit",
      questionText: "What validation step should occur immediately following CAPI (Computer Assisted Personal Interviewing) data ingestion?",
      difficulty: 3,
      explanation: "Automated range checks and consistency audits verify that responses adhere to pre-defined physical and logical boundaries.",
      options: [
        { id: "so-o9", optionText: "Logical consistency and range validation audits", isCorrect: true },
        { id: "so-o10", optionText: "Deleting half the records randomly", isCorrect: false },
        { id: "so-o11", optionText: "Disabling primary key indexes", isCorrect: false },
        { id: "so-o12", optionText: "Publishing raw unedited microdata", isCorrect: false },
      ],
    },
    {
      id: "so-4",
      competencyName: "Sampling Techniques",
      questionText: "Which sampling variance estimation technique handles non-linear statistics in complex multi-stage designs?",
      difficulty: 4,
      explanation: "Jackknife repeated replication or Linearization estimates variance in complex multi-stage surveys.",
      options: [
        { id: "so-o13", optionText: "Jackknife / Taylor Series Linearization", isCorrect: true },
        { id: "so-o14", optionText: "Simple Variance Formula", isCorrect: false },
        { id: "so-o15", optionText: "Standard Deviation of Population", isCorrect: false },
        { id: "so-o16", optionText: "Mode Calculation", isCorrect: false },
      ],
    },
  ],
  "Data Analyst": [
    {
      id: "da-1",
      competencyName: "Python for Statistics",
      questionText: "Which Pandas function is optimized for aggregating high-volume time-series survey data by monthly intervals?",
      difficulty: 3,
      explanation: "resample('M') or groupby(pd.Grouper(freq='M')) aggregates time-series data cleanly by month.",
      options: [
        { id: "da-o1", optionText: "df.resample('M').mean()", isCorrect: true },
        { id: "da-o2", optionText: "df.split_month()", isCorrect: false },
        { id: "da-o3", optionText: "df.loop_dates()", isCorrect: false },
        { id: "da-o4", optionText: "pd.monthly_filter()", isCorrect: false },
      ],
    },
    {
      id: "da-2",
      competencyName: "SQL Querying",
      questionText: "Which SQL window function assigns a rank to each row within a partition without gaps in ranking values?",
      difficulty: 4,
      explanation: "DENSE_RANK() ranks items within a partition without leaving gaps for tie scores, unlike RANK().",
      options: [
        { id: "da-o5", optionText: "ROW_NUMBER()", isCorrect: false },
        { id: "da-o6", optionText: "RANK()", isCorrect: false },
        { id: "da-o7", optionText: "DENSE_RANK()", isCorrect: true },
        { id: "da-o8", optionText: "COUNT()", isCorrect: false },
      ],
    },
    {
      id: "da-3",
      competencyName: "Data Visualization",
      questionText: "Which chart type is most appropriate for displaying the distribution of continuous expenditure data across districts?",
      difficulty: 2,
      explanation: "Boxplots or Violin plots display median, interquartile range (IQR), and outliers across categories effectively.",
      options: [
        { id: "da-o9", optionText: "Pie Chart", isCorrect: false },
        { id: "da-o10", optionText: "Boxplot / Distribution Plot", isCorrect: true },
        { id: "da-o11", optionText: "Donut Chart", isCorrect: false },
        { id: "da-o12", optionText: "3D Bar Graph", isCorrect: false },
      ],
    },
    {
      id: "da-4",
      competencyName: "Data Quality & Audit",
      questionText: "When dealing with missing survey data, under what condition is Multiple Imputation (MI) preferred over mean imputation?",
      difficulty: 4,
      explanation: "Multiple Imputation accounts for uncertainty in missing values, avoiding artificial underestimation of standard errors.",
      options: [
        { id: "da-o13", optionText: "When data is Missing Completely at Random (MCAR) or MAR to preserve variance", isCorrect: true },
        { id: "da-o14", optionText: "Only when sample size is under 10", isCorrect: false },
        { id: "da-o15", optionText: "To replace all valid non-zero numbers", isCorrect: false },
        { id: "da-o16", optionText: "When no statistical software is available", isCorrect: false },
      ],
    },
  ],
  "Survey Officer": [
    {
      id: "sv-1",
      competencyName: "Field Operations",
      questionText: "In multi-stage cluster sampling, what is chosen as the Primary Sampling Unit (PSU) in rural national surveys?",
      difficulty: 3,
      explanation: "Census Villages or Enumeration Blocks serve as the Primary Sampling Units (PSUs) in national rural sampling frames.",
      options: [
        { id: "sv-o1", optionText: "Individual Households directly", isCorrect: false },
        { id: "sv-o2", optionText: "Census Villages or Urban Frame Survey Blocks", isCorrect: true },
        { id: "sv-o3", optionText: "National Capital Region", isCorrect: false },
        { id: "sv-o4", optionText: "Commercial Enterprise Register", isCorrect: false },
      ],
    },
    {
      id: "sv-2",
      competencyName: "Data Quality & Audit",
      questionText: "How do field supervisors verify the authenticity of field enumeration data collected via CAPI tablets?",
      difficulty: 4,
      explanation: "GPS geo-tagging, audio-audit sampling, and revisit verification checks ensure high data fidelity.",
      options: [
        { id: "sv-o5", optionText: "Geo-tag timestamps and back-check sample revisits", isCorrect: true },
        { id: "sv-o6", optionText: "Estimating mean values manually", isCorrect: false },
        { id: "sv-o7", optionText: "Discarding survey tablets post-survey", isCorrect: false },
        { id: "sv-o8", optionText: "Accepting all unverified submissions", isCorrect: false },
      ],
    },
  ],
  "Data Processing Officer": [
    {
      id: "dp-1",
      competencyName: "SQL & Database Querying",
      questionText: "What type of database index significantly speeds up range queries on numeric survey dates without table scanning?",
      difficulty: 4,
      explanation: "B-Tree indexes optimize range searches (<, >, BETWEEN) on numeric and timestamp columns.",
      options: [
        { id: "dp-o1", optionText: "B-Tree Index", isCorrect: true },
        { id: "dp-o2", optionText: "Full-text Index", isCorrect: false },
        { id: "dp-o3", optionText: "Hash Index only", isCorrect: false },
        { id: "dp-o4", optionText: "No Indexing", isCorrect: false },
      ],
    },
    {
      id: "dp-2",
      competencyName: "Digital Governance",
      questionText: "What security protocol must be applied before releasing public research microdata files containing personal IDs?",
      difficulty: 4,
      explanation: "Anonymization and Statistical Disclosure Control (SDC) remove or mask direct and indirect identifiers.",
      options: [
        { id: "dp-o5", optionText: "Statistical Disclosure Control & Anonymization", isCorrect: true },
        { id: "dp-o6", optionText: "Publishing raw Aadhaar numbers", isCorrect: false },
        { id: "dp-o7", optionText: "Compressing into ZIP files without encryption", isCorrect: false },
        { id: "dp-o8", optionText: "Sorting data alphabetically", isCorrect: false },
      ],
    },
  ],
};

/**
 * Dynamically generates 10 to 20 questions based on user status, target course, required prerequisites, target role, education, skills, and goals.
 */
export function generateDynamicDiagnosticQuiz(inputs: {
  targetRole?: string;
  selectedCourseId?: string;
  selectedCourseTitle?: string;
  selectedSkills?: string[];
  highestQualification?: string;
  learningGoal?: string;
}): QuizQuestion[] {
  const targetRole = inputs.targetRole || "Statistical Officer";
  const selectedSkills = inputs.selectedSkills || ["Python", "SQL", "Statistics", "Data Analysis"];

  const questions: QuizQuestion[] = [];
  const seenIds = new Set<string>();

  const addUniqueQuestions = (sourceList: QuizQuestion[]) => {
    sourceList.forEach((q) => {
      if (!seenIds.has(q.id)) {
        seenIds.add(q.id);
        questions.push(q);
      }
    });
  };

  // 1. Course-Specific & Prerequisite Questions (Highest Priority)
  const targetCourse = MOCK_COURSES.find(
    (c) => c.id === inputs.selectedCourseId || c.title === inputs.selectedCourseTitle
  );

  if (targetCourse) {
    const courseCompetencies = targetCourse.competencies || [];
    const courseQuestions = MASTER_QUESTION_BANK.filter((q) =>
      courseCompetencies.some(
        (comp) =>
          q.competencyName.toLowerCase().includes(comp.toLowerCase()) ||
          (q.domain && q.domain.toLowerCase().includes(comp.toLowerCase()))
      )
    );
    addUniqueQuestions(courseQuestions);
  }

  // 2. Role-based questions
  const roleQuestions = ROLE_DIAGNOSTIC_QUESTIONS[targetRole] || ROLE_DIAGNOSTIC_QUESTIONS["Statistical Officer"];
  addUniqueQuestions(roleQuestions);

  // 3. Selected Skill-based questions
  selectedSkills.forEach((skill) => {
    const skillQuestions = SKILL_QUESTION_BANK[skill];
    if (skillQuestions) {
      addUniqueQuestions(skillQuestions);
    }
  });

  // 4. Fallback filler questions from MOCK_QUESTIONS to reach target 12–15 questions
  addUniqueQuestions(MOCK_QUESTIONS);

  // Add additional generic competency questions if count is still below 10
  if (questions.length < 10) {
    const filler: QuizQuestion[] = [
      {
        id: "fill-1",
        competencyName: "Digital Governance",
        questionText: "Under India's Digital Personal Data Protection (DPDP) standards, what condition permits processing citizen survey data?",
        difficulty: 3,
        explanation: "Free, specific, informed, and unambiguous consent or specified lawful public interest uses.",
        options: [
          { id: "fill-o1", optionText: "Uninformed automatic scraping", isCorrect: false },
          { id: "fill-o2", optionText: "Informed consent or legitimate public interest mandate", isCorrect: true },
          { id: "fill-o3", optionText: "Third-party commercial resale without notice", isCorrect: false },
          { id: "fill-o4", optionText: "Indefinite storage without security controls", isCorrect: false },
        ],
      },
      {
        id: "fill-2",
        competencyName: "Data Analysis",
        questionText: "What is the primary indicator of multicollinearity in a multiple linear regression model?",
        difficulty: 4,
        explanation: "Variance Inflation Factor (VIF) > 5 or 10 signals high multicollinearity among predictors.",
        options: [
          { id: "fill-o5", optionText: "High Variance Inflation Factor (VIF)", isCorrect: true },
          { id: "fill-o6", optionText: "Zero p-value", isCorrect: false },
          { id: "fill-o7", optionText: "Negative R-Squared", isCorrect: false },
          { id: "fill-o8", optionText: "High Sample Mean", isCorrect: false },
        ],
      },
      {
        id: "fill-3",
        competencyName: "Survey Design",
        questionText: "In pilot survey pre-testing, what is the primary goal of cognitive interviewing?",
        difficulty: 3,
        explanation: "To understand how respondents interpret question wording and retrieve information.",
        options: [
          { id: "fill-o9", optionText: "To assess respondent comprehension and question clarity", isCorrect: true },
          { id: "fill-o10", optionText: "To grade enumerator speed", isCorrect: false },
          { id: "fill-o11", optionText: "To skip fieldwork completely", isCorrect: false },
          { id: "fill-o12", optionText: "To calculate total budget", isCorrect: false },
        ],
      },
      {
        id: "fill-4",
        competencyName: "Python for Statistics",
        questionText: "Which Python visualization library is built on top of Matplotlib and integrates tightly with Pandas DataFrames?",
        difficulty: 2,
        explanation: "Seaborn provides a high-level interface for drawing attractive statistical graphics on DataFrames.",
        options: [
          { id: "fill-o13", optionText: "Seaborn", isCorrect: true },
          { id: "fill-o14", optionText: "PyGame", isCorrect: false },
          { id: "fill-o15", optionText: "Flask", isCorrect: false },
          { id: "fill-o16", optionText: "Django", isCorrect: false },
        ],
      },
      {
        id: "fill-5",
        competencyName: "SQL Querying",
        questionText: "Which SQL operator searches for a specified pattern in a column using wildcards like '%' or '_'?",
        difficulty: 2,
        explanation: "LIKE operator matches text patterns using wildcards.",
        options: [
          { id: "fill-o17", optionText: "IN", isCorrect: false },
          { id: "fill-o18", optionText: "LIKE", isCorrect: true },
          { id: "fill-o19", optionText: "EXISTS", isCorrect: false },
          { id: "fill-o20", optionText: "BETWEEN", isCorrect: false },
        ],
      },
    ];
    addUniqueQuestions(filler);
  }

  // Cap generated questions between 10 and 20 (Targeting ~12-15 questions)
  return questions.slice(0, 15);
}

// Helper to safely fetch from backend or fallback to mock
export async function fetchApi<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn(`[KaushalSetu API] Endpoint ${endpoint} fallback:`, err);
    return fallbackData;
  }
}

export async function postAgentDocumentChat(params: {
  query: string;
  docNames: string[];
  textContexts: string[];
}): Promise<any> {
  const token = localStorage.getItem("kaushalsetu_token") || localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/documents/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn("[KaushalSetu RAG API] /documents/chat error:", err);
    throw err;
  }
}
