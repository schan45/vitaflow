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
      <body className="bg-black text-white flex justify-center">
        <AuthProvider>
          <SettingsProvider>
            <OnboardingProvider>
              <GoalProvider>
                <div className="relative w-full max-w-md min-h-screen bg-gradient-to-b from-slate-900 to-black overflow-hidden pb-28">
                  {children}
                  <BottomNav />
                </div>
              </GoalProvider>
            </OnboardingProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
