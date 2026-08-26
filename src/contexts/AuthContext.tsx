import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  profile?: {
    fullName: string;
    department?: string;
    currentJobRole?: string;
    yearsOfExperience?: number;
    highestQualification?: string;
    fieldOfStudy?: string;
    age?: number;
  };
  fullName?: string;
  department?: string;
  currentJobRole?: string;
  yearsOfExperience?: number;
  highestQualification?: string;
  fieldOfStudy?: string;
  age?: number;
}

export interface CertificateItem {
  name: string;
  provider?: string;
  year?: string;
  url?: string;
}

export interface OnboardingData {
  fullName: string;
  age?: number;
  department: string;
  currentJobRole: string;
  currentAssignment?: string;
  yearsOfExperience?: number;
  highestQualification?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  hasWorkExperience?: boolean;
  targetCareerRole?: string;
  targetSector?: string;
  hasPreviousRole?: boolean;
  previousRole?: string;
  previousExperienceYears?: string;
  previousResponsibilities?: string;
  selectedSkills?: string[];
  skillProficiencies?: Record<string, string>;
  hasCertifications?: boolean;
  certificates?: CertificateItem[];
  learningGoal?: string;
  targetTimeline?: string;
  dailyLearningTime?: string;
  preferredLearningDays?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; isFirstTime: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    department?: string;
    currentJobRole?: string;
  }) => Promise<{ success: boolean; isFirstTime: boolean; error?: string }>;
  completeOnboarding: (data: OnboardingData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial registered demo emails & passwords
const DEFAULT_DEMO_ACCOUNTS: Record<string, string> = {
  "officer@kaushalsetu.gov.in": "Password123!",
  "admin@kaushalsetu.gov.in": "Password123!",
};

interface AccountDetails {
  fullName: string;
  password: string;
  department?: string;
  currentJobRole?: string;
  role: string;
}

function getRegisteredAccounts(): Record<string, AccountDetails> {
  try {
    const saved = localStorage.getItem("kaushalsetu_registered_accounts");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveRegisteredAccount(email: string, details: AccountDetails) {
  const accounts = getRegisteredAccounts();
  accounts[email.toLowerCase()] = details;
  localStorage.setItem("kaushalsetu_registered_accounts", JSON.stringify(accounts));
}

function normalizeUser(u: any): AuthUser | null {
  if (!u) return null;
  const fullName = u.fullName || u.profile?.fullName || "";
  const department = u.department || u.profile?.department || "";
  const currentJobRole = u.currentJobRole || u.profile?.currentJobRole || "";
  const yearsOfExperience = u.yearsOfExperience || u.profile?.yearsOfExperience;
  const highestQualification = u.highestQualification || u.profile?.highestQualification;
  const fieldOfStudy = u.fieldOfStudy || u.profile?.fieldOfStudy;
  const age = u.age || u.profile?.age;

  return {
    ...u,
    fullName: fullName || u.fullName,
    department: department || u.department,
    currentJobRole: currentJobRole || u.currentJobRole,
    yearsOfExperience: yearsOfExperience ?? u.yearsOfExperience,
    highestQualification: highestQualification ?? u.highestQualification,
    fieldOfStudy: fieldOfStudy ?? u.fieldOfStudy,
    age: age ?? u.age,
  };
}

export function checkIsOnboarded(u: AuthUser | null): boolean {
  if (!u) return false;
  const cleanEmail = u.email ? u.email.toLowerCase().trim() : "";
  if (cleanEmail && localStorage.getItem(`kaushalsetu_onboarded_${cleanEmail}`) === "true") return true;
  if (u.email && localStorage.getItem(`kaushalsetu_onboarded_${u.email}`) === "true") return true;
  if (u.id && localStorage.getItem(`kaushalsetu_onboarded_${u.id}`) === "true") return true;
  if (localStorage.getItem("kaushalsetu_onboarded_global") === "true") return true;
  if (u.profile || (u.currentJobRole && u.department && u.department !== "NSSO")) return true;
  return false;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("kaushalsetu_token"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("kaushalsetu_user");
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const savedUser = localStorage.getItem("kaushalsetu_user");
    if (!savedUser) return false;
    const u = normalizeUser(JSON.parse(savedUser));
    return checkIsOnboarded(u);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.data) {
            const userData = normalizeUser(data.data);
            setUser(userData);
            localStorage.setItem("kaushalsetu_user", JSON.stringify(userData));
            const onboarded = checkIsOnboarded(userData);
            setIsOnboarded(onboarded);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<{ success: boolean; isFirstTime: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();

      if (res.ok && data.data) {
        const authToken = data.data.token;
        const authUser = data.data.user;
        setToken(authToken);
        setUser(authUser);
        localStorage.setItem("kaushalsetu_token", authToken);
        localStorage.setItem("kaushalsetu_user", JSON.stringify(authUser));

        const onboarded = localStorage.getItem(`kaushalsetu_onboarded_${cleanEmail}`) === "true";
        setIsOnboarded(onboarded);
        setIsLoading(false);
        return { success: true, isFirstTime: !onboarded };
      }

      // Check API error messages
      if (res.status === 404 || (data && data.message && data.message.toLowerCase().includes("not found"))) {
        setIsLoading(false);
        return { success: false, isFirstTime: false, error: "Sign up first" };
      }
      if (res.status === 401 || (data && data.message && data.message.toLowerCase().includes("invalid"))) {
        setIsLoading(false);
        return { success: false, isFirstTime: false, error: "Invalid username or password" };
      }
    } catch {
      // Offline fallback check
    }

    // Offline / Fallback check against registered accounts
    const registeredAccounts = getRegisteredAccounts();
    const isDemoEmail = DEFAULT_DEMO_ACCOUNTS[cleanEmail] !== undefined;
    const isUserRegistered = isDemoEmail || Boolean(registeredAccounts[cleanEmail]);

    // Rule 1: If user hasn't registered beforehand -> "Sign up first"
    if (!isUserRegistered) {
      setIsLoading(false);
      return {
        success: false,
        isFirstTime: false,
        error: "Sign up first",
      };
    }

    // Rule 2: If registered but password invalid -> "Invalid username or password"
    const expectedPassword = isDemoEmail
      ? DEFAULT_DEMO_ACCOUNTS[cleanEmail]
      : registeredAccounts[cleanEmail]?.password;

    if (expectedPassword && password !== expectedPassword) {
      setIsLoading(false);
      return {
        success: false,
        isFirstTime: false,
        error: "Invalid username or password",
      };
    }

    const accountInfo = registeredAccounts[cleanEmail];
    const derivedName = cleanEmail.includes("admin")
      ? "System Administrator"
      : cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const authUser: AuthUser = {
      id: `u-${Date.now()}`,
      email: cleanEmail,
      role: cleanEmail.includes("admin") ? "admin" : "learner",
      fullName: accountInfo?.fullName || derivedName,
      department: accountInfo?.department || "National Sample Survey Office (NSSO)",
      currentJobRole: accountInfo?.currentJobRole || "Statistical Officer",
    };

    const authToken = "mock_jwt_token_2026";
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem("kaushalsetu_token", authToken);
    localStorage.setItem("kaushalsetu_user", JSON.stringify(authUser));

    const onboarded = localStorage.getItem(`kaushalsetu_onboarded_${cleanEmail}`) === "true";
    setIsOnboarded(onboarded);
    setIsLoading(false);
    return { success: true, isFirstTime: !onboarded };
  };

  const register = async (regData: {
    email: string;
    password: string;
    fullName: string;
    department?: string;
    currentJobRole?: string;
  }): Promise<{ success: boolean; isFirstTime: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = regData.email.toLowerCase().trim();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...regData, email: cleanEmail }),
      });
      const data = await res.json();

      let authUser: AuthUser;
      let authToken: string;

      if (res.ok && data.data) {
        authToken = data.data.token;
        authUser = data.data.user;
      } else if (res.status === 400 && data.message) {
        setIsLoading(false);
        return { success: false, isFirstTime: false, error: data.message };
      } else {
        authUser = {
          id: `u-${Date.now()}`,
          email: cleanEmail,
          role: "learner",
          fullName: regData.fullName,
          department: regData.department || "NSSO",
          currentJobRole: regData.currentJobRole || "Statistical Officer",
        };
        authToken = "mock_jwt_token_2026";
      }

      // Save to registered accounts registry with password
      saveRegisteredAccount(cleanEmail, {
        fullName: regData.fullName,
        password: regData.password,
        department: regData.department,
        currentJobRole: regData.currentJobRole,
        role: "learner",
      });

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem("kaushalsetu_token", authToken);
      localStorage.setItem("kaushalsetu_user", JSON.stringify(authUser));

      setIsOnboarded(false);
      setIsLoading(false);
      return { success: true, isFirstTime: true };
    } catch {
      const authUser: AuthUser = {
        id: `u-${Date.now()}`,
        email: cleanEmail,
        role: "learner",
        fullName: regData.fullName,
        department: regData.department || "NSSO",
        currentJobRole: regData.currentJobRole || "Statistical Officer",
      };
      const authToken = "mock_jwt_token_2026";

      // Save to registered accounts registry with password
      saveRegisteredAccount(cleanEmail, {
        fullName: regData.fullName,
        password: regData.password,
        department: regData.department,
        currentJobRole: regData.currentJobRole,
        role: "learner",
      });

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem("kaushalsetu_token", authToken);
      localStorage.setItem("kaushalsetu_user", JSON.stringify(authUser));
      setIsOnboarded(false);
      setIsLoading(false);
      return { success: true, isFirstTime: true };
    }
  };

  const completeOnboarding = async (data: OnboardingData): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);

    try {
      if (token && token !== "mock_jwt_token_2026") {
        await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      }
    } catch {
      // Ignore API errors for offline fallback
    }

    const updatedUser: AuthUser = {
      ...user,
      fullName: data.fullName,
      department: data.department,
      currentJobRole: data.currentJobRole || data.targetCareerRole,
      yearsOfExperience: data.yearsOfExperience,
      highestQualification: data.highestQualification,
      fieldOfStudy: data.fieldOfStudy,
      age: data.age,
    };

    const cleanEmail = (user.email || "").toLowerCase().trim();

    setUser(updatedUser);
    localStorage.setItem("kaushalsetu_user", JSON.stringify(updatedUser));
    if (cleanEmail) localStorage.setItem(`kaushalsetu_onboarded_${cleanEmail}`, "true");
    if (user.email) localStorage.setItem(`kaushalsetu_onboarded_${user.email}`, "true");
    if (user.id) localStorage.setItem(`kaushalsetu_onboarded_${user.id}`, "true");
    localStorage.setItem("kaushalsetu_onboarded_global", "true");
    localStorage.setItem(`kaushalsetu_user_goals_${user.id}`, JSON.stringify(data));
    if (cleanEmail) localStorage.setItem(`kaushalsetu_user_goals_${cleanEmail}`, JSON.stringify(data));
    setIsOnboarded(true);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsOnboarded(false);
    localStorage.removeItem("kaushalsetu_token");
    localStorage.removeItem("kaushalsetu_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isOnboarded,
        isLoading,
        login,
        register,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
