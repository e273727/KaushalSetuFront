import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Learning from "@/pages/Learning";
import Quizzes from "@/pages/Quizzes";
import QuizGenerator from "@/pages/QuizGenerator";
import Roadmap from "@/pages/Roadmap";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth, checkIsOnboarded } from "./contexts/AuthContext";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isOnboarded, user } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const isActuallyOnboarded = isOnboarded || checkIsOnboarded(user);

  if (!isActuallyOnboarded) {
    return <Redirect to="/onboarding" />;
  }

  return <Component />;
}

function RootRoute() {
  const { isAuthenticated, isOnboarded, user } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const isActuallyOnboarded = isOnboarded || checkIsOnboarded(user);

  if (!isActuallyOnboarded) {
    return <Redirect to="/onboarding" />;
  }

  return <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Auth} />
      <Route path="/register" component={Auth} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/learning" component={() => <ProtectedRoute component={Learning} />} />
      <Route path="/quizzes" component={() => <ProtectedRoute component={Quizzes} />} />
      <Route path="/assessments" component={() => <ProtectedRoute component={Quizzes} />} />
      <Route path="/quiz-generator" component={() => <ProtectedRoute component={Quizzes} />} />
      <Route path="/roadmap" component={() => <ProtectedRoute component={Roadmap} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
