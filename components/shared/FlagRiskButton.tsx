'use client';

import { useState } from "react";
import { Flag } from "lucide-react";
import RiskFlagModal from "./RiskFlagModal";

interface Props {
  studentUserId: string;
  studentName: string;
  projectId?: string;
}

export default function FlagRiskButton({ studentUserId, studentName, projectId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-sm font-medium hover:bg-yellow-500/25 transition-colors min-h-[44px]"
      >
        <Flag size={14} />
        Flag Risk
      </button>

      {open && (
        <RiskFlagModal
          studentUserId={studentUserId}
          studentName={studentName}
          projectId={projectId}
          onClose={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      )}
    </>
  );
}
