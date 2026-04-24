import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("brand");
  return {
    title: t("name"),
    description: t("tagline"),
  };
}

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: "/admin",
  teacher: "/teacher",
  mentor: "/mentor",
  student: "/student",
  parent: "/parent",
};

function HeroSection({ dashboardHref }: { dashboardHref: string | null }) {
  const t = useTranslations("landing.hero");
  const tBrand = useTranslations("brand");
  const tCommon = useTranslations("common");
  const tDash = useTranslations("landing");

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-electric-blue" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl bg-vivid-teal" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-8 blur-3xl bg-violet" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-10">
          <Logo size={72} />
        </div>

        <p className="text-electric-blue text-sm font-semibold tracking-widest uppercase mb-4">
          {tBrand("name")}
        </p>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 gradient-text">
          {t("title")}
        </h1>

        <p className="text-soft-gray/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="px-8 py-4 rounded-xl font-semibold text-white bg-electric-blue hover:bg-electric-blue/90 transition-all duration-200 shadow-lg shadow-electric-blue/25 hover:shadow-electric-blue/40 hover:-translate-y-0.5"
            >
              {tDash("goToDashboard")}
            </Link>
          ) : (
            <>
              <Link
                href="/join"
                className="px-8 py-4 rounded-xl font-semibold text-white bg-electric-blue hover:bg-electric-blue/90 transition-all duration-200 shadow-lg shadow-electric-blue/25 hover:shadow-electric-blue/40 hover:-translate-y-0.5"
              >
                {t("cta")}
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-4 rounded-xl font-semibold text-soft-gray border border-soft-gray/20 hover:border-soft-gray/40 hover:bg-white/5 transition-all duration-200"
              >
                {tCommon("signIn")}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-soft-gray/30 text-xs">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-electric-blue/60" />
      </div>
    </section>
  );
}

function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: "◈",
      title: "Structured Method",
      description:
        "10-stage incubation method guiding students from problem discovery to prototype launch.",
      color: "text-electric-blue",
    },
    {
      icon: "⬡",
      title: "AI-Powered Guidance",
      description:
        "Intelligent assistant helps students refine ideas, craft value propositions, and plan MVPs.",
      color: "text-vivid-teal",
    },
    {
      icon: "◇",
      title: "Mentor Network",
      description:
        "Connect with experienced mentors who provide real-world perspective and feedback.",
      color: "text-violet",
    },
    {
      icon: "◎",
      title: "Project Showcase",
      description:
        "Present completed projects to peers, parents, and potential opportunities.",
      color: "text-incubator-gold",
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          {t("h2")}
        </h2>
        <p className="text-soft-gray/50 text-center mb-16 max-w-xl mx-auto">
          From first spark to final showcase — every stage, structured.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 transition-all duration-200 group"
            >
              <div className={`text-3xl mb-4 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-soft-gray">
                {feature.title}
              </h3>
              <p className="text-soft-gray/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StagesSection() {
  const stages = [
    { num: "01", name: "Interest Discovery" },
    { num: "02", name: "Problem Definition" },
    { num: "03", name: "Target User" },
    { num: "04", name: "Existing Solutions" },
    { num: "05", name: "Value Proposition" },
    { num: "06", name: "MVP Scoping" },
    { num: "07", name: "Build Plan" },
    { num: "08", name: "Prototype Development" },
    { num: "09", name: "Testing & Revision" },
    { num: "10", name: "Project Story" },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          The 10-Stage Incubation Method
        </h2>
        <p className="text-soft-gray/50 text-center mb-12 max-w-xl mx-auto text-sm">
          A research-backed journey from curiosity to creation.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {stages.map((stage, i) => (
            <div
              key={stage.num}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/3 text-sm"
              style={{
                borderColor: `hsl(${200 + i * 15}, 70%, 50%, 0.3)`,
              }}
            >
              <span className="text-electric-blue/70 font-mono text-xs">
                {stage.num}
              </span>
              <span className="text-soft-gray/80">{stage.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const tLanding = useTranslations("landing");
  const tBrand = useTranslations("brand");

  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <span className="font-semibold text-soft-gray/80 text-sm">
            {tBrand("name")}
          </span>
        </div>

        <p className="text-soft-gray/30 text-xs text-center max-w-sm">
          {tLanding("disclaimer")}
        </p>

        <div className="flex items-center gap-4 text-xs text-soft-gray/40">
          <a href="/docs/LEGAL/terms.md" className="hover:text-soft-gray/70 transition-colors">
            Terms
          </a>
          <a href="/docs/LEGAL/privacy.md" className="hover:text-soft-gray/70 transition-colors">
            Privacy
          </a>
          <span>© {new Date().getFullYear()} CAS Incubator OS</span>
        </div>
      </div>
    </footer>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const dashboardHref = user?.role ? (ROLE_DASHBOARD[user.role] ?? null) : null;

  return (
    <main>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-deep-navy/80 backdrop-blur-md border-b border-white/5">
        <Logo size={32} />
        <LanguageSwitcher />
      </nav>

      <HeroSection dashboardHref={dashboardHref} />
      <FeaturesSection />
      <StagesSection />
      <Footer />
    </main>
  );
}
