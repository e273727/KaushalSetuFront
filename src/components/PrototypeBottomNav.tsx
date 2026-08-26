import { Link } from "wouter";

type ActiveRoute = "dashboard" | "roadmap" | "quizzes" | "learning";

type PrototypeBottomNavProps = {
  active: ActiveRoute;
};

const items: Array<{ route: ActiveRoute; href: string; icon: string; label: string }> = [
  { route: "dashboard", href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { route: "roadmap", href: "/roadmap", icon: "map", label: "Roadmap" },
  { route: "quizzes", href: "/quizzes", icon: "quiz", label: "Quizzes" },
  { route: "learning", href: "/learning", icon: "school", label: "Learning" },
];

export default function PrototypeBottomNav({ active }: PrototypeBottomNavProps) {
  return (
    <nav className="bg-surface-container-lowest dark:bg-surface-container-highest fixed bottom-0 w-full z-50 md:hidden border-t border-outline-variant flat no shadows flex justify-around items-center h-16 pb-safe pb-4 pt-2">
      {items.map((item) => {
        const isActive = item.route === active;
        return (
          <Link
            key={item.route}
            href={item.href}
            className={`flex flex-col items-center justify-center ${isActive ? "text-primary dark:text-primary-fixed font-bold" : "text-on-secondary-container dark:text-on-secondary-fixed-variant"} active:bg-surface-variant scale-95 transition-transform flex-1 h-full rounded-lg`}
          >
            <span
              className="material-symbols-outlined"
              data-icon={item.icon}
              {...(isActive ? { style: { fontVariationSettings: "'FILL' 1" } } : {})}
            >
              {item.icon}
            </span>
            <span className="font-label-sm text-label-sm mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
