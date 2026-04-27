'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import AssignWorksheetModal from "./AssignWorksheetModal";

interface Props {
  label?: string;
}

export default function AssignNewWorksheetButton({ label = "Assign New Worksheet" }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-electric-blue text-white text-sm font-semibold px-4 py-2 hover:bg-electric-blue/90 transition-colors"
      >
        <Plus size={14} />
        {label}
      </button>

      {open && (
        <AssignWorksheetModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
