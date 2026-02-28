import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { GoalProvider } from "@/context/GoalContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full bg-black text-white">
        <AuthProvider>
          <SettingsProvider>
            <OnboardingProvider>
              <GoalProvider>
                <div className="app-root">
                  <div className="app-shell">
                    <main className="app-screen">{children}</main>
                    <BottomNav />
                  </div>
                </div>
              </GoalProvider>
            </OnboardingProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
