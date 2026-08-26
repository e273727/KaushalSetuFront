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
      } catch {}
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

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const ASSESSMENT_MCQ_BANK: QuizQuestion[] = [
  // 1. Python
  {
    id: "pdf-q1",
    competencyName: "Python for Statistics",
    questionText: "Which data structure in Python stores key-value pairs?",
    difficulty: 1,
    explanation: "Dictionaries store key-value pairs in Python using key: value syntax.",
    options: [
      { id: "pdf-q1-o1", optionText: "List", isCorrect: false },
      { id: "pdf-q1-o2", optionText: "Tuple", isCorrect: false },
      { id: "pdf-q1-o3", optionText: "Dictionary", isCorrect: true },
      { id: "pdf-q1-o4", optionText: "Set", isCorrect: false },
    ],
  },
  {
    id: "pdf-q2",
    competencyName: "Python for Statistics",
    questionText: "What is the output of the following Python code?\nx = [1, 2, 3, 4]\nprint(x[-1])",
    difficulty: 1,
    explanation: "Negative indexing in Python accesses elements from the end of the list. -1 retrieves the last element (4).",
    options: [
      { id: "pdf-q2-o1", optionText: "1", isCorrect: false },
      { id: "pdf-q2-o2", optionText: "2", isCorrect: false },
      { id: "pdf-q2-o3", optionText: "3", isCorrect: false },
      { id: "pdf-q2-o4", optionText: "4", isCorrect: true },
    ],
  },
  {
    id: "pdf-q3",
    competencyName: "Python for Statistics",
    questionText: "Which library is primarily used for numerical computing in Python?",
    difficulty: 1,
    explanation: "NumPy (Numerical Python) provides multi-dimensional array support and high-level mathematical functions.",
    options: [
      { id: "pdf-q3-o1", optionText: "Flask", isCorrect: false },
      { id: "pdf-q3-o2", optionText: "NumPy", isCorrect: true },
      { id: "pdf-q3-o3", optionText: "BeautifulSoup", isCorrect: false },
      { id: "pdf-q3-o4", optionText: "Django", isCorrect: false },
    ],
  },
  {
    id: "pdf-q4",
    competencyName: "Python for Statistics",
    questionText: "Which Pandas function is commonly used to read a CSV file?",
    difficulty: 1,
    explanation: "pd.read_csv() parses a comma-separated values (CSV) file into a Pandas DataFrame.",
    options: [
      { id: "pdf-q4-o1", optionText: "pd.load_csv()", isCorrect: false },
      { id: "pdf-q4-o2", optionText: "pd.open_csv()", isCorrect: false },
      { id: "pdf-q4-o3", optionText: "pd.read_csv()", isCorrect: true },
      { id: "pdf-q4-o4", optionText: "pd.import_csv()", isCorrect: false },
    ],
  },

  // 2. Statistics & Probability
  {
    id: "pdf-q5",
    competencyName: "Sampling Techniques",
    questionText: "What does the mean represent?",
    difficulty: 1,
    explanation: "The arithmetic mean is calculated by summing all values and dividing by the total count.",
    options: [
      { id: "pdf-q5-o1", optionText: "The most frequently occurring value", isCorrect: false },
      { id: "pdf-q5-o2", optionText: "The middle value", isCorrect: false },
      { id: "pdf-q5-o3", optionText: "The arithmetic average", isCorrect: true },
      { id: "pdf-q5-o4", optionText: "The difference between maximum and minimum", isCorrect: false },
    ],
  },
  {
    id: "pdf-q6",
    competencyName: "Sampling Techniques",
    questionText: "Which measure is least affected by extreme outliers?",
    difficulty: 1,
    explanation: "The median is robust to outliers because it only depends on the middle position of ordered data.",
    options: [
      { id: "pdf-q6-o1", optionText: "Mean", isCorrect: false },
      { id: "pdf-q6-o2", optionText: "Median", isCorrect: true },
      { id: "pdf-q6-o3", optionText: "Variance", isCorrect: false },
      { id: "pdf-q6-o4", optionText: "Standard deviation", isCorrect: false },
    ],
  },
  {
    id: "pdf-q7",
    competencyName: "Sampling Techniques",
    questionText: "What does standard deviation measure?",
    difficulty: 2,
    explanation: "Standard deviation quantifies the amount of variation or dispersion of a set of data values.",
    options: [
      { id: "pdf-q7-o1", optionText: "Central tendency", isCorrect: false },
      { id: "pdf-q7-o2", optionText: "Data dispersion", isCorrect: true },
      { id: "pdf-q7-o3", optionText: "Correlation", isCorrect: false },
      { id: "pdf-q7-o4", optionText: "Probability", isCorrect: false },
    ],
  },
  {
    id: "pdf-q8",
    competencyName: "Sampling Techniques",
    questionText: "If the probability of an event is 0.8, what is the probability that the event does NOT occur?",
    difficulty: 1,
    explanation: "The probability of the complement of an event A is P(A') = 1 - P(A) = 1 - 0.8 = 0.2.",
    options: [
      { id: "pdf-q8-o1", optionText: "0.1", isCorrect: false },
      { id: "pdf-q8-o2", optionText: "0.2", isCorrect: true },
      { id: "pdf-q8-o3", optionText: "0.8", isCorrect: false },
      { id: "pdf-q8-o4", optionText: "1.8", isCorrect: false },
    ],
  },
  {
    id: "pdf-q9",
    competencyName: "Sampling Techniques",
    questionText: "A p-value less than 0.05 is commonly interpreted as:",
    difficulty: 2,
    explanation: "A p-value below the threshold (alpha = 0.05) indicates strong evidence to reject the null hypothesis.",
    options: [
      { id: "pdf-q9-o1", optionText: "Strong evidence against the null hypothesis", isCorrect: true },
      { id: "pdf-q9-o2", optionText: "Proof that the null hypothesis is true", isCorrect: false },
      { id: "pdf-q9-o3", optionText: "The model has 95% accuracy", isCorrect: false },
      { id: "pdf-q9-o4", optionText: "The dataset contains no errors", isCorrect: false },
    ],
  },

  // 3. SQL & Databases
  {
    id: "pdf-q10",
    competencyName: "SQL Querying",
    questionText: "Which SQL command is used to retrieve data from a table?",
    difficulty: 1,
    explanation: "SELECT is used to query and fetch records from relational database tables.",
    options: [
      { id: "pdf-q10-o1", optionText: "GET", isCorrect: false },
      { id: "pdf-q10-o2", optionText: "FETCH", isCorrect: false },
      { id: "pdf-q10-o3", optionText: "SELECT", isCorrect: true },
      { id: "pdf-q10-o4", optionText: "RETRIEVE", isCorrect: false },
    ],
  },
  {
    id: "pdf-q11",
    competencyName: "SQL Querying",
    questionText: "Which SQL clause is used to filter rows?",
    difficulty: 1,
    explanation: "WHERE filters rows based on specified condition criteria prior to grouping.",
    options: [
      { id: "pdf-q11-o1", optionText: "ORDER BY", isCorrect: false },
      { id: "pdf-q11-o2", optionText: "WHERE", isCorrect: true },
      { id: "pdf-q11-o3", optionText: "GROUP BY", isCorrect: false },
      { id: "pdf-q11-o4", optionText: "HAVING", isCorrect: false },
    ],
  },
  {
    id: "pdf-q12",
    competencyName: "SQL Querying",
    questionText: "What is the purpose of a JOIN in SQL?",
    difficulty: 1,
    explanation: "JOINs combine rows from two or more tables based on a related column between them.",
    options: [
      { id: "pdf-q12-o1", optionText: "Delete duplicate records", isCorrect: false },
      { id: "pdf-q12-o2", optionText: "Combine data from multiple tables", isCorrect: true },
      { id: "pdf-q12-o3", optionText: "Sort a table", isCorrect: false },
      { id: "pdf-q12-o4", optionText: "Create a database", isCorrect: false },
    ],
  },
  {
    id: "pdf-q13",
    competencyName: "SQL Querying",
    questionText: "Which SQL function calculates the average of a column?",
    difficulty: 1,
    explanation: "AVG() returns the numerical average of values in a specified column.",
    options: [
      { id: "pdf-q13-o1", optionText: "MEAN()", isCorrect: false },
      { id: "pdf-q13-o2", optionText: "AVG()", isCorrect: true },
      { id: "pdf-q13-o3", optionText: "AVERAGE()", isCorrect: false },
      { id: "pdf-q13-o4", optionText: "MIDDLE()", isCorrect: false },
    ],
  },

  // 4. Data Preprocessing
  {
    id: "pdf-q14",
    competencyName: "Data Quality & Audit",
    questionText: "What is the primary purpose of feature scaling?",
    difficulty: 2,
    explanation: "Feature scaling (MinMax, StandardScaler) puts numeric features on equal footing so distance calculations aren't biased by large scales.",
    options: [
      { id: "pdf-q14-o1", optionText: "Remove duplicate rows", isCorrect: false },
      { id: "pdf-q14-o2", optionText: "Put features on comparable scales", isCorrect: true },
      { id: "pdf-q14-o3", optionText: "Increase dataset size", isCorrect: false },
      { id: "pdf-q14-o4", optionText: "Remove categorical variables", isCorrect: false },
    ],
  },
  {
    id: "pdf-q15",
    competencyName: "Data Quality & Audit",
    questionText: "Which technique can be used to handle missing numerical values?",
    difficulty: 1,
    explanation: "Mean imputation replaces missing numeric values with the column average.",
    options: [
      { id: "pdf-q15-o1", optionText: "Mean imputation", isCorrect: true },
      { id: "pdf-q15-o2", optionText: "Random deletion only", isCorrect: false },
      { id: "pdf-q15-o3", optionText: "One-hot encoding", isCorrect: false },
      { id: "pdf-q15-o4", optionText: "Tokenization", isCorrect: false },
    ],
  },
  {
    id: "pdf-q16",
    competencyName: "Data Quality & Audit",
    questionText: "What is one-hot encoding primarily used for?",
    difficulty: 1,
    explanation: "One-hot encoding transforms categorical string values into binary indicator columns (0s and 1s).",
    options: [
      { id: "pdf-q16-o1", optionText: "Scaling numerical data", isCorrect: false },
      { id: "pdf-q16-o2", optionText: "Encoding categorical variables", isCorrect: true },
      { id: "pdf-q16-o3", optionText: "Removing outliers", isCorrect: false },
      { id: "pdf-q16-o4", optionText: "Reducing dimensions", isCorrect: false },
    ],
  },
  {
    id: "pdf-q17",
    competencyName: "AI & Machine Learning",
    questionText: "What is data leakage?",
    difficulty: 3,
    explanation: "Data leakage occurs when information outside the training dataset is inadvertently used to create the model, leading to overly optimistic evaluation.",
    options: [
      { id: "pdf-q17-o1", optionText: "Losing data during file transfer", isCorrect: false },
      { id: "pdf-q17-o2", optionText: "Using information during training that would not be available at prediction time", isCorrect: true },
      { id: "pdf-q17-o3", optionText: "Having missing values", isCorrect: false },
      { id: "pdf-q17-o4", optionText: "Deleting test data", isCorrect: false },
    ],
  },

  // 5. Machine Learning
  {
    id: "pdf-q18",
    competencyName: "AI & Machine Learning",
    questionText: "Which of the following is a supervised learning algorithm?",
    difficulty: 1,
    explanation: "Linear Regression maps labeled input features to target values using supervised training.",
    options: [
      { id: "pdf-q18-o1", optionText: "K-Means", isCorrect: false },
      { id: "pdf-q18-o2", optionText: "PCA", isCorrect: false },
      { id: "pdf-q18-o3", optionText: "Linear Regression", isCorrect: true },
      { id: "pdf-q18-o4", optionText: "Apriori", isCorrect: false },
    ],
  },
  {
    id: "pdf-q19",
    competencyName: "AI & Machine Learning",
    questionText: "Which algorithm is commonly used for classification?",
    difficulty: 1,
    explanation: "Logistic Regression estimates target probabilities for categorical class assignment.",
    options: [
      { id: "pdf-q19-o1", optionText: "Logistic Regression", isCorrect: true },
      { id: "pdf-q19-o2", optionText: "K-Means", isCorrect: false },
      { id: "pdf-q19-o3", optionText: "PCA", isCorrect: false },
      { id: "pdf-q19-o4", optionText: "Apriori", isCorrect: false },
    ],
  },
  {
    id: "pdf-q20",
    competencyName: "AI & Machine Learning",
    questionText: "What is overfitting?",
    difficulty: 2,
    explanation: "Overfitting occurs when a model learns noise in training data, scoring high on train set but poorly on unseen test data.",
    options: [
      { id: "pdf-q20-o1", optionText: "A model performs poorly on both training and testing data", isCorrect: false },
      { id: "pdf-q20-o2", optionText: "A model performs very well on training data but poorly on unseen data", isCorrect: true },
      { id: "pdf-q20-o3", optionText: "A model has too few features", isCorrect: false },
      { id: "pdf-q20-o4", optionText: "A model has no parameters", isCorrect: false },
    ],
  },
  {
    id: "pdf-q21",
    competencyName: "AI & Machine Learning",
    questionText: "Which technique can help reduce overfitting?",
    difficulty: 2,
    explanation: "Regularization (L1 Lasso / L2 Ridge) penalizes complex weights, constraining overfitting.",
    options: [
      { id: "pdf-q21-o1", optionText: "Regularization", isCorrect: true },
      { id: "pdf-q21-o2", optionText: "Increasing noise", isCorrect: false },
      { id: "pdf-q21-o3", optionText: "Removing the test set", isCorrect: false },
      { id: "pdf-q21-o4", optionText: "Training indefinitely", isCorrect: false },
    ],
  },
  {
    id: "pdf-q22",
    competencyName: "AI & Machine Learning",
    questionText: "What is the purpose of a train-test split?",
    difficulty: 1,
    explanation: "Train-test split sets aside an independent evaluation set to measure generalization error on unseen data.",
    options: [
      { id: "pdf-q22-o1", optionText: "To increase the dataset size", isCorrect: false },
      { id: "pdf-q22-o2", optionText: "To evaluate model performance on unseen data", isCorrect: true },
      { id: "pdf-q22-o3", optionText: "To remove missing values", isCorrect: false },
      { id: "pdf-q22-o4", optionText: "To normalize features", isCorrect: false },
    ],
  },

  // 6. Machine Learning Algorithms
  {
    id: "pdf-q23",
    competencyName: "AI & Machine Learning",
    questionText: "Which algorithm creates a tree-like structure for making predictions?",
    difficulty: 1,
    explanation: "Decision Trees split data hierarchically based on feature values to arrive at decisions.",
    options: [
      { id: "pdf-q23-o1", optionText: "Decision Tree", isCorrect: true },
      { id: "pdf-q23-o2", optionText: "K-Means", isCorrect: false },
      { id: "pdf-q23-o3", optionText: "PCA", isCorrect: false },
      { id: "pdf-q23-o4", optionText: "Linear Regression", isCorrect: false },
    ],
  },
  {
    id: "pdf-q24",
    competencyName: "AI & Machine Learning",
    questionText: "Random Forest is primarily a:",
    difficulty: 2,
    explanation: "Random Forest builds an ensemble collection of decorrelated decision trees using bagging.",
    options: [
      { id: "pdf-q24-o1", optionText: "Single decision tree", isCorrect: false },
      { id: "pdf-q24-o2", optionText: "Collection of decision trees", isCorrect: true },
      { id: "pdf-q24-o3", optionText: "Clustering algorithm", isCorrect: false },
      { id: "pdf-q24-o4", optionText: "Neural network", isCorrect: false },
    ],
  },
  {
    id: "pdf-q25",
    competencyName: "AI & Machine Learning",
    questionText: "Which algorithm is commonly used for clustering?",
    difficulty: 1,
    explanation: "K-Means partitions data points into K clusters by minimizing distance to centroids.",
    options: [
      { id: "pdf-q25-o1", optionText: "Linear Regression", isCorrect: false },
      { id: "pdf-q25-o2", optionText: "Logistic Regression", isCorrect: false },
      { id: "pdf-q25-o3", optionText: "K-Means", isCorrect: true },
      { id: "pdf-q25-o4", optionText: "Random Forest", isCorrect: false },
    ],
  },

  // 7. Model Evaluation
  {
    id: "pdf-q26",
    competencyName: "AI & Machine Learning",
    questionText: "Which metric is particularly useful for evaluating classification models when false positives and false negatives have different importance?",
    difficulty: 2,
    explanation: "Precision (or Recall/F1 score) evaluates exact class errors when false alarms vs missed detections carry different costs.",
    options: [
      { id: "pdf-q26-o1", optionText: "Precision", isCorrect: true },
      { id: "pdf-q26-o2", optionText: "Accuracy only", isCorrect: false },
      { id: "pdf-q26-o3", optionText: "Mean Squared Error", isCorrect: false },
      { id: "pdf-q26-o4", optionText: "R²", isCorrect: false },
    ],
  },
  {
    id: "pdf-q27",
    competencyName: "AI & Machine Learning",
    questionText: "What does recall measure?",
    difficulty: 2,
    explanation: "Recall measures the proportion of actual positive samples correctly identified by the model (TP / (TP + FN)).",
    options: [
      { id: "pdf-q27-o1", optionText: "The proportion of predicted positives that are actually positive", isCorrect: false },
      { id: "pdf-q27-o2", optionText: "The proportion of actual positives correctly identified", isCorrect: true },
      { id: "pdf-q27-o3", optionText: "The total number of predictions", isCorrect: false },
      { id: "pdf-q27-o4", optionText: "The training time of the model", isCorrect: false },
    ],
  },

  // 8. Deep Learning
  {
    id: "pdf-q28",
    competencyName: "AI & Machine Learning",
    questionText: "Which component is commonly used as the basic computational unit of a neural network?",
    difficulty: 1,
    explanation: "A neuron (perceptron) multiplies inputs by weights, adds bias, and passes the sum through an activation function.",
    options: [
      { id: "pdf-q28-o1", optionText: "Neuron", isCorrect: true },
      { id: "pdf-q28-o2", optionText: "SQL query", isCorrect: false },
      { id: "pdf-q28-o3", optionText: "Decision tree", isCorrect: false },
      { id: "pdf-q28-o4", optionText: "DataFrame", isCorrect: false },
    ],
  },
  {
    id: "pdf-q29",
    competencyName: "AI & Machine Learning",
    questionText: "Which activation function is commonly used in hidden layers of modern neural networks?",
    difficulty: 2,
    explanation: "ReLU (Rectified Linear Unit: f(x) = max(0, x)) avoids vanishing gradients and is standard in hidden layers.",
    options: [
      { id: "pdf-q29-o1", optionText: "ReLU", isCorrect: true },
      { id: "pdf-q29-o2", optionText: "SELECT", isCorrect: false },
      { id: "pdf-q29-o3", optionText: "GROUP BY", isCorrect: false },
      { id: "pdf-q29-o4", optionText: "K-Means", isCorrect: false },
    ],
  },

  // 9. MLOps
  {
    id: "pdf-q30",
    competencyName: "AI & Machine Learning",
    questionText: "What is the primary purpose of deploying a machine learning model through an API?",
    difficulty: 2,
    explanation: "Deploying a model behind an API endpoint allows external applications to send payload data and receive real-time predictions.",
    options: [
      { id: "pdf-q30-o1", optionText: "To permanently change the training dataset", isCorrect: false },
      { id: "pdf-q30-o2", optionText: "To allow applications to send data to the model and receive predictions", isCorrect: true },
      { id: "pdf-q30-o3", optionText: "To remove the need for model training", isCorrect: false },
      { id: "pdf-q30-o4", optionText: "To convert Python into SQL", isCorrect: false },
    ],
  },
];

export const MOCK_QUESTIONS: QuizQuestion[] = ASSESSMENT_MCQ_BANK;

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
