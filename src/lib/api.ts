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
    } catch {}
  }
  return MOCK_COMPETENCIES;
}

export function getUserStreak(user?: any): number {
  if (typeof window === "undefined") return 12;
  const cleanEmail = (user?.email || "").toLowerCase().trim();
  const savedStreak =
    (user?.id && localStorage.getItem(`kaushalsetu_streak_${user.id}`)) ||
    (cleanEmail && localStorage.getItem(`kaushalsetu_streak_${cleanEmail}`)) ||
    localStorage.getItem("kaushalsetu_streak_global");

  return savedStreak ? parseInt(savedStreak) || 12 : 12;
}

export function setUserStreak(user: any, streak: number): void {
  if (typeof window === "undefined") return;
  const cleanEmail = (user?.email || "").toLowerCase().trim();
  if (user?.id) localStorage.setItem(`kaushalsetu_streak_${user.id}`, streak.toString());
  if (cleanEmail) localStorage.setItem(`kaushalsetu_streak_${cleanEmail}`, streak.toString());
  localStorage.setItem("kaushalsetu_streak_global", streak.toString());
  window.dispatchEvent(new Event("kaushalsetu_streak_updated"));
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

// Comprehensive Role and Skill Question Library for Dynamic Quiz Generation
export const SKILL_QUESTION_BANK: Record<string, QuizQuestion[]> = {
  Python: [
    {
      id: "py-1",
      competencyName: "Python for Statistics",
      questionText: "Which Pandas function is optimized for aggregating high-volume time-series survey data by monthly intervals?",
      difficulty: 3,
      explanation: "resample('M') aggregates time-series data cleanly by monthly frequencies.",
      options: [
        { id: "py-o1", optionText: "df.resample('M').mean()", isCorrect: true },
        { id: "py-o2", optionText: "df.split_month()", isCorrect: false },
        { id: "py-o3", optionText: "df.loop_dates()", isCorrect: false },
        { id: "py-o4", optionText: "pd.monthly_filter()", isCorrect: false },
      ],
    },
    {
      id: "py-2",
      competencyName: "Python for Statistics",
      questionText: "In Python Scipy library, which function performs a two-sample Independent Student's t-test?",
      difficulty: 4,
      explanation: "scipy.stats.ttest_ind(sample1, sample2) calculates the T-test for two independent samples.",
      options: [
        { id: "py-o5", optionText: "scipy.stats.ttest_ind()", isCorrect: true },
        { id: "py-o6", optionText: "stats.chisquare()", isCorrect: false },
        { id: "py-o7", optionText: "numpy.corrcoef()", isCorrect: false },
        { id: "py-o8", optionText: "pd.t_test()", isCorrect: false },
      ],
    },
  ],
  SQL: [
    {
      id: "sql-1",
      competencyName: "SQL Querying",
      questionText: "Which SQL clause allows filtering aggregated groups after a GROUP BY statement?",
      difficulty: 2,
      explanation: "HAVING filters groups created by GROUP BY, whereas WHERE filters individual rows prior to grouping.",
      options: [
        { id: "sql-o1", optionText: "WHERE", isCorrect: false },
        { id: "sql-o2", optionText: "HAVING", isCorrect: true },
        { id: "sql-o3", optionText: "FILTER BY", isCorrect: false },
        { id: "sql-o4", optionText: "QUALIFY", isCorrect: false },
      ],
    },
    {
      id: "sql-2",
      competencyName: "SQL Querying",
      questionText: "Which SQL window function assigns a rank to each row within a partition without gaps in ranking values?",
      difficulty: 4,
      explanation: "DENSE_RANK() ranks items within a partition without leaving gaps for tie scores.",
      options: [
        { id: "sql-o5", optionText: "ROW_NUMBER()", isCorrect: false },
        { id: "sql-o6", optionText: "RANK()", isCorrect: false },
        { id: "sql-o7", optionText: "DENSE_RANK()", isCorrect: true },
        { id: "sql-o8", optionText: "COUNT()", isCorrect: false },
      ],
    },
  ],
  Statistics: [
    {
      id: "stat-1",
      competencyName: "Sampling Techniques",
      questionText: "In national household surveys, what is the primary benefit of applying sample weights to sample unit observations?",
      difficulty: 4,
      explanation: "Sample weights expand sample observations so that survey estimators accurately reflect the target national population distribution.",
      options: [
        { id: "stat-o1", optionText: "To inflate sample size artificially", isCorrect: false },
        { id: "stat-o2", optionText: "To compensate for unequal selection probabilities and non-response", isCorrect: true },
        { id: "stat-o3", optionText: "To remove non-numeric character strings", isCorrect: false },
        { id: "stat-o4", optionText: "To encrypt respondent identifiers", isCorrect: false },
      ],
    },
    {
      id: "stat-2",
      competencyName: "Sampling Techniques",
      questionText: "Which sampling design is best suited when sub-populations differ substantially in size and variance?",
      difficulty: 3,
      explanation: "Stratified Random Sampling divides the population into homogeneous strata, ensuring accurate variance estimates across distinct groups.",
      options: [
        { id: "stat-o5", optionText: "Simple Random Sampling", isCorrect: false },
        { id: "stat-o6", optionText: "Stratified Random Sampling", isCorrect: true },
        { id: "stat-o7", optionText: "Convenience Sampling", isCorrect: false },
        { id: "stat-o8", optionText: "Quota Sampling", isCorrect: false },
      ],
    },
  ],
  "Data Analysis": [
    {
      id: "da-1",
      competencyName: "Data Quality & Audit",
      questionText: "What is the primary objective of calculating Mahalanobis Distance in multi-variable statistical auditing?",
      difficulty: 4,
      explanation: "Mahalanobis distance measures multi-dimensional distance from a centroid, detecting multivariate statistical outliers.",
      options: [
        { id: "da-o1", optionText: "Calculating simple mean values", isCorrect: false },
        { id: "da-o2", optionText: "Multivariate outlier detection accounting for correlations", isCorrect: true },
        { id: "da-o3", optionText: "Estimating sample response rate", isCorrect: false },
        { id: "da-o4", optionText: "Sorting database tables", isCorrect: false },
      ],
    },
    {
      id: "da-2",
      competencyName: "Data Quality & Audit",
      questionText: "What validation step should occur immediately following CAPI (Computer Assisted Personal Interviewing) data ingestion?",
      difficulty: 3,
      explanation: "Automated range checks and consistency audits verify that responses adhere to pre-defined physical and logical boundaries.",
      options: [
        { id: "da-o5", optionText: "Logical consistency and range validation audits", isCorrect: true },
        { id: "da-o6", optionText: "Deleting half the records randomly", isCorrect: false },
        { id: "da-o7", optionText: "Disabling primary key indexes", isCorrect: false },
        { id: "da-o8", optionText: "Publishing raw unedited microdata", isCorrect: false },
      ],
    },
  ],
  "Data Visualization": [
    {
      id: "viz-1",
      competencyName: "Data Visualization",
      questionText: "Which chart type is most appropriate for displaying the distribution of continuous expenditure data across districts?",
      difficulty: 2,
      explanation: "Boxplots or Violin plots display median, interquartile range (IQR), and outliers across categories effectively.",
      options: [
        { id: "viz-o1", optionText: "Pie Chart", isCorrect: false },
        { id: "viz-o2", optionText: "Boxplot / Distribution Plot", isCorrect: true },
        { id: "viz-o3", optionText: "Donut Chart", isCorrect: false },
        { id: "viz-o4", optionText: "3D Bar Graph", isCorrect: false },
      ],
    },
    {
      id: "viz-2",
      competencyName: "Data Visualization",
      questionText: "When building an interactive dashboard for public policy executives, what is a fundamental UX design best practice?",
      difficulty: 3,
      explanation: "Placing high-level key performance indicators (KPIs) at the top followed by detailed drill-down filters maximizes clarity.",
      options: [
        { id: "viz-o5", optionText: "Using 20 distinct bright colors on a single grid", isCorrect: false },
        { id: "viz-o6", optionText: "Executive summary KPI metrics with progressive drill-down details", isCorrect: true },
        { id: "viz-o7", optionText: "Hiding numeric axis labels completely", isCorrect: false },
        { id: "viz-o8", optionText: "Rendering static non-interactive images", isCorrect: false },
      ],
    },
  ],
  "Machine Learning": [
    {
      id: "ml-1",
      competencyName: "AI & Machine Learning",
      questionText: "Which metric is most appropriate for evaluating a machine learning classifier on an imbalanced dataset where false negatives are costly?",
      difficulty: 4,
      explanation: "Recall (Sensitivity) measures the proportion of actual positives correctly identified.",
      options: [
        { id: "ml-o1", optionText: "Overall Accuracy", isCorrect: false },
        { id: "ml-o2", optionText: "Recall / Sensitivity", isCorrect: true },
        { id: "ml-o3", optionText: "R-Squared", isCorrect: false },
        { id: "ml-o4", optionText: "Mean Absolute Error", isCorrect: false },
      ],
    },
  ],
  "R": [
    {
      id: "r-1",
      competencyName: "R Programming",
      questionText: "In R tidyverse, which function is used to transform data from wide format to long format?",
      difficulty: 3,
      explanation: "pivot_longer() in tidyr reshapes wide data into long key-value format.",
      options: [
        { id: "r-o1", optionText: "pivot_longer()", isCorrect: true },
        { id: "r-o2", optionText: "spread()", isCorrect: false },
        { id: "r-o3", optionText: "group_by()", isCorrect: false },
        { id: "r-o4", optionText: "mutate()", isCorrect: false },
      ],
    },
  ],
  "Data Privacy": [
    {
      id: "dp-1",
      competencyName: "Digital Governance",
      questionText: "What security protocol must be applied before releasing public research microdata files containing personal IDs?",
      difficulty: 4,
      explanation: "Anonymization and Statistical Disclosure Control (SDC) remove or mask direct and indirect identifiers.",
      options: [
        { id: "dp-o1", optionText: "Statistical Disclosure Control & Anonymization", isCorrect: true },
        { id: "dp-o2", optionText: "Publishing raw Aadhaar numbers", isCorrect: false },
        { id: "dp-o3", optionText: "Compressing into ZIP files without encryption", isCorrect: false },
        { id: "dp-o4", optionText: "Sorting data alphabetically", isCorrect: false },
      ],
    },
  ],
  "Cloud Computing": [
    {
      id: "cc-1",
      competencyName: "Digital Governance",
      questionText: "Which architecture model ensures data sovereignty for sensitive public sector survey archives?",
      difficulty: 3,
      explanation: "Hybrid Cloud / On-Premise Sovereign Cloud ensures critical government archives remain within national boundaries.",
      options: [
        { id: "cc-o1", optionText: "Public Unencrypted Cloud", isCorrect: false },
        { id: "cc-o2", optionText: "Sovereign Government Hybrid Cloud Architecture", isCorrect: true },
        { id: "cc-o3", optionText: "Foreign Third-party File Hosting", isCorrect: false },
        { id: "cc-o4", optionText: "Peer-to-Peer torrent sharing", isCorrect: false },
      ],
    },
  ],
  "APIs": [
    {
      id: "api-1",
      competencyName: "Digital Governance",
      questionText: "Which HTTP status code signifies that an API client is unauthenticated and requires a valid JWT token?",
      difficulty: 2,
      explanation: "HTTP 401 Unauthorized indicates missing or invalid authentication credentials.",
      options: [
        { id: "api-o1", optionText: "200 OK", isCorrect: false },
        { id: "api-o2", optionText: "401 Unauthorized", isCorrect: true },
        { id: "api-o3", optionText: "404 Not Found", isCorrect: false },
        { id: "api-o4", optionText: "500 Internal Error", isCorrect: false },
      ],
    },
  ],
  "Excel": [
    {
      id: "ex-1",
      competencyName: "Data Quality & Audit",
      questionText: "Which Excel function calculates conditional sum totals based on multiple criteria criteria arrays?",
      difficulty: 2,
      explanation: "SUMIFS allows evaluating multiple conditions across range criteria.",
      options: [
        { id: "ex-o1", optionText: "SUMIF", isCorrect: false },
        { id: "ex-o2", optionText: "SUMIFS", isCorrect: true },
        { id: "ex-o3", optionText: "VLOOKUP", isCorrect: false },
        { id: "ex-o4", optionText: "COUNTA", isCorrect: false },
      ],
    },
  ],
  "GIS": [
    {
      id: "gis-1",
      competencyName: "Survey Design",
      questionText: "In spatial statistical auditing, what format is standard for vector geospatial boundary layers of administrative districts?",
      difficulty: 3,
      explanation: "GeoJSON / Shapefiles store vector geometries (polygons, lines, points) for district boundaries.",
      options: [
        { id: "gis-o1", optionText: "JPEG", isCorrect: false },
        { id: "gis-o2", optionText: "GeoJSON / Shapefile", isCorrect: true },
        { id: "gis-o3", optionText: "MP3", isCorrect: false },
        { id: "gis-o4", optionText: "DOCX", isCorrect: false },
      ],
    },
  ],
};

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
 * Dynamically generates 10 to 20 questions based on user status, target role, education, skills, and goals.
 */
export function generateDynamicDiagnosticQuiz(inputs: {
  targetRole?: string;
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

  // 1. Role-based questions
  const roleQuestions = ROLE_DIAGNOSTIC_QUESTIONS[targetRole] || ROLE_DIAGNOSTIC_QUESTIONS["Statistical Officer"];
  addUniqueQuestions(roleQuestions);

  // 2. Selected Skill-based questions
  selectedSkills.forEach((skill) => {
    const skillQuestions = SKILL_QUESTION_BANK[skill];
    if (skillQuestions) {
      addUniqueQuestions(skillQuestions);
    }
  });

  // 3. Fallback filler questions from MOCK_QUESTIONS to reach target 12–15 questions (within 10–20 range)
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
