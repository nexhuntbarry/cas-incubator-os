'use client';

import { useState } from "react";
import { X, ChevronRight, Rocket, BookOpen, HelpCircle } from "lucide-react";

interface Step {
  icon: React.ReactNode;
  title: string;
  body: string;
}

interface Props {
  role: string;
  displayName: string;
}

function getSteps(role: string): Step[] {
  const step3: Step = {
    icon: <HelpCircle size={28} className="text-vivid-teal" />,
    title: "Need help?",
    body: "Check the Resources tab any time for guides, templates, and support. You can also reach out to your mentor or teacher directly.",
  };

  if (role === "student") {
    return [
      {
        icon: <Rocket size={28} className="text-electric-blue" />,
        title: "Welcome to CAS Incubator OS",
        body: "This is your project-based learning hub. You'll work through the CAS Method stages — from idea discovery all the way to your final showcase.",
      },
      {
        icon: <BookOpen size={28} className="text-violet" />,
        title: "Complete your intake to get started",
        body: "Head to your dashboard and fill out the intake form. It helps us match you with the right cohort and mentor for your project journey.",
      },
      step3,
    ];
  }

  if (role === "teacher") {
    return [
      {
        icon: <Rocket size={28} className="text-gold" />,
        title: "Welcome to CAS Incubator OS",
        body: "You're set up as a Teacher. You can monitor student projects, review worksheets, manage rubrics, and track progress across your cohorts.",
      },
      {
        icon: <BookOpen size={28} className="text-violet" />,
        title: "Explore your projects",
        body: "Head to the Projects section to see all students under your supervision. You can flag risks, review worksheets, and communicate with parents.",
      },
      step3,
    ];
  }

  if (role === "mentor") {
    return [
      {
        icon: <Rocket size={28} className="text-vivid-teal" />,
        title: "Welcome to CAS Incubator OS",
        body: "You're set up as a Mentor. You'll review student worksheets, evaluate rubrics, approve checkpoints, and leave notes on student progress.",
      },
      {
        icon: <BookOpen size={28} className="text-violet" />,
        title: "Start reviewing worksheets",
        body: "Open the Worksheet Queue to see pending submissions. Give structured AI-assisted feedback and help students level up their projects.",
      },
      step3,
    ];
  }

  if (role === "super_admin") {
    return [
      {
        icon: <Rocket size={28} className="text-electric-blue" />,
        title: "Welcome, Admin",
        body: "You have full access to CAS Incubator OS. Manage programs, cohorts, users, rubrics, and monitor everything from the Analytics dashboard.",
      },
      {
        icon: <BookOpen size={28} className="text-violet" />,
        title: "Set up your first cohort",
        body: "Go to Cohorts to create a cohort, then add students via Class Codes. Assign teachers and mentors from the Users page.",
      },
      step3,
    ];
  }

  // parent / fallback
  return [
    {
      icon: <Rocket size={28} className="text-electric-blue" />,
      title: "Welcome to CAS Incubator OS",
      body: "You're connected as a Parent. You'll receive updates on your child's project progress and can view their latest milestones here.",
    },
    {
      icon: <BookOpen size={28} className="text-violet" />,
      title: "View progress updates",
      body: "Head to the Updates section to read the latest reports from teachers and mentors about your student's project journey.",
    },
    step3,
  ];
}

export default function OnboardingTour({ role, displayName }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const steps = getSteps(role);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  async function handleClose() {
    setVisible(false);
    try {
      await fetch("/api/onboarding/complete", { method: "POST" });
    } catch {
      // non-blocking
    }
  }

  async function handleNext() {
    if (isLast) {
      await handleClose();
    } else {
      setStep((s) => s + 1);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-deep-navy border border-white/10 rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-soft-gray/40 hover:text-soft-gray transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-200 ${
                i <= step ? "bg-electric-blue flex-[2]" : "bg-white/15 flex-1"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
            {current.icon}
          </div>
          <h2 className="text-xl font-bold text-soft-gray">{current.title}</h2>
          {step === 0 && (
            <p className="text-sm text-electric-blue font-medium">
              Hey {displayName.split(" ")[0]}!
            </p>
          )}
          <p className="text-sm text-soft-gray/70 leading-relaxed">{current.body}</p>
        </div>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-soft-gray/60 text-sm hover:text-soft-gray hover:border-white/20 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors flex items-center justify-center gap-2"
          >
            {isLast ? "Get started" : "Next"}
            {!isLast && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
