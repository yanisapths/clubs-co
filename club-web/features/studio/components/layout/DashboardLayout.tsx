// DashboardLayout.tsx
import { AppSidebar } from "./AppSideBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div>
      <div className="bg-black flex h-full w-full overflow-hidden">
        <AppSidebar />

        <main className="ml-16 min-h-screen flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
