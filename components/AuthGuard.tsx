'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/clerk-helpers";

interface AuthGuardProps {
  role: UserRole | null | undefined;
  required: UserRole | UserRole[];
  redirectTo?: string;
  children: React.ReactNode;
}

export default function AuthGuard({
  role,
  required,
  redirectTo = "/",
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const allowed = Array.isArray(required) ? required : [required];
  const hasAccess = role != null && allowed.includes(role);

  useEffect(() => {
    if (!hasAccess) {
      router.replace(redirectTo);
    }
  }, [hasAccess, redirectTo, router]);

  if (!hasAccess) return null;
  return <>{children}</>;
}
