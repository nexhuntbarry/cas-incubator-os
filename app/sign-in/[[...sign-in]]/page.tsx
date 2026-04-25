'use client';

import { useEffect, useState } from "react";
import { SignIn, useClerk } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Logo from "@/components/Logo";

// Clerk Account Portal — works regardless of dev/live instance config.
// Used as fallback if the embedded <SignIn /> fails to mount within 3s.
const CLERK_HOSTED_SIGN_IN =
  "https://uncommon-griffon-50.accounts.dev/sign-in?redirect_url=" +
  encodeURIComponent(
    typeof window !== "undefined" ? window.location.origin : "https://incubator.nexhunt.xyz"
  );

export default function SignInPage() {
  const clerk = useClerk();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // If Clerk hasn't loaded the SignIn UI within 3s, surface the hosted fallback.
    const timer = setTimeout(() => {
      const mounted = document.querySelector(".cl-signIn-root, [data-clerk-component]");
      if (!mounted) {
        // eslint-disable-next-line no-console
        console.warn("[sign-in] Clerk SignIn did not mount within 3s; showing fallback link.", {
          clerkLoaded: clerk?.loaded,
          publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.slice(0, 12),
        });
        setShowFallback(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [clerk]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-deep-navy">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl bg-electric-blue pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <div className="flex flex-col items-center gap-3">
          <Logo size={48} />
          <h1 className="text-xl font-semibold text-white">CAS Incubator OS</h1>
        </div>

        <SignIn
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#2563EB",
              colorBackground: "#0F1A3A",
              colorText: "#F1F5F9",
              colorTextSecondary: "#CBD5E1",
              colorInputBackground: "#0A1330",
              colorInputText: "#F8FAFC",
              colorNeutral: "#F1F5F9",
              borderRadius: "0.75rem",
              fontFamily: "var(--font-plus-jakarta-sans), system-ui, sans-serif",
            },
            elements: {
              rootBox: "w-full",
              card: "bg-[#0F1A3A] border border-white/10 shadow-xl shadow-black/40 rounded-2xl",
              headerTitle: "text-white font-bold text-xl",
              headerSubtitle: "text-slate-300",
              socialButtonsBlockButton:
                "bg-white/5 border border-white/15 text-white hover:bg-white/10",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/15",
              dividerText: "text-slate-300",
              formFieldLabel: "text-slate-200 font-medium",
              formFieldInput:
                "bg-[#0A1330] border border-white/15 text-white placeholder:text-slate-500",
              formButtonPrimary:
                "bg-electric-blue hover:bg-electric-blue/90 text-white font-semibold",
              footer: "bg-transparent",
              footerAction__signIn: "text-slate-300",
              footerActionText: "text-slate-300",
              footerActionLink: "text-electric-blue hover:text-vivid-teal font-semibold",
              footerPages: "text-slate-400",
              footerPagesLink: "text-slate-400 hover:text-slate-200",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-electric-blue",
              alertText: "text-slate-200",
              formResendCodeLink: "text-electric-blue",
            },
          }}
        />

        {showFallback && (
          <div className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-center space-y-3">
            <p className="text-sm text-slate-300">
              登入表單載入失敗，請使用備用登入頁面：
              <br />
              <span className="text-xs text-slate-400">
                Sign-in form failed to load. Use the hosted page instead:
              </span>
            </p>
            <a
              href={CLERK_HOSTED_SIGN_IN}
              className="inline-block px-6 py-3 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors"
            >
              開啟登入頁面 / Open sign-in
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
