'use client';

import { SignIn } from "@clerk/nextjs";
import Logo from "@/components/Logo";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-deep-navy">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl bg-electric-blue pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <div className="flex flex-col items-center gap-3">
          <Logo size={48} />
          <h1 className="text-xl font-semibold text-soft-gray">CAS Incubator OS</h1>
        </div>

        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#2563EB",
              colorBackground: "#0F1A3A",
              colorText: "#E6E9EE",
              colorTextSecondary: "#9CA3AF",
              colorInputBackground: "#0A1330",
              colorInputText: "#E6E9EE",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full",
              card: "bg-[#0F1A3A] border border-white/10 shadow-xl shadow-black/40 rounded-2xl",
              headerTitle: "text-soft-gray font-bold",
              headerSubtitle: "text-soft-gray/60",
              formButtonPrimary:
                "bg-electric-blue hover:bg-electric-blue/90 text-white font-semibold",
              footerActionLink: "text-electric-blue hover:text-vivid-teal",
              identityPreviewText: "text-soft-gray",
              dividerLine: "bg-white/10",
              dividerText: "text-soft-gray/40",
            },
          }}
        />
      </div>
    </main>
  );
}
