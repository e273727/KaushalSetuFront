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
    title: "Python for Statistical Data Analysis in Governance",
    description: "Hands-on Pandas & NumPy computing tailored for public sector census and survey data.",
    provider: "iGOT Karmayogi",
    source: "igot",
    level: 3,
    durationMinutes: 180,
    courseUrl: "https://igotkarmayogi.gov.in/courses/python",
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
    title: "Applied AI & Machine Learning for Public Policy",
    description: "Machine learning applications, predictive modelling, and NLP in governance.",
    provider: "iGOT Karmayogi",
    source: "igot",
    level: 3,
    durationMinutes: 300,
    courseUrl: "https://igotkarmayogi.gov.in/courses/ai-policy",
    competencies: ["AI & Machine Learning"],
  },
];

export const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    competencyName: "Sampling Techniques",
    questionText: "Which sampling design is best suited when sub-populations differ substantially in size and variance?",
    difficulty: 3,
    explanation: "Stratified Random Sampling divides the population into homogeneous strata, ensuring accurate variance estimates across distinct groups.",
    options: [
      { id: "o1", optionText: "Simple Random Sampling", isCorrect: false },
      { id: "o2", optionText: "Stratified Random Sampling", isCorrect: true },
      { id: "o3", optionText: "Convenience Sampling", isCorrect: false },
      { id: "o4", optionText: "Quota Sampling", isCorrect: false },
    ],
  },
  {
    id: "q2",
    competencyName: "Python for Statistics",
    questionText: "Which Pandas function converts non-numeric dirty survey responses into NaN values for clean calculation?",
    difficulty: 2,
    explanation: "pd.to_numeric(df['col'], errors='coerce') converts invalid entries into NaN so they don't break statistical functions.",
    options: [
      { id: "o5", optionText: "pd.to_numeric(..., errors='coerce')", isCorrect: true },
      { id: "o6", optionText: "df.clean_numeric()", isCorrect: false },
      { id: "o7", optionText: "df.dropna()", isCorrect: false },
      { id: "o8", optionText: "pd.cast_float()", isCorrect: false },
    ],
  },
  {
    id: "q3",
    competencyName: "Data Quality & Audit",
    questionText: "What is the primary objective of calculating Mahalanobis Distance in multi-variable statistical auditing?",
    difficulty: 4,
    explanation: "Mahalanobis distance measures multi-dimensional distance from a centroid, detecting multivariate statistical outliers.",
    options: [
      { id: "o9", optionText: "Calculating simple mean values", isCorrect: false },
      { id: "o10", optionText: "Multivariate outlier detection accounting for correlations", isCorrect: true },
      { id: "o11", optionText: "Estimating sample response rate", isCorrect: false },
      { id: "o12", optionText: "Sorting database tables", isCorrect: false },
    ],
  },
  {
    id: "q4",
    competencyName: "SQL Querying",
    questionText: "Which SQL clause allows filtering aggregated groups after a GROUP BY statement?",
    difficulty: 2,
    explanation: "HAVING filters groups created by GROUP BY, while WHERE filters individual rows prior to grouping.",
    options: [
      { id: "o13", optionText: "WHERE", isCorrect: false },
      { id: "o14", optionText: "HAVING", isCorrect: true },
      { id: "o15", optionText: "FILTER BY", isCorrect: false },
      { id: "o16", optionText: "QUALIFY", isCorrect: false },
    ],
  },
];

// Role-Based Diagnostic Questions
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
